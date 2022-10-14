import { ethers, Wallet } from "ethers";
import {
  ClassicOracle,
  ClassicOracle__factory,
} from "@iexec/generic-oracle-contracts/typechain";

const chain = "goerli";
const oracleReceiver = "0x28291E6A81aC30cE6099144E68D8aEeE2b64052b";

export function getWalletOnProvider(
  chainId: number,
  encodedArgs: string | undefined
): Wallet {
  console.log("Target chain: " + chain);
  console.log("Target oracle address: " + oracleReceiver);

  if (encodedArgs == undefined) {
    throw Error("Encoded args are required");
  }
  const buff = Buffer.from(encodedArgs, "base64");
  const appDeveloperSecretsJsonString = buff.toString();

  let appDeveloperSecretJson: OracleArgs;
  try {
    appDeveloperSecretJson = JSON.parse(appDeveloperSecretsJsonString);
  } catch (e) {
    throw Error("Failed to parse appDeveloperSecret JSON");
  }

  //TODO: Remove infura keys at some point
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
    throw Error("Failed to parse `targetPrivateKey` from decoded secret JSON");
  }

  //   const provider = new ethers.providers.InfuraProvider(chain, {
  //     projectId: infuraProjectId,
  //     projectSecret: infuraProjectSecret,
  //   });
  const provider = ethers.getDefaultProvider(chainId);

  const wallet = new ethers.Wallet(targetPrivateKey, provider);
  console.log("Target reporter wallet address: " + wallet.address);

  //return new ClassicOracle__factory().attach(oracleReceiver).connect(wallet);
  return wallet;
}

interface OracleArgs {
  infuraProjectId?: string;
  infuraProjectSecret?: string;
  targetPrivateKey?: string;
}
