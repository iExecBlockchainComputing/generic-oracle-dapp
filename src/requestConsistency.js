const fsPromises = require('fs').promises;
const ethers = require('ethers');
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
  const datasetPath = `${iexecIn}/${iexecDatasetFilename}`;
  const isDatasetPresent = (typeof iexecDatasetFilename === 'string' && iexecDatasetFilename.length > 0);

  return isDatasetPresent ? JSON.parse(await fsPromises.readFile(datasetPath)) : undefined;
};

const extractApiKey = async (dataset, paramSet) => {
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
    if (callId !== dataset.callId) {
      throw Error('Computed callId does not match dataset\'s callId \n'
        + `Computed ${callId} but found ${dataset.callId} in the dataset`);

      // eslint-disable-next-line max-len
      // if (paramSet.dataset !== datasetAddress) throw Error('The dataset used does not match dataset specified in the paramset');
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
