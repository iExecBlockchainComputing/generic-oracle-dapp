import { Wallet } from "ethers";
import { triggerMultiFowardRequest } from "../../src/forward/forwardHandler";
import { getWalletWithProvider } from "../../src/forward/walletLoader";
import { getSignedForwardRequest } from "../../src/forward/forwardSigner";
import { postMultiForwardRequest } from "../../src/forward/forwardSender";

jest.mock("../../src/forward/walletLoader");
jest.mock("../../src/forward/forwardSigner");
jest.mock("../../src/forward/forwardSender");

const getWalletWithProviderMock = getWalletWithProvider as jest.MockedFunction<
  typeof getWalletWithProvider
>;
const getSignedForwardRequestMock =
  getSignedForwardRequest as jest.MockedFunction<
    typeof getSignedForwardRequest
  >;
const postMultiForwardRequestMock =
  postMultiForwardRequest as jest.MockedFunction<
    typeof postMultiForwardRequest
  >;

const TASK_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000abc";
const CHAIN_ID = 5;
const ORACLE_ID = "0x1";
const VALUE = "0x2";
const wallet = new Wallet(
  "0x0000000000000000000000000000000000000000000000000000000000000001"
);

describe("Forward handler", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should not trigger since task ID missing", async () => {
    process.env.IEXEC_TASK_ID = "";

    const success = await triggerMultiFowardRequest(
      [CHAIN_ID],
      ORACLE_ID,
      VALUE
    );
    expect(success).toBeFalsy();
  });

  test("should not trigger since chain not supported", async () => {
    process.env.IEXEC_TASK_ID = TASK_ID;

    const success = await triggerMultiFowardRequest(
      [12345], // chain not supported
      ORACLE_ID,
      VALUE
    );
    expect(success).toBeFalsy();
  });

  test("should not trigger since wallet not found", async () => {
    process.env.IEXEC_TASK_ID = TASK_ID;

    getWalletWithProviderMock.mockImplementation(() => {
      throw new Error("Wallet error");
    });

    const success = await triggerMultiFowardRequest(
      [CHAIN_ID],
      ORACLE_ID,
      VALUE
    );
    expect(success).toBeFalsy();
  });

  test("should trigger", async () => {
    process.env.IEXEC_TASK_ID = TASK_ID;

    getWalletWithProviderMock.mockReturnValue(wallet);
    getSignedForwardRequestMock.mockReturnValue(
      Promise.resolve({
        eip712: {
          types: [],
          domain: {
            name: "string",
            version: "string",
            chainId: "string",
            verifyingContract: "string",
          },
          message: {
            from: "string",
            to: "string",
            value: "string",
            gas: "string",
            salt: "string",
            data: "string",
          },
        },
        sign: "string",
      })
    );
    postMultiForwardRequestMock.mockReturnValue(Promise.resolve(true));

    const success = await triggerMultiFowardRequest(
      [CHAIN_ID],
      ORACLE_ID,
      VALUE
    );
    expect(success).toBeTruthy();
  });
});
