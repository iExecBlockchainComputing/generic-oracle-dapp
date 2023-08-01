import { loadWallet } from "../../src/forward/walletLoader";

describe("contract loader", () => {
  test("should fail since no args", () => {
    expect(() => {
      loadWallet(undefined);
    }).toThrowError("Encoded args are required");
  });

  test("should fail since empty args", () => {
    expect(() => {
      loadWallet("");
    }).toThrowError("Failed to parse appDeveloperSecret JSON");
  });

  test("should fail since parse payload failed", () => {
    expect(() => {
      loadWallet(JSON.stringify({ some: "data" }));
    }).toThrowError("Failed to parse appDeveloperSecret JSON");
  });

  test("should fail since no targetPrivateKey", () => {
    expect(() => {
      loadWallet(encode({}));
    }).toThrowError(
      "Failed to parse `targetPrivateKey` from decoded secret JSON"
    );
  });

  test("should return wallet", async () => {
    const wallet = loadWallet(
      encode({
        targetPrivateKey:
          "0x0000000000000000000000000000000000000000000000000000000000000001",
      })
    );
    expect(await wallet.getAddress()).toEqual(
      "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf"
    );
  });
});

function encode(appDeveloperSecretJson: { targetPrivateKey?: string }) {
  const appDeveloperSecretJsonString = JSON.stringify(appDeveloperSecretJson);
  const buff = Buffer.from(appDeveloperSecretJsonString, "utf-8");
  return buff.toString("base64");
}
