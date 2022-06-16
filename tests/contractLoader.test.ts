import { expect } from "chai";
import { ContractLoader } from "../src/contractLoader";

describe("contract loader", () => {
  test("should fail since no args", () => {
    expect(() => {
      ContractLoader.loadClassicOracle(undefined);
    }).to.throw("Encoded args are required");
  });

  test("should fail since empty args", () => {
    expect(() => {
      ContractLoader.loadClassicOracle("");
    }).to.throw("Unexpected end of JSON input");
  });

  test("should fail since no infuraProjectId", () => {
    expect(() => {
      ContractLoader.loadClassicOracle(encode({}));
    }).to.throw("Failed to parse `infuraProjectId` from decoded secret JSON");
  });

  test("should fail since no infuraProjectSecret", () => {
    expect(() => {
      ContractLoader.loadClassicOracle(
        encode({
          infuraProjectId: "id",
        })
      );
    }).to.throw(
      "Failed to parse `infuraProjectSecret` from decoded secret JSON"
    );
  });

  test("should fail since no targetPrivateKey", () => {
    expect(() => {
      ContractLoader.loadClassicOracle(
        encode({
          infuraProjectId: "id",
          infuraProjectSecret: "secret",
        })
      );
    }).to.throw("Failed to parse `targetPrivateKey` from decoded secret JSON");
  });

  test("should return something", () => {
    expect(
      ContractLoader.loadClassicOracle(
        encode({
          infuraProjectId: "some",
          infuraProjectSecret: "secret",
          targetPrivateKey:
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        })
      )
    ).to.not.be.null;
  });
});

function encode(appDeveloperSecretJson: any) {
  const appDeveloperSecretJsonString = JSON.stringify(appDeveloperSecretJson);
  const buff = Buffer.from(appDeveloperSecretJsonString, "utf-8");
  return buff.toString("base64");
}
