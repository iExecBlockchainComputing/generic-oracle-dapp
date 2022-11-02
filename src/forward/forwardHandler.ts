import { loadWallet } from "./walletLoader";
import { Wallet } from "ethers";
import { getOnChainConfig } from "./forwardEnvironment";
import { signForwardRequest } from "./forwardSigner";
import { postForwardRequest } from "./forwardSender";

export async function triggerForwardRequests(
  requestedChainIds: number[],
  oracleId: string,
  encodedValue: string
) {
  const taskId = process.env.IEXEC_TASK_ID;
  if (!taskId) {
    console.error(
      "`IEXEC_TASK_ID` environnement variable is missing [oracleId:%s, requestedChainIds:%s]",
      oracleId,
      requestedChainIds
    );
    return false;
  }

  let wallet: Wallet;
  try {
    // validate args or exit before going further
    wallet = loadWallet(process.env.IEXEC_APP_DEVELOPER_SECRET);
  } catch (error) {
    console.error(
      "Failed to load wallet from `IEXEC_APP_DEVELOPER_SECRET` [oracleId:%s, taskId:%s, error:%s]",
      oracleId,
      taskId,
      error
    );
    return false;
  }

  const successes = await Promise.all(
    requestedChainIds.map(async (chainId) => {
      const onChainConfig = getOnChainConfig(chainId);
      if (!onChainConfig) {
        console.error(
          "Foreign blockchain requested is not supported [chainId:%s, oracleId:%s, taskId:%s]",
          chainId,
          oracleId,
          taskId
        );
        return false;
      }

      const signedForwardRequest = await signForwardRequest(
        chainId,
        wallet,
        taskId,
        oracleId,
        encodedValue,
        onChainConfig
      );

      return await postForwardRequest(signedForwardRequest, oracleId, taskId);
    })
  );

  return (
    successes.filter((success) => success).length == requestedChainIds.length
  );
}
