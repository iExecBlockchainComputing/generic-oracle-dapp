/* eslint-disable no-console */
const fsPromises = require('fs').promises;
const fetch = require('node-fetch');
const ethers = require('ethers');
const jp = require('jsonpath');
const Big = require('big.js');
const utils = require('./utils');

console.log('App starting');
(async () => {
  try {
    console.log('App started');

    console.log(`IEXEC_INPUT_FILES_FOLDER : ${process.env.IEXEC_INPUT_FILES_FOLDER}`);
    console.log(`IEXEC_INPUT_FILE_NAME_1 : ${process.env.IEXEC_INPUT_FILE_NAME_1}`);
    console.log(`IEXEC_OUT : ${process.env.IEXEC_OUT}`);
    console.log(`IEXEC_IN : ${process.env.IEXEC_IN}`);
    console.log(`IEXEC_DATASET_FILENAME : ${process.env.IEXEC_DATASET_FILENAME}`);
    console.log(`IEXEC_NB_INPUT_FILES : ${process.env.IEXEC_NB_INPUT_FILES}`);

    const apiKeyPlaceHolder = '%API_KEY%';
    const inputFilePath = `${process.env.IEXEC_INPUT_FILES_FOLDER}/${process.env.IEXEC_INPUT_FILE_NAME_1}`;
    const outputRoot = process.env.IEXEC_OUT;
    const datasetPath = `${process.env.IEXEC_IN}/${process.env.IEXEC_DATASET_FILENAME}`;

    switch (process.env.IEXEC_NB_INPUT_FILES) {
      case '0':
        throw Error('Paramset missing in input files');
      case '1':
        break;
      default:
        throw Error('Several input files detected while expected one');
    }

    const paramSet = JSON.parse(await fsPromises.readFile(inputFilePath));

    console.log(paramSet);

    let apiKey = '';
    const headersTable = Object.entries(utils.sortObjKeys(paramSet.headers));
    const isDatasetPresent = (typeof process.env.IEXEC_DATASET_FILENAME === 'string' && process.env.IEXEC_DATASET_FILENAME.length > 0);

    console.log(`isDatasetPresent : ${isDatasetPresent}`);

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

    console.log(`callId : ${callId}`);
    console.log(`oracleId : ${oracleId}`);

    const urlObject = new URL(paramSet.url);

    /*
  Checking if Dataset is here and replace the API key
  */
    if (isDatasetPresent) {
      if (paramSet.dataset === '0x0000000000000000000000000000000000000000') {
        throw Error('Dataset file was provided while no dataset was specified in paramSet');
      }
      try {
        const dataset = JSON.parse(await fsPromises.readFile(datasetPath));
        apiKey = dataset.apiKey;
        if (callId !== dataset.callId) {
          throw Error('Computed callId does not match dataset\'s callId \n'
            + `Computed ${callId} but found ${dataset.callId} in the dataset`);
        }
      } catch (e) {
        throw Error(`Could not read the dataset :\n${e}`);
      }

      // eslint-disable-next-line max-len
      // if (paramSet.dataset !== datasetAddress) throw Error('The dataset used does not match dataset specified in the paramset');
    }

    let keyCount = 0;
    keyCount += utils.occurrences(paramSet.url, apiKeyPlaceHolder);
    let replacedUrl = paramSet.url;
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

    const res = await (await fetch(replacedUrl, {
      method: paramSet.method,
      body: (paramSet.body === '' ? null : paramSet.body),
      headers: paramSet.headers,
    })).json();

    console.log(`res : ${res}`);

    const value = jp.query(res, paramSet.JSONPath);

    if (typeof value[0] === 'object' || value.length !== 1) {
      throw Error('The value extracted from the JSON response should be a primitve.');
    }

    const extractedValue = value[0];

    console.log(`extractedValue : ${extractedValue}`);

    let result;
    let finalNumber;

    switch (paramSet.dataType) {
      case 'number':
        if (typeof extractedValue !== 'number') throw Error(`Expected a number value, got a ${typeof extractedValue}`);
        finalNumber = ethers.BigNumber.from((new Big(extractedValue).times(new Big('1e18'))).toFixed());
        result = ethers.utils.defaultAbiCoder.encode(['int256'], [finalNumber]);
        break;
      case 'string':
        if (typeof extractedValue !== 'string') throw Error(`Expected a string value, got a ${typeof extractedValue}`);
        result = ethers.utils.defaultAbiCoder.encode(['string'], [extractedValue]);
        break;
      case 'boolean':
        if (typeof extractedValue !== 'boolean') throw Error(`Expected a boolean value, got a ${typeof extractedValue}`);
        result = ethers.utils.defaultAbiCoder.encode(['bool'], [extractedValue]);
        break;
      default:
        throw Error(`Expected a data type in this list : number, string, boolean. Got ${paramSet.dataType}`);
    }

    // Declare everything is computed
    console.log('Everything computed well, writing to computed.json');
    const computedJsonObj = {
      'callback-data': ethers.utils.defaultAbiCoder.encode(['bytes32', 'bytes'], [oracleId, result]),
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
