const { nbFileChecker, extractDataset, extractApiKey } = require('../src/requestConsistency');

describe('nbFileChecker', () => {
  test('Fail if no file', () => {
    expect(() => {
      nbFileChecker('0');
    }).toThrow(Error('Paramset missing in input files'));
  });

  test('Fail if too much files', () => {
    expect(() => {
      nbFileChecker('2');
    }).toThrow(Error('Several input files detected while expected one'));
  });

  test('Do nothing if 1 file', () => {
    expect(nbFileChecker('1')).toBeUndefined();
  });
});

describe('extractDataset', () => {
  test('Return the dataset found in the file', async () => {
    const dataset = await extractDataset('./tests/test_files', 'dataset.json');
    expect(dataset).toStrictEqual({
      apiKey: 'toto',
      callId: '0x5c446edb8feb180d49ffa2a54c671c741302f616a89322f7b54a541540be196e',
    });
  });

  test('return undefined if file name was not provided', async () => {
    const dataset = await extractDataset('./tests/test_files', undefined);
    expect(dataset).toBeUndefined();
  });
});

describe('extractApiKey', () => {
  test('Extract the api key from the dataset', async () => {
    const dataset = {
      apiKey: 'toto',
      callId: '0xca073d53779cadd3c2d4454c69e1cca95cf28bb6dcd202e825bfa723fe2a8bbe',
      address: '0x0000000000000000000000000000000000000001',
    };
    const paramSet = {
      url: 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=%API_KEY%',
      body: '',
      headers: {
      },
      method: 'GET',
      JSONPath: '$.sys.sunrise',
      dataset: '0x0000000000000000000000000000000000000001',
      dataType: 'number',
    };

    const apiKey = extractApiKey(paramSet, dataset);
    expect(apiKey).toStrictEqual('toto');
  });

  test('Return undefined when there is no dataset', async () => {
    const dataset = undefined;
    const paramSet = {
      url: 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=toto',
      body: '',
      headers: {
      },
      method: 'GET',
      JSONPath: '$.sys.sunrise',
      dataset: '0x0000000000000000000000000000000000000000',
      dataType: 'number',
    };

    const apiKey = extractApiKey(paramSet, dataset);
    expect(apiKey).toBeUndefined();
  });

  test('Fail when the callID doesnt match', async () => {
    const dataset = {
      apiKey: 'toto',
      callId: '0xca073d53779cadd3c2d4454c69e1cca95cf28bb6dcd202e825bfa723fe2a8bbf',
    };
    const paramSet = {
      url: 'https://api.openweathermap.org/data/2.5/weather?q=London&appid=%API_KEY%',
      body: '',
      headers: {
      },
      method: 'GET',
      JSONPath: '$.sys.sunrise',
      dataset: '0x0000000000000000000000000000000000000001',
      dataType: 'number',
    };
    expect(() => {
      extractApiKey(paramSet, dataset);
    }).toThrow();
  });
});
