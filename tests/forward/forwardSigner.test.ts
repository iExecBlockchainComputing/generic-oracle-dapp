import { ClassicOracle } from "@iexec/generic-oracle-contracts/typechain";
import { Wallet, BigNumber } from "ethers";
import { getSignedForwardRequest } from "../../src/forward/forwardSigner";
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
      oracleContract: {} as ClassicOracle,
      getGasEstimate: () => Promise.resolve(BigNumber.from("100000")),
      getData: () => "0xabcd",
    } as ReceiveResultContractFunction;

    jest
      .mocked(ReceiveResultContractFunction)
      .mockImplementation(() => receiveResultMock);

    jest.spyOn(Math, "random").mockReturnValue(123456789);

    const signedRequest = await getSignedForwardRequest(
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
          salt: "0x2a359feeb8e488a1af2c03b908b3ed7990400555db73e1421181d97cac004d48",
          data: "0xabcd",
        },
      },
      sign: "0x85457e9405fbe9a75a8604f4bd678ce8a5276215ea78cad77376b406f7a325f67efb764efd0d2d4a01b35a1eb2e47e90625a1f7056e5c3853068bca64e1b51e21c",
    });
  });
});
