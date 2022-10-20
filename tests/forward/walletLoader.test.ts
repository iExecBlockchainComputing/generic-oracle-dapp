import { getWalletWithProvider } from "../../src/forward/walletLoader";

const CHAIN_ID = 5;
const PROVIDER = undefined;

describe("contract loader", () => {
  test("should fail since no args", () => {
    expect(() => {
      getWalletWithProvider(CHAIN_ID, undefined, PROVIDER);
    }).toThrowError("Encoded args are required");
  });

  test("should fail since empty args", () => {
    expect(() => {
      getWalletWithProvider(CHAIN_ID, "", PROVIDER);
    }).toThrowError("Failed to parse appDeveloperSecret JSON");
  });

  test("should fail since parse payload failed", () => {
    expect(() => {
      getWalletWithProvider(
        CHAIN_ID,
        JSON.stringify({ some: "data" }),
        PROVIDER
      );
    }).toThrowError("Failed to parse appDeveloperSecret JSON");
  });

  test("should fail since no infuraProjectId", () => {
    expect(() => {
      getWalletWithProvider(CHAIN_ID, encode({}), PROVIDER);
    }).toThrowError(
      "Failed to parse `infuraProjectId` from decoded secret JSON"
    );
  });

  test("should fail since no infuraProjectSecret", () => {
    expect(() => {
      getWalletWithProvider(
        CHAIN_ID,
        encode({
          infuraProjectId: "id",
        }),
        PROVIDER
      );
    }).toThrowError(
      "Failed to parse `infuraProjectSecret` from decoded secret JSON"
    );
  });

  test("should fail since no targetPrivateKey", () => {
    expect(() => {
      getWalletWithProvider(
        CHAIN_ID,
        encode({
          infuraProjectId: "id",
          infuraProjectSecret: "secret",
        }),
        PROVIDER
      );
    }).toThrowError(
      "Failed to parse `targetPrivateKey` from decoded secret JSON"
    );
  });

  test("should return wallet", async () => {
    const wallet = getWalletWithProvider(
      CHAIN_ID,
      encode({
        infuraProjectId: "some",
        infuraProjectSecret: "secret",
        targetPrivateKey:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
      }),
      PROVIDER
    );
    expect(await wallet.getAddress()).toEqual(
      "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf"
    );
  });
});

function encode(appDeveloperSecretJson: {
  infuraProjectId?: string;
  infuraProjectSecret?: string;
  targetPrivateKey?: string;
}) {
  const appDeveloperSecretJsonString = JSON.stringify(appDeveloperSecretJson);
  const buff = Buffer.from(appDeveloperSecretJsonString, "utf-8");
  return buff.toString("base64");
}
