import { ethers, Wallet } from "ethers";

export function loadWallet(encodedArgs: string | undefined): Wallet {
  if (encodedArgs == undefined) {
    throw Error("Encoded args are required");
  }

  let appDeveloperSecretJson: OracleArgs;
  try {
    appDeveloperSecretJson = JSON.parse(encodedArgs);
  } catch (e) {
    throw Error("Failed to parse appDeveloperSecret JSON");
  }

  const targetPrivateKey = appDeveloperSecretJson.targetPrivateKey;
  if (targetPrivateKey == undefined) {
    throw Error("Failed to parse `targetPrivateKey` from decoded secret JSON");
  }

  const wallet = new ethers.Wallet(targetPrivateKey);
  console.log(
    "Recovered authorized reporter wallet for foreign oracle contract [address:%s]",
    wallet.address
  );

  return wallet;
}

interface OracleArgs {
  targetPrivateKey?: string;
}
