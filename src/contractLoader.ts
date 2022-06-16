import { ethers } from "ethers";
import {
  ClassicOracle,
  ClassicOracle__factory,
} from "@jeremyjames/generic-oracle-contracts/typechain";

const chain = "goerli";
const oracleReceiver = "0x28291E6A81aC30cE6099144E68D8aEeE2b64052b";

export class ContractLoader {
  static loadClassicOracle(encodedArgs: string | undefined): ClassicOracle {
    console.log("Target chain: " + chain);
    console.log("Target oracle address: " + oracleReceiver);

    if (encodedArgs == undefined) {
      throw Error("Encoded args are required");
    }
    const buff = Buffer.from(encodedArgs, "base64");
    const appDeveloperSecretsJsonString = buff.toString("utf-8");
    const appDeveloperSecretJson: OracleArgs = JSON.parse(
      appDeveloperSecretsJsonString
    );

    const infuraProjectId = appDeveloperSecretJson.infuraProjectId;
    if (infuraProjectId == undefined) {
      throw Error("Failed to parse `infuraProjectId` from decoded secret JSON");
    }
    const infuraProjectSecret = appDeveloperSecretJson.infuraProjectSecret;
    if (infuraProjectSecret == undefined) {
      throw Error(
        "Failed to parse `infuraProjectSecret` from decoded secret JSON"
      );
    }
    const targetPrivateKey = appDeveloperSecretJson.targetPrivateKey;
    if (targetPrivateKey == undefined) {
      throw Error(
        "Failed to parse `targetPrivateKey` from decoded secret JSON"
      );
    }

    const provider = new ethers.providers.InfuraProvider(chain, {
      projectId: infuraProjectId,
      projectSecret: infuraProjectSecret,
    });

    const wallet = new ethers.Wallet(targetPrivateKey, provider);
    console.log("Target reporter wallet address: " + wallet.address); //0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784

    return new ClassicOracle__factory().attach(oracleReceiver).connect(wallet);
  }
}

export class OracleArgs {
  infuraProjectId: string | undefined;
  infuraProjectSecret: string | undefined;
  targetPrivateKey: string | undefined;
}
