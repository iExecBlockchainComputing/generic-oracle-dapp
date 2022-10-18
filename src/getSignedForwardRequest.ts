import { ethers } from "ethers";
import { ClassicOracle__factory } from "@iexec/generic-oracle-contracts/typechain";
import { goerliForwarderAddress, goerliOracleReceiver } from "./dapp";

export async function getSignedForwardRequest(
  wallet: ethers.Wallet,
  taskId: string,
  oracleId: string,
  encodedValue: string
) {
  const reporterAddress = await wallet.getAddress();
  const domain = {
    name: "SaltyForwarder",
    version: "0.0.1",
    chainId: (await wallet.getChainId()).toString(), //Use id from arg instead?
    verifyingContract: goerliForwarderAddress,
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

  console.log("Target oracle address: " + goerliOracleReceiver);

  const classicOracle = new ClassicOracle__factory()
    .attach(goerliOracleReceiver)
    .connect(wallet);

  const forwardRequest = {
    from: reporterAddress,
    to: goerliOracleReceiver,
    value: "0",
    gas: (
      await classicOracle.estimateGas.receiveResult(taskId, encodedValue)
    ).toString(),
    salt: ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(Math.random().toString())
    ),
    data: classicOracle.interface.encodeFunctionData("receiveResult", [
      taskId,
      encodedValue,
    ]),
  };

  const signature = await wallet._signTypedData(domain, types, forwardRequest);

  const signedForwardRequest = {
    eip712: {
      types: types.ForwardRequest,
      domain: domain,
      message: forwardRequest,
    },
    sign: signature,
  };
  console.log(
    "Signed forwardRequest [oracleId:%s, taskId:%s, encodedValue:%s, signedForwardRequest:%s]",
    oracleId,
    taskId,
    encodedValue,
    JSON.stringify(signedForwardRequest)
  );
  return signedForwardRequest;
}
