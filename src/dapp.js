const fsPromises = require('fs').promises;
const path = require('path');
const ethers = require('ethers');
const utils = require('./utils');
const { apiCall } = require('./caller');
const { jsonParamSetSchema } = require('./validators');
const { nbFileChecker, extractDataset, extractApiKey } = require('./requestConsistency');
const { encodeValue } = require('./resultEncoder');

module.exports = async () => {
  const inputFilePath = path.join(
    process.env.IEXEC_INPUT_FILES_FOLDER,
    process.env.IEXEC_INPUT_FILE_NAME_1,
  );
  const outputRoot = process.env.IEXEC_OUT;

  nbFileChecker(process.env.IEXEC_NB_INPUT_FILES);

  const validatedInputJSON = await jsonParamSetSchema()
    .validate((await fsPromises.readFile(inputFilePath)).toString());
  const paramSet = JSON.parse(validatedInputJSON);
  const dataset = await extractDataset(process.env.IEXEC_IN, process.env.IEXEC_DATASET_FILENAME);
  dataset.address = process.env.IEXEC_DATASET_ADDRESS;
  const apiKey = extractApiKey(paramSet, dataset);
  const headersTable = Object.entries(utils.sortObjKeys(paramSet.headers));

  const oracleId = ethers.utils.solidityKeccak256(
    ['string', 'string', 'string', 'address', 'string[][]', 'string', 'string'],
    [
      paramSet.JSONPath,
      paramSet.body,
      paramSet.dataType,
      paramSet.dataset,
      headersTable,
      paramSet.method,
      paramSet.url,
    ],
  );

  const extractedValue = await apiCall({
    url: paramSet.url,
    method: paramSet.method,
    headers: paramSet.headers,
    body: paramSet.body,
    apiKey,
    JSONPath: paramSet.JSONPath,
    dataType: paramSet.dataType,
  });

  const encodedValue = encodeValue(extractedValue, paramSet.dataType, oracleId);

  // Declare everything is computed
  const computedJsonObj = {
    'callback-data': encodedValue,
  };
  await fsPromises.writeFile(
    `${outputRoot}/computed.json`,
    JSON.stringify(computedJsonObj),
  );
};
