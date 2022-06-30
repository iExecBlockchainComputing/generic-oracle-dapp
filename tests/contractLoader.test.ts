import { loadClassicOracle } from "../src/contractLoader";

describe("contract loader", () => {
  test("should fail since no args", () => {
    expect(() => {
      loadClassicOracle(undefined);
    }).toThrowError("Encoded args are required");
  });

  test("should fail since empty args", () => {
    expect(() => {
      loadClassicOracle("");
    }).toThrowError("Failed to parse appDeveloperSecret JSON");
  });

  test("should fail since parse payload failed", () => {
    expect(() => {
      loadClassicOracle(JSON.stringify({ some: "data" }));
    }).toThrowError("Failed to parse appDeveloperSecret JSON");
  });

  test("should fail since no infuraProjectId", () => {
    expect(() => {
      loadClassicOracle(encode({}));
    }).toThrowError(
      "Failed to parse `infuraProjectId` from decoded secret JSON"
    );
  });

  test("should fail since no infuraProjectSecret", () => {
    expect(() => {
      loadClassicOracle(
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
      loadClassicOracle(
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
      loadClassicOracle(
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
