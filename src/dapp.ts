import fsPromises from "fs/promises";
import utils from "./utils";
import { apiCall } from "./caller";
import { jsonParamSetSchema } from "./validators";
import {
  getInputFilePath,
  extractDataset,
  extractApiKey,
} from "./requestConsistency";
import { encodeValue } from "./resultEncoder";
import { ethers } from "ethers";
import { triggerMultiFowardRequest } from "./forward/forwardHandler";

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
  const requestedChainIds =
    process.argv.length > 2
      ? // Parse chainIds, sort them, remove duplicates, cast them from string to number
        Array.from(new Set(process.argv[4].split(",").sort()), Number) //TODO: Only works in tests, update to 2
      : undefined;
  if (requestedChainIds) {
    console.log("Crosschain requested [chains:%s]", requestedChainIds);
    const isCrossChainRequestSent = await triggerMultiFowardRequest(
      requestedChainIds,
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
