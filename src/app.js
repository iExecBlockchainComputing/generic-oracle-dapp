const fsPromises = require('fs').promises;
const fetch = require('node-fetch');
const ethers = require('ethers');
const jp = require('jsonpath');
const utils = require('./utils');

(async () => {
  try {
    const apiKeyPlaceHolder = '%API_KEY%';
    const inputsRoot = process.env.IEXEC_INPUT_FILES_FOLDER;
    const inputFilePath = process.env.IEXEC_INPUT_FILE_NAME_0;
    const outputRoot = process.env.IEXEC_OUT;
    const datasetPath = `${inputsRoot}/${process.env.IEXEC_DATASET_FILENAME}`;

    switch (process.env.IEXEC_NB_INPUT_FILES) {
      case 0:
        throw Error('Paramset missing in input files');
      case 1:
        break;
      default:
        throw Error('Several input files detected while expected one');
    }

    const paramSet = JSON.parse(await fsPromises.readFile(inputsRoot + inputFilePath));
    let apiKey = '';
    const headersTable = utils.sortObjKeys(Object.entries(paramSet.headers));
    const isDatasetPresent = (typeof datasetPath === 'string' && datasetPath.length > 0);
    const callId = ethers.utils.solidityKeccak256(
      ['string', 'string[][]', 'string', 'string'],
      [
        paramSet.body,
        headersTable,
        paramSet.method,
        paramSet.url,
      ],
    );
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
    const urlObject = new URL(paramSet.url);

    /*
  Checking if Dataset is here and replace the API key
  */
    if (isDatasetPresent) {
      try {
        const dataset = JSON.parse(await fsPromises.readFile(inputsRoot + datasetPath));
        apiKey = dataset.apiKey;
        if (callId !== dataset.callId) throw Error('Computed callId does not match dataset\'s callId');
      } catch (e) {
        throw Error(`Could not read the dataset :\n${e}`);
      }

      // eslint-disable-next-line max-len
      // if (paramSet.dataset !== datasetAddress) throw Error('The dataset used does not match dataset specified in the paramset');
      if (paramSet.dataset === '0x0000000000000000000000000000000000000000') {
        throw Error('Dataset file was provided while no dataset was specified in paramSet');
      }
    }

    let keyCount = 0;
    keyCount += utils.occurrences(paramSet.url, apiKeyPlaceHolder);
    let replacedUrl;
    if (isDatasetPresent) replacedUrl = paramSet.url.replace(apiKeyPlaceHolder, apiKey);

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of headersTable) {
      if (typeof value === 'string') {
        keyCount += utils.occurrences(value, apiKeyPlaceHolder);
        if (isDatasetPresent && keyCount === 1) {
          paramSet.headers[key] = value.replace(apiKeyPlaceHolder, apiKey);
        }
      }
    }

    switch (keyCount) {
      case 0:
        if (isDatasetPresent) throw Error('Dataset was provided without any api key placeholder to replace');
        break;
      case 1:
        if (!isDatasetPresent) throw Error('Api key placeholder was found but no Dataset was provided');
        break;
      default:
        throw Error(`Several api key placeholder were found while ${isDatasetPresent ? 1 : 0} was expected`);
    }

    if (urlObject.protocol !== 'https:') {
      throw Error('Url must use the https protocol');
    }

    const res = await fetch(replacedUrl, {
      method: paramSet.method,
      body: (paramSet.body === '' ? null : paramSet.body),
      headers: paramSet.headers,
    });

    const value = jp.query(res, paramSet.JSONPath);
    const abiCoder = ethers.utils.defaultAbiCoder;
    let result;

    if (typeof value[0] === 'object' || value.length !== 1) {
      throw Error('The value extracted from the JSON response should be a primitve.');
    }

    switch (paramSet.dataType) {
      case 'number':
        if (typeof value[0] !== 'number') throw Error(`Expected a number value, got a ${typeof value}`);
        result = abiCoder.encode(['bytes32', 'int256'], [oracleId, value]);
        break;
      case 'string':
        if (typeof value[0] !== 'string') throw Error(`Expected a string value, got a ${typeof value}`);
        result = abiCoder.encode(['bytes32', 'string'], [oracleId, value]);
        break;
      case 'boolean':
        if (typeof value[0] !== 'boolean') throw Error(`Expected a boolean value, got a ${typeof value}`);
        result = abiCoder.encode(['bytes32', 'bool'], [oracleId, value]);
        break;
      default:
        throw Error(`Expected a data type in this list : number, string, boolean. Got ${paramSet.dataType}`);
    }

    // Declare everything is computed
    const computedJsonObj = {
      'callback-data': result, // WIP - TODO
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
