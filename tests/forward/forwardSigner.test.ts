import { IOracleConsumer } from "@iexec/generic-oracle-contracts/typechain";
import { Wallet, BigNumber, utils } from "ethers";
import { signForwardRequest } from "../../src/forward/forwardSigner";
import { ReceiveResultContractFunction } from "../../src/forward/oracleContractWrapper";

jest.mock("../../src/forward/oracleContractWrapper");

const TASK_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000abc";
const CHAIN_ID = 5;
const ORACLE_ID = "0x1";
const VALUE = "0x2";
const wallet = new Wallet(
  "0x0000000000000000000000000000000000000000000000000000000000000001"
);

describe("Forward signer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should", async () => {
    const receiveResultMock = {
      oracleContract: {} as IOracleConsumer,
      getGasEstimate: () => Promise.resolve(BigNumber.from("100000")),
      getData: () => "0xabcd",
    } as ReceiveResultContractFunction;

    jest
      .mocked(ReceiveResultContractFunction)
      .mockImplementation(() => receiveResultMock);

    jest.spyOn(utils, "randomBytes").mockReturnValue(
      utils.toUtf8Bytes("01234567890123456789012345678901") //size 32
    );

    const signedRequest = await signForwardRequest(
      CHAIN_ID,
      wallet,
      TASK_ID,
      ORACLE_ID,
      VALUE,
      {
        forwarder: "0x0000000000000000000000000000000000000001",
        oracle: "0x0000000000000000000000000000000000000002",
        providerUrl: undefined,
      }
    );
    expect(signedRequest).toEqual({
      eip712: {
        types: {
          ForwardRequest: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "gas", type: "uint256" },
            { name: "salt", type: "bytes32" },
            { name: "data", type: "bytes" },
          ],
        },
        domain: {
          name: "SaltyForwarder",
          version: "0.0.1",
          chainId: "5",
          verifyingContract: "0x0000000000000000000000000000000000000001",
        },
        message: {
          from: "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
          to: "0x0000000000000000000000000000000000000002",
          value: "0",
          gas: "100000",
          salt: "0x3031323334353637383930313233343536373839303132333435363738393031",
          data: "0xabcd",
        },
      },
      sign: "0xfa561b74cd3fc10cdee22beed8ede242d8da31c9e203e2ee1c34fe015cadc50603d93681ad71cd682ac4f8049633a78ceaafd92c69595d9c60402f54ad442fe91b",
    });
  });
});
