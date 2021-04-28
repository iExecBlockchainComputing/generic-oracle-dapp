const fetch = require('node-fetch');
const dapp = require('../src/dapp');

jest.mock('node-fetch');

afterEach(() => {
  jest.resetAllMocks();
});

describe('dapp', () => {
  test('a full successful dapp run', async () => {
    fetch.mockImplementation(async () => ({
      json: () => Promise.resolve({
        foo: false,
        bar: {
          toto: 'titi',
        },
      }),
    }));
    process.env.IEXEC_INPUT_FILES_FOLDER = './tests/test_files';
    process.env.IEXEC_INPUT_FILE_NAME_1 = 'input_file.json';
    process.env.IEXEC_OUT = './tests/test_out';
    process.env.IEXEC_NB_INPUT_FILES = '1';
    process.env.IEXEC_IN = './tests/test_files';
    process.env.IEXEC_DATASET_FILENAME = 'full-dataset.json';
    process.env.IEXEC_DATASET_ADDRESS = '0x0000000000000000000000000000000000000001';

    await dapp();
  });
});
