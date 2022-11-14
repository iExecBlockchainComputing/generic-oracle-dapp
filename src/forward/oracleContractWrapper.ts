import { ethers } from "ethers";
import { IOracleConsumer__factory } from "@iexec/generic-oracle-contracts/typechain";

export class ReceiveResultContractFunction {
  oracleContract; //public for tests

  constructor(oracleAddress: string, provider: ethers.providers.BaseProvider) {
    this.oracleContract = IOracleConsumer__factory.connect(
      oracleAddress,
      provider
    );
  }

  getGasEstimate(
    taskId: string,
    encodedValue: string,
    reporterAddress: string
  ) {
    return this.oracleContract.estimateGas.receiveResult(taskId, encodedValue, {
      from: reporterAddress,
    });
  }

  getData(taskId: string, encodedValue: string) {
    return this.oracleContract.interface.encodeFunctionData("receiveResult", [
      taskId,
      encodedValue,
    ]);
  }
}
