import { ethers, Wallet } from "ethers";

export function loadWallet(encodedArgs: string | undefined): Wallet {
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

  //TODO: Remove infura keys at some point
  //const provider = getProvider(chainId, infuraProjectId, infuraProjectSecret);

  const wallet = new ethers.Wallet(targetPrivateKey);
  console.log(
    "Recovered authorized reporter wallet for foreign oracle contract [address:%s]",
    wallet.address
  );

  return wallet;
}

interface OracleArgs {
  infuraProjectId?: string;
  infuraProjectSecret?: string;
  targetPrivateKey?: string;
}

// function getProvider(
//   chainId: number,
//   infuraProjectId: string,
//   infuraProjectSecret: string
// ) {
//   return new ethers.providers.InfuraProvider(chainId, {
//     projectId: infuraProjectId,
//     projectSecret: infuraProjectSecret,
//   });
// }
