import { config as dotEnvConfig } from "dotenv";
import Dapp from "../src/dapp";
const somePrivateKey =
  "0x0000000000000000000000000000000000000000000000000000000000000001";

describe("dapp", () => {
  //   test("should fail since no app developer secret", async () => {
  //     const callbackData = await Dapp();
  //     expect(callbackData).toBeUndefined();
  //   });

  //   test("should fail since no inputfile", async () => {
  //     process.env.IEXEC_APP_DEVELOPER_SECRET =
  //       buildAppSecretWithValidInfuraProcessEnv(somePrivateKey);

  //     const callbackData = await Dapp();
  //     expect(callbackData).toBeUndefined();
  //   });

  //   test("should fail since tx failed", async () => {
  //     process.env.IEXEC_APP_DEVELOPER_SECRET =
  //       buildAppSecretWithValidInfuraProcessEnv(somePrivateKey);
  //     process.env.IEXEC_INPUT_FILES_NUMBER = "1";
  //     process.env.IEXEC_INPUT_FILES_FOLDER = "./tests/test_files";
  //     process.env.IEXEC_INPUT_FILE_NAME_1 = "input_file_no_dataset.json";
  //     process.env.IEXEC_OUT = "./tests/test_out";
  //     process.env.IEXEC_IN = "./tests/test_files";

  //     const callbackData = await Dapp();
  //     expect(callbackData).toBeUndefined();
  //   });

  test("a full successful dapp IT run without dataset", async () => {
    dotEnvConfig();
    process.env.IEXEC_APP_DEVELOPER_SECRET =
      buildAppSecretWithValidInfuraProcessEnv(process.env.TARGET_PRIVATE_KEY);
    process.env.IEXEC_INPUT_FILES_NUMBER = "1";
    process.env.IEXEC_INPUT_FILES_FOLDER = "./tests/test_files";
    process.env.IEXEC_INPUT_FILE_NAME_1 = "input_file_no_dataset.json";
    process.env.IEXEC_OUT = "./tests/test_out";
    process.env.IEXEC_IN = "./tests/test_files";

    const callbackData = await Dapp();
    expect(callbackData).not.toBeUndefined();
    expect(parseInt(callbackData ? callbackData : "0x")).not.toEqual(0);
    /*
    //read value to use it directly for a staging SMS
    console.log(
      "IEXEC_APP_DEVELOPER_SECRET:" + process.env.IEXEC_APP_DEVELOPER_SECRET
    ); 
    */
  }, 60000); //sending tx takes some time
});

function buildAppSecretWithValidInfuraProcessEnv(
  targetPrivateKey: string | undefined
) {
  dotEnvConfig();
  const infuraProjectId = process.env.INFURA_PROJECT_ID;
  const infuraProjectSecret = process.env.INFURA_PROJECT_SECRET;
  const appDeveloperSecretJsonString = JSON.stringify({
    infuraProjectId: infuraProjectId,
    infuraProjectSecret: infuraProjectSecret,
    targetPrivateKey: targetPrivateKey,
  });
  const buff = Buffer.from(appDeveloperSecretJsonString, "utf-8");
  const encodedAppDeveloperSecret = buff.toString("base64");
  return encodedAppDeveloperSecret;
}
