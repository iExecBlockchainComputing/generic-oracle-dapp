import { config as dotEnvConfig } from "dotenv";
import Dapp from "../src/dapp";
import { buildAppSecret } from "./utils";
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
    process.argv = ["", "", "80002,11155111"]; // Amoy Polygon & Sepolia
    process.env.IEXEC_TASK_ID =
      "0x0000000000000000000000000000000000000000000000000000000000000abc";
    process.env.IEXEC_APP_DEVELOPER_SECRET = buildAppSecret(
      // eslint-disable-next-line prettier/prettier
      process.env.TARGET_PRIVATE_KEY,
    );
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
