import fsPromises from 'fs/promises';
import path from 'path';
import utils from './utils';
import { apiCall } from './caller';
import { jsonParamSetSchema } from './validators';
import { nbFileChecker, extractDataset, extractApiKey } from './requestConsistency';
import { encodeValue } from './resultEncoder';
import { ethers } from "ethers";
import { ClassicOracle, ClassicOracle__factory } from "@jeremyjames/generic-oracle-contracts/typechain";

const chain = "goerli";
const oracleReceiver = '0x28291E6A81aC30cE6099144E68D8aEeE2b64052b'

export class Dapp {

  start = async () => {
    console.log("Target chain: " + chain)
    console.log("Target oracle address: " + oracleReceiver)

    var args
    try {
      // validate args and exit asap if required
      args = this.getTargetChainArgs();
    } catch (e) {
      console.error("Failed to parse app developer secret [e:%s]", e);
      await this.writeCallbackAndExit(ethers.constants.HashZero);
    }

    const inputFileFolder = process.env.IEXEC_INPUT_FILES_FOLDER;
    if (inputFileFolder == undefined) {
      throw Error('IEXEC_INPUT_FILES_FOLDER env var is required');
      //TODO write callback
    }
    const inputFile1Name = process.env.IEXEC_INPUT_FILE_NAME_1;
    if (inputFile1Name == undefined) {
      throw Error('IEXEC_INPUT_FILE_NAME_1 env var is required');
      //TODO write callback
    }

    const inputFilePath = path.join(
      inputFileFolder,
      inputFile1Name,
    );

    nbFileChecker(process.env.IEXEC_INPUT_FILES_NUMBER);

    const validatedInputJSON = await jsonParamSetSchema()
      .validate((await fsPromises.readFile(inputFilePath)).toString());
    const paramSet = JSON.parse(validatedInputJSON);
    const dataset = await extractDataset(process.env.IEXEC_IN, process.env.IEXEC_DATASET_FILENAME);
    if (dataset !== undefined) dataset.address = process.env.IEXEC_DATASET_ADDRESS;
    const apiKey = extractApiKey(paramSet, dataset);
    const headersTable = Object.entries(utils.sortObjKeys(paramSet.headers));

    let oracleId = ethers.utils.solidityKeccak256(
      ['string', 'string', 'string', 'address', 'string[][]', 'string', 'string'],
      [
        paramSet.JSONPath,
        paramSet.body,
        paramSet.dataType,
        paramSet.dataset,
        headersTable,
        paramSet.method,
        paramSet.url,
      ],
    );

    const { value, date } = await apiCall({
      url: paramSet.url,
      method: paramSet.method,
      headers: paramSet.headers,
      body: paramSet.body,
      apiKey,
      JSONPath: paramSet.JSONPath,
      dataType: paramSet.dataType,
    });
    console.log("Received response from API [url:%s, date:%s, value:%s]", paramSet.url, new Date(date * 1000), value)

    var encodedValue: string | undefined = encodeValue(value, date, paramSet.dataType, oracleId);

    try {
      const classicOracle: ClassicOracle = this.loadOraleReceiverContract(args)
      const tx: ethers.ContractTransaction = await classicOracle.receiveResult(oracleId, encodedValue)
      console.log("Sent transaction to targeted oracle [tx:%s, oracleId:%s, encodedValue:%s]", tx.hash, oracleId, encodedValue)
      const receipt = await tx.wait();
      if (receipt.blockNumber) {
        console.log("Mined transaction for targeted oracle [tx:%s, blockNumber:%s, oracleId:%s]", tx.hash, receipt.blockNumber, oracleId)
      } else {
        encodedValue = undefined
        console.error("Failed transaction on targeted oracle [tx:%s]", tx.hash)
      }
    } catch (e) {
      encodedValue = undefined
      console.error("Failed to load OraleReceiver contract [e:%s]", e);
    }

    await this.writeCallbackAndExit(encodedValue);
  }

  private getTargetChainArgs(): any { //Use ts?
    const encodedAppDeveloperSecret = process.env.IEXEC_APP_DEVELOPER_SECRET_0;
    if (encodedAppDeveloperSecret == undefined) {
      throw Error('IEXEC_APP_DEVELOPER_SECRET_0 env var is required');
    }
    const buff = Buffer.from(encodedAppDeveloperSecret, 'base64');
    const appDeveloperSecretsJsonString = buff.toString('utf-8');;
    const appDeveloperSecretJson = JSON.parse(appDeveloperSecretsJsonString); //Use ts?

    const infuraProjectId = appDeveloperSecretJson.infuraProjectId;
    if (infuraProjectId == undefined) {
      throw Error('Failed to parse `infuraProjectId` from decoded secret JSON');
    }
    const infuraProjectSecret = appDeveloperSecretJson.infuraProjectSecret;
    if (infuraProjectSecret == undefined) {
      throw Error('Failed to parse `infuraProjectSecret` from decoded secret JSON');
    }
    const targetPrivateKey = appDeveloperSecretJson.targetPrivateKey;
    if (targetPrivateKey == undefined) {
      throw Error('Failed to parse `targetPrivateKey` from decoded secret JSON');
    }
    return appDeveloperSecretJson;
  }

  private loadOraleReceiverContract(args: any): ClassicOracle {
    const provider = new ethers.providers.InfuraProvider(chain, {
      projectId: args.infuraProjectId,
      projectSecret: args.infuraProjectSecret
    });

    const wallet = new ethers.Wallet(args.targetPrivateKey, provider)
    console.log("Target reporter wallet address: " + wallet.address)//0x767A2D69D7278F200ae1F79a00Ac2CaE299dD784

    return new ClassicOracle__factory()
      .attach(oracleReceiver)
      .connect(wallet);
  }

  private writeCallbackAndExit = async (callbackData: string | undefined) => {
    // Declare everything is computed
    const computedJsonObj = {
      'callback-data': callbackData != undefined ? callbackData : ethers.constants.HashZero,
    };
    const outputRoot = process.env.IEXEC_OUT;
    await fsPromises.writeFile(
      `${outputRoot}/computed.json`,
      JSON.stringify(computedJsonObj),
    );

    // exit gracefully
    if (callbackData != undefined) {
      process.exitCode = 0
    } else {
      process.exitCode = 1
    }
  }

};
