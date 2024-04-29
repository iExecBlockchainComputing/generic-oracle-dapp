import fsPromises from "fs/promises";
import utils from "./utils";
import { apiCall } from "./caller";
import { jsonParamSetSchema, targetChainsSchema } from "./validators";
import {
  getInputFilePath,
  extractDataset,
  extractApiKey,
} from "./requestConsistency";
import { encodeValue } from "./resultEncoder";
import { ethers } from "ethers";
import { triggerForwardRequests } from "./forward/forwardHandler";

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

  let encodedValue: string;
  try {
    encodedValue = encodeValue(value, date, paramSet.dataType, oracleId);
  } catch (e) {
    console.error("Failed to encode value [e:%s]", e);
    return undefined;
  }

  // Native command line arguments - 0:node, 1:app.ts, 2:arg1
  const requestedChainIds = await targetChainsSchema().validate(
    process.argv[2]
  );
  if (requestedChainIds) {
    console.log(
      "User requesting updates on foreign blockchains [chains:%s]",
      requestedChainIds
    );
    const allForwardRequestsAccepted = await triggerForwardRequests(
      requestedChainIds,
      oracleId,
      encodedValue
    );
    // Status is logged for information purpose only (app must go on on failure)
    if (allForwardRequestsAccepted) {
      console.log("All forward requests accepted by Forwarder API");
    } else {
      console.error("At least one forward request rejected by Forwarder API");
    }
  }
  return encodedValue;
};
export default start;
