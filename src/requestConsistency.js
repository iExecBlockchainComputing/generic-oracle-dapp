const fsPromises = require('fs').promises;
const ethers = require('ethers');
const path = require('path');
const utils = require('./utils');

const nbFileChecker = (nbFile) => {
  switch (nbFile) {
    case '0':
      throw Error('Paramset missing in input files');
    case '1':
      break;
    default:
      throw Error('Several input files detected while expected one');
  }
};

const extractDataset = async (iexecIn, iexecDatasetFilename) => {
  if (typeof iexecDatasetFilename === 'string' && iexecDatasetFilename.length > 0) {
    const datasetPath = path.join(iexecIn, iexecDatasetFilename);
    return JSON.parse(await fsPromises.readFile(datasetPath));
  }
  return undefined;
};

const extractApiKey = (paramSet, dataset) => {
  const headersTable = Object.entries(utils.sortObjKeys(paramSet.headers));

  const callId = ethers.utils.solidityKeccak256(
    ['string', 'string[][]', 'string', 'string'],
    [
      paramSet.body,
      headersTable,
      paramSet.method,
      paramSet.url,
    ],
  );

  let apiKey;
  if (dataset !== undefined) {
    if (paramSet.dataset.toLowerCase() !== dataset.address.toLowerCase()) throw Error('The dataset used does not match dataset specified in the paramset');
    if (callId !== dataset.callId) {
      throw Error('Computed callId does not match dataset\'s callId \n'
        + `Computed ${callId} but found ${dataset.callId} in the dataset`);
    }
    apiKey = dataset.apiKey;
  }

  return apiKey;
};
module.exports = {
  nbFileChecker,
  extractDataset,
  extractApiKey,
};
