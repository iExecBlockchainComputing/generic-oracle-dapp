const fsPromises = require('fs').promises;
const fetch = require('node-fetch');
const solidityKeccak256 = require('@ethersproject/solidity').keccak256;
const jp = require('jsonpath');
const occurrences = require('utils').occurrences;


(async () => {
  try {

    const inputsRoot = process.env.IEXEC_INPUT_FILES_FOLDER;
    const inputFilePath = process.env.IEXEC_INPUT_FILE_NAME_0;
    const outputRoot = process.env.IEXEC_OUT;

    switch (process.env.IEXEC_NB_INPUT_FILES) {
      case 0:
        throw "Paramset missing in input files";
      case 1:
        break;
      default:
        throw "Several input files detected while expected one";
    }

    let paramSet = JSON.parse(await fsPromises.readFile(inputsRoot + inputFilePath));
    const apiKeyPlaceHolder = "%API_KEY%";
    let apiKey;
    const datasetAddress = "0x0000000000000000000000000000000000000001";
    const datasetPath = "dataset.json";
    const headersTable = Object.entries(paramSet.headers);
    const isDatasetPresent = datasetAddress !== "0x0000000000000000000000000000000000000000";
    const callId = solidityKeccak256(['string', 'string[][]', 'string', 'string'],
      [paramSet.body, headersTable, paramSet.method, paramSet.url])
    const oracleId = solidityKeccak256(['string', 'string', 'string', 'address', 'string[][]', 'string', 'string'],
      [paramSet.JSONPath, paramSet.body, paramSet.dataType, paramSet.dataset, headersTable, paramSet.method, paramSet.url]);

    if (callId !== dataset.callId) throw "Computed callId does not match dataset's callId";

      /* 
    Checking if Dataset is here and replace the API key 
    */
    if (isDatasetPresent) {
        try {
          apiKey = JSON.parse((await fsPromises.readFile(inputsRoot + datasetPath))).apiKey;
        } catch (e) {
          throw "Could not read the data set : " + e;
        }
      }

    let keyCount = 0;
    keyCount += occurrences(paramSet.url, apiKeyPlaceHolder);
    if (isDatasetPresent) paramSet.url = paramSet.url.replace(apiKeyPlaceHolder, apiKey);

    for (let [key, value] of headersTable) {
      if (typeof value === "string") {
        keyCount += occurrences(value, apiKeyPlaceHolder);
        if (isDatasetPresent && keyCount == 1) {
          paramSet.headers[key] = value.replace(apiKeyPlaceHolder, apiKey);
        }
      }
    }

    switch (keyCount) {
      case 0:
        if (isDatasetPresent) throw "Dataset was provided without any api key placeholder to replace"
        break;
      case 1:
        if (!isDatasetPresent) throw "Api key placeholder was found but no Dataset was provided"
        break;
      default:
        throw "Several api key placeholder were found while " + isDatasetPresent ? 1 : 0 + " was expected";
    }

    let urlObject = new URL(paramSet.url);

    if (urlObject.protocol !== "https:") {
      throw "Url must use the https protocol"
    };

    let res = await fetch(paramSet.url, {
      method: paramSet.method,
      body: (paramSet.body === "" ? null : paramSet.body),
      headers: paramSet.headers
    });

    const value = jp.query(res, paramSet.JSONPath);

    if (typeof value[0] === "object" || value.length !== 1) throw "The value extracted from the JSON response should be a primitve."; 

    // Declare everything is computed
    const computedJsonObj = {
      'callback-data': value // WIP - TODO
    };
    await fsPromises.writeFile(
      `${outputRoot}/computed.json`,
      JSON.stringify(computedJsonObj),
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();