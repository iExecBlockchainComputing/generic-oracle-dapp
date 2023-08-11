import { Wallet } from "ethers";
import { triggerForwardRequests } from "../../src/forward/forwardHandler";
import { loadWallet } from "../../src/forward/walletLoader";
import { signForwardRequest } from "../../src/forward/forwardSigner";
import { postForwardRequest } from "../../src/forward/forwardSender";

jest.mock("../../src/forward/walletLoader");
jest.mock("../../src/forward/forwardSigner");
jest.mock("../../src/forward/forwardSender");

const loadWalletMock = loadWallet as jest.MockedFunction<typeof loadWallet>;
const getSignedForwardRequestMock = signForwardRequest as jest.MockedFunction<
  typeof signForwardRequest
>;
const postMultiForwardRequestMock = postForwardRequest as jest.MockedFunction<
  typeof postForwardRequest
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

    const success = await triggerForwardRequests([CHAIN_ID], ORACLE_ID, VALUE);
    expect(success).toBe(false);
  });

  test("should not trigger since chain not supported", async () => {
    process.env.IEXEC_TASK_ID = TASK_ID;

    const success = await triggerForwardRequests(
      [12345], // chain not supported
      ORACLE_ID,
      VALUE
    );
    expect(success).toBe(false);
  });

  test("should not trigger since wallet not found", async () => {
    process.env.IEXEC_TASK_ID = TASK_ID;

    loadWalletMock.mockImplementation(() => {
      throw new Error("Wallet error");
    });

    const success = await triggerForwardRequests([CHAIN_ID], ORACLE_ID, VALUE);
    expect(success).toBe(false);
  });

  test("should trigger", async () => {
    process.env.IEXEC_TASK_ID = TASK_ID;

    loadWalletMock.mockReturnValue(wallet);
    getSignedForwardRequestMock.mockReturnValue(
      Promise.resolve({
        eip712: {
          types: { ForwardRequest: [] },
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

    const success = await triggerForwardRequests([CHAIN_ID], ORACLE_ID, VALUE);
    expect(success).toBe(true);
  });
});
