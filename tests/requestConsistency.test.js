const { nbFileChecker } = require('../src/requestConsistency');

describe('nbFileChecker', () => {
  test('Fail if no file', async () => {
    await expect(nbFileChecker('0')).rejects.toThrow(new Error('Paramset missing in input files'));
  });
});
