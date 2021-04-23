const ethers = require('ethers');
const Big = require('big.js');

const encodeValue = (value, dataType, oracleId) => {
  let result;
  let finalNumber;

  switch (dataType) {
    case 'number':
      if (typeof value !== 'number') throw Error(`Expected a number value, got a ${typeof value}`);
      finalNumber = ethers.BigNumber.from((new Big(value).times(new Big('1e18'))).toFixed());
      result = ethers.utils.defaultAbiCoder.encode(['int256'], [finalNumber]);
      break;
    case 'string':
      if (typeof value !== 'string') throw Error(`Expected a string value, got a ${typeof value}`);
      result = ethers.utils.defaultAbiCoder.encode(['string'], [value]);
      break;
    case 'boolean':
      if (typeof value !== 'boolean') throw Error(`Expected a boolean value, got a ${typeof value}`);
      result = ethers.utils.defaultAbiCoder.encode(['bool'], [value]);
      break;
    default:
      throw Error(`Expected a data type in this list : number, string, boolean. Got ${dataType}`);
  }

  return ethers.utils.defaultAbiCoder.encode(['bytes32', 'bytes'], [oracleId, result]);
};

module.exports = {
  encodeValue,
};
