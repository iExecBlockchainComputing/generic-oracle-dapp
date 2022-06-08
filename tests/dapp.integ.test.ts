import { config as dotEnvConfig } from "dotenv";
import { Dapp } from '../src/dapp';

describe('dapp', () => {

  test('a full successful dapp IT run without dataset', async () => {
    dotEnvConfig();
    const infuraProjectId = process.env.INFURA_PROJECT_ID
    const infuraProjectSecret = process.env.INFURA_PROJECT_SECRET
    const targetPrivateKey = process.env.TARGET_PRIVATE_KEY

    const appDeveloperSecretJson = {
      targetPrivateKey: targetPrivateKey,
      infuraProjectId: infuraProjectId,
      infuraProjectSecret: infuraProjectSecret
    };
    const appDeveloperSecretJsonString = JSON.stringify(appDeveloperSecretJson);
    const buff = Buffer.from(appDeveloperSecretJsonString, 'utf-8');
    const encodedAppDeveloperSecret = buff.toString('base64');

    process.env.IEXEC_APP_DEVELOPER_SECRET_0 = encodedAppDeveloperSecret
    process.env.IEXEC_INPUT_FILES_NUMBER = '1';
    process.env.IEXEC_INPUT_FILES_FOLDER = './tests/test_files';
    process.env.IEXEC_INPUT_FILE_NAME_1 = 'input_file_no_dataset.json';
    process.env.IEXEC_OUT = './tests/test_out';
    process.env.IEXEC_IN = './tests/test_files';

    await new Dapp().start();
  }, 60000);   //sending tx takes some time

});
