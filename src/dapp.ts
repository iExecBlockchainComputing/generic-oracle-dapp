import fsPromises from "fs/promises";
import utils from "./utils";
import { getWalletOnProvider } from "../src/contractLoader";
import { apiCall } from "./caller";
import { jsonParamSetSchema } from "./validators";
import {
  getInputFilePath,
  extractDataset,
  extractApiKey,
} from "./requestConsistency";
import { encodeValue } from "./resultEncoder";
import { ethers, Wallet } from "ethers";
import { getSignedForwardRequest } from "./getSignedForwardRequest";
import { postMultiForwardRequest } from "./postMultiForwardRequest";

export const forwarderApiUrl = "http://localhost:3000";
// Goerli
export const goerliForwarderAddress =
  "0xc83de370A0D1C99F3D3D9e77bd930520ded81fFA";
export const goerliOracleReceiver =
  "0x8Ad317241854b1A29A06cE5478e6B92FA09Cd03a";
export const supportedTargetChainIds = [
  5, // goerli
];
const supportedTargetChainId = supportedTargetChainIds[0];
//TODO: Use same structure for things related to a chain

const start = async () => {
  const inputFolder = process.env.IEXEC_IN;
  let inputFilePath;
  try {
    inputFilePath = getInputFilePath(
      inputFolder,
      process.env.IEXEC_INPUT_FILE_NAME_1,
      process.env.IEXEC_INPUT_FILES_NUMBER
    );
  } catch (e) {
    console.error("Failed to get input file [e:%s]", e);
    return undefined;
  }
  const validatedInputJSON = await jsonParamSetSchema().validate(
    (await fsPromises.readFile(inputFilePath)).toString()
  );
  const paramSet = JSON.parse(validatedInputJSON);
  const dataset = await extractDataset(
    inputFolder,
    process.env.IEXEC_DATASET_FILENAME
  );
  if (dataset !== undefined)
    dataset.address = process.env.IEXEC_DATASET_ADDRESS;
  const apiKey = extractApiKey(paramSet, dataset);
  const headersTable = Object.entries(utils.sortObjKeys(paramSet.headers));

  const oracleId = ethers.utils.solidityKeccak256(
    ["string", "string", "string", "address", "string[][]", "string", "string"],
    [
      paramSet.JSONPath,
      paramSet.body,
      paramSet.dataType,
      paramSet.dataset,
      headersTable,
      paramSet.method,
      paramSet.url,
    ]
  );

  const { value, date } = await apiCall({
    url: paramSet.url,
    method: paramSet.method,
    headers: paramSet.headers,
    body: paramSet.body,
    apiKey,
    JSONPath: paramSet.JSONPath,
    dataType: paramSet.dataType,
  });
  console.log(
    "Received response from API [url:%s, date:%s, value:%s]",
    paramSet.url,
    new Date(date * 1000),
    value
  );

  let encodedValue: string;
  try {
    encodedValue = encodeValue(value, date, paramSet.dataType, oracleId);
  } catch (e) {
    console.error("Failed to encode value [e:%s]", e);
    return undefined;
  }

  // `node app.ts bla` (0, 1, 2)
  console.log(process.argv);
  if (
    process.argv.length > 2 &&
    Number(process.argv[4]) == supportedTargetChainId //TODO: Only works in tests, update to 2
  ) {
    const isCrossChainRequestSent = await triggerMultiFowardRequest(
      supportedTargetChainId,
      oracleId,
      encodedValue
    );
    // Status is logged for information purpose only (app must go on on failure)
    console.log(
      "isCrossChainRequestSent status [status:%s]",
      isCrossChainRequestSent
    );
  }
  return encodedValue;
};
export default start;

async function triggerMultiFowardRequest(
  targetChainId: number,
  oracleId: string,
  encodedValue: string
) {
  const taskId = process.env.IEXEC_TASK_ID;
  if (taskId == undefined) {
    console.error("[IEXEC] IEXEC_TASK_ID is missing");
    return false;
  }
  let wallet: Wallet;
  try {
    // validate args or exit before going further
    wallet = getWalletOnProvider(
      targetChainId,
      process.env.IEXEC_APP_DEVELOPER_SECRET
    );
  } catch (e) {
    console.error("Failed to load ClassicOracle from encoded args [e:%s]", e);
    return false;
  }
  const signedForwardRequest = await getSignedForwardRequest(
    wallet,
    taskId,
    oracleId,
    encodedValue
  );

  const multiForwardRequest = {
    requests: [signedForwardRequest],
  };

  console.log(JSON.stringify(multiForwardRequest));

  return await postMultiForwardRequest(multiForwardRequest, oracleId, taskId);
}
