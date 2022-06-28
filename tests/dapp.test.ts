import fetch from "node-fetch";
import Dapp from "../src/dapp";

jest.mock("node-fetch");

afterEach(() => {
  jest.resetAllMocks();
});

describe("dapp", () => {
  test.skip("a full successful dapp run", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fetch as any).mockImplementation(async () => ({
      json: () =>
        Promise.resolve({
          foo: false,
          bar: {
            toto: "titi",
          },
        }),
      headers: {
        get: () => "Thu, 10 Jun 2021 09:58:20 GMT",
      },
    }));
    process.env.IEXEC_INPUT_FILES_FOLDER = "./tests/test_files";
    process.env.IEXEC_INPUT_FILE_NAME_1 = "input_file.json";
    process.env.IEXEC_OUT = "./tests/test_out";
    process.env.IEXEC_INPUT_FILES_NUMBER = "1";
    process.env.IEXEC_IN = "./tests/test_files";
    process.env.IEXEC_DATASET_FILENAME = "full-dataset.json";
    process.env.IEXEC_DATASET_ADDRESS =
      "0x0000000000000000000000000000000000000001";

    await Dapp();
  }, 30000);
});