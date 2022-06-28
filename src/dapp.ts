import fsPromises from "fs/promises";
import utils from "./utils";
import { ContractLoader } from "./contractLoader";
import { apiCall } from "./caller";
import { jsonParamSetSchema } from "./validators";
import {
  getInputFilePath,
  extractDataset,
  extractApiKey,
} from "./requestConsistency";
import { encodeValue } from "./resultEncoder";
import { ethers } from "ethers";

const start = async () => {
  let classicOracle;
  try {
    // validate args or exit before going further
    classicOracle = ContractLoader.loadClassicOracle(
      process.env.IEXEC_APP_DEVELOPER_SECRET
    );
  } catch (e) {
    console.error("Failed to load ClassicOracle from encoded args [e:%s]", e);
    return undefined;
  }
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

  try {
    const tx = await classicOracle.receiveResult(oracleId, encodedValue);
    console.log(
      "Sent transaction to targeted oracle [tx:%s, oracleId:%s, encodedValue:%s]",
      tx.hash,
      oracleId,
      encodedValue
    );
    const receipt = await tx.wait();
    if (receipt.blockNumber) {
      console.log(
        "Mined transaction for targeted oracle [tx:%s, blockNumber:%s, oracleId:%s]",
        tx.hash,
        receipt.blockNumber,
        oracleId
      );
      return encodedValue;
    } else {
      console.error("Failed transaction on targeted oracle [tx:%s]", tx.hash);
    }
  } catch (e) {
    console.error("Failed to send transaction [e:%s]", e);
  }
  return undefined;
};
export default start;
