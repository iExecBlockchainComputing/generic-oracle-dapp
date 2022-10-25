import { ethers } from "ethers";
import { OnChainConfig } from "./forwardEnvironment";
import { ReceiveResultContractFunction } from "./oracleContractWrapper";

export async function getSignedForwardRequest(
  chainId: number,
  wallet: ethers.Wallet,
  taskId: string,
  oracleId: string,
  encodedValue: string,
  onChainConfig: OnChainConfig
) {
  const reporterAddress = await wallet.getAddress();
  const domain = {
    name: "SaltyForwarder",
    version: "0.0.1",
    chainId: chainId.toString(),
    verifyingContract: onChainConfig.forwarder,
  };
  const types = {
    ForwardRequest: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "gas", type: "uint256" },
      { name: "salt", type: "bytes32" },
      { name: "data", type: "bytes" },
    ],
  };

  const oracleAddress = onChainConfig.oracle;
  const providerUrl = onChainConfig.providerUrl;

  let provider;
  if (providerUrl) {
    provider = new ethers.providers.JsonRpcProvider(providerUrl);
  } else {
    provider = ethers.getDefaultProvider(chainId);
  }

  const receiveResult = new ReceiveResultContractFunction(
    oracleAddress,
    provider
  );

  const forwardRequest = {
    from: reporterAddress,
    to: oracleAddress,
    value: "0",
    gas: (
      await receiveResult.getGasEstimate(taskId, encodedValue, reporterAddress)
    ).toString(),
    salt: ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(Math.random().toString())
    ),
    data: receiveResult.getData(taskId, encodedValue),
  };

  const signature = await wallet._signTypedData(domain, types, forwardRequest);

  const signedForwardRequest = {
    eip712: {
      types: types,
      domain: domain,
      message: forwardRequest,
    },
    sign: signature,
  };
  console.log(
    "Signed forwardRequest [chainId:%s, oracleId:%s, taskId:%s, encodedValue:%s, signedForwardRequest:%s]",
    chainId,
    oracleId,
    taskId,
    encodedValue,
    JSON.stringify(signedForwardRequest)
  );
  return signedForwardRequest;
}
