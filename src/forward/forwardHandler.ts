import { getWalletWithProvider } from "./walletLoader";
import { Wallet } from "ethers";
import { getOnChainConfig } from "./forwardEnvironment";
import { getSignedForwardRequest } from "./forwardSigner";
import { postMultiForwardRequest } from "./forwardSender";

export async function triggerMultiFowardRequest(
  requestedChainIds: number[],
  oracleId: string,
  encodedValue: string
) {
  const taskId = process.env.IEXEC_TASK_ID;
  if (!taskId) {
    console.error("[IEXEC] IEXEC_TASK_ID is missing");
    return false;
  }

  const chainIds = requestedChainIds.filter(isSupportedChain);
  const signedForwardRequests = [];

  for (const chainId of chainIds) {
    const onChainConfig = getOnChainConfig(chainId);
    if (!onChainConfig) {
      // already checked, should not happen
      console.error("Chain not supported [chainId:%s]", chainId);
      continue;
    }

    let wallet: Wallet;
    try {
      // validate args or exit before going further
      wallet = getWalletWithProvider(
        chainId,
        process.env.IEXEC_APP_DEVELOPER_SECRET,
        onChainConfig.providerUrl
      );
    } catch (e) {
      console.error("Failed to load ClassicOracle from encoded args [e:%s]", e);
      continue;
    }

    const signedForwardRequest = await getSignedForwardRequest(
      wallet,
      taskId,
      oracleId,
      encodedValue,
      onChainConfig
    );

    signedForwardRequests.push(signedForwardRequest);
  }

  if (signedForwardRequests.length == 0) {
    return false;
  }

  const multiForwardRequest = {
    requests: signedForwardRequests,
  };

  console.log(
    "Multi foward request ready [request:%s]",
    JSON.stringify(multiForwardRequest)
  );

  return await postMultiForwardRequest(multiForwardRequest, oracleId, taskId);
}

function isSupportedChain(chainId: number) {
  if (getOnChainConfig(chainId) != undefined) {
    return true;
  }
  console.error("Chain not supported [chainId:%s]", chainId);
  return false;
}
