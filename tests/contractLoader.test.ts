import { getWalletWithProvider } from "../src/forward/walletLoader";

describe("contract loader", () => {
  test("should fail since no args", () => {
    expect(() => {
      getWalletWithProvider(undefined);
    }).toThrowError("Encoded args are required");
  });

  test("should fail since empty args", () => {
    expect(() => {
      getWalletWithProvider("");
    }).toThrowError("Failed to parse appDeveloperSecret JSON");
  });

  test("should fail since parse payload failed", () => {
    expect(() => {
      getWalletWithProvider(JSON.stringify({ some: "data" }));
    }).toThrowError("Failed to parse appDeveloperSecret JSON");
  });

  test("should fail since no infuraProjectId", () => {
    expect(() => {
      getWalletWithProvider(encode({}));
    }).toThrowError(
      "Failed to parse `infuraProjectId` from decoded secret JSON"
    );
  });

  test("should fail since no infuraProjectSecret", () => {
    expect(() => {
      getWalletWithProvider(
        encode({
          infuraProjectId: "id",
        })
      );
    }).toThrowError(
      "Failed to parse `infuraProjectSecret` from decoded secret JSON"
    );
  });

  test("should fail since no targetPrivateKey", () => {
    expect(() => {
      getWalletWithProvider(
        encode({
          infuraProjectId: "id",
          infuraProjectSecret: "secret",
        })
      );
    }).toThrowError(
      "Failed to parse `targetPrivateKey` from decoded secret JSON"
    );
  });

  test("should return something", () => {
    expect(
      getWalletWithProvider(
        encode({
          infuraProjectId: "some",
          infuraProjectSecret: "secret",
          targetPrivateKey:
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        })
      )
    ).not.toBeNull();
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
