import { ethers, Wallet } from "ethers";

export function getWalletWithProvider(
  chainId: number,
  encodedArgs: string | undefined,
  providerUrl: string | undefined
): Wallet {
  console.log("Target chain: " + chainId);

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

  //TODO: Remove if default provider is fine
  //   const provider = new ethers.providers.InfuraProvider(chain, {
  //     projectId: infuraProjectId,
  //     projectSecret: infuraProjectSecret,
  //   });

  let provider;
  if (providerUrl) {
    provider = new ethers.providers.JsonRpcProvider(providerUrl);
  } else {
    provider = ethers.getDefaultProvider(chainId);
  }

  const wallet = new ethers.Wallet(targetPrivateKey, provider);
  console.log("Target reporter wallet address: " + wallet.address);

  return wallet;
}

interface OracleArgs {
  infuraProjectId?: string;
  infuraProjectSecret?: string;
  targetPrivateKey?: string;
}
