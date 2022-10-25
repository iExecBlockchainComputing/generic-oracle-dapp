import { loadWallet } from "./walletLoader";
import { Wallet } from "ethers";
import { getOnChainConfig } from "./forwardEnvironment";
import { getSignedForwardRequest } from "./forwardSigner";
import { postMultiForwardRequest } from "./forwardSender";

export async function triggerForwardRequests(
  requestedChainIds: number[],
  oracleId: string,
  encodedValue: string
) {
  const taskId = process.env.IEXEC_TASK_ID;
  if (!taskId) {
    console.error("[IEXEC] IEXEC_TASK_ID is missing");
    return false;
  }

  const successes = await Promise.all(
    requestedChainIds.map(async (chainId) => {
      const onChainConfig = getOnChainConfig(chainId);
      if (!onChainConfig) {
        console.error("Chain not supported [chainId:%s]", chainId);
        return false;
      }

      let wallet: Wallet;
      try {
        // validate args or exit before going further
        wallet = loadWallet(process.env.IEXEC_APP_DEVELOPER_SECRET);
      } catch (e) {
        console.error(
          "Failed to load ClassicOracle from encoded args [e:%s]",
          e
        );
        return false;
      }

      const signedForwardRequest = await getSignedForwardRequest(
        chainId,
        wallet,
        taskId,
        oracleId,
        encodedValue,
        onChainConfig
      );

      return await postMultiForwardRequest(
        signedForwardRequest,
        oracleId,
        taskId
      );
    })
  );

  return (
    successes.filter((success) => success).length == requestedChainIds.length
  );
}
