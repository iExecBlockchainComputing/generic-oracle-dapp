import fsPromises from "fs/promises";
import utils from "./utils";
import { getWalletOnProvider } from "../src/contractLoader";
import { apiCall } from "./caller";
import { jsonParamSetSchema } from "./validators";
import {
  getInputFilePath,
  extractDataset,
  extractApiKey,
} from "./requestConsistency";
import { encodeValue } from "./resultEncoder";
import { ethers, Wallet } from "ethers";
import {
  ClassicOracle,
  ClassicOracle__factory,
} from "@iexec/generic-oracle-contracts/typechain";
import fetch from "node-fetch";

const forwarderAddress = "0xc83de370A0D1C99F3D3D9e77bd930520ded81fFA";
const oracleReceiver = "0x8Ad317241854b1A29A06cE5478e6B92FA09Cd03a";
const forwarderApiUrl = "http://localhost:3000";
//TODO: Check input params
const chainId = 5; //goerli

const start = async () => {
  let wallet: Wallet;
  try {
    // validate args or exit before going further
    wallet = getWalletOnProvider(
      chainId,
      process.env.IEXEC_APP_DEVELOPER_SECRET
    );
  } catch (e) {
    console.error("Failed to load ClassicOracle from encoded args [e:%s]", e);
    return undefined;
  }
  const inputFolder = process.env.IEXEC_IN;
  let inputFilePath;
  try {
    inputFilePath = getInputFilePath(
      inputFolder,
      process.env.IEXEC_INPUT_FILE_NAME_1,
      process.env.IEXEC_INPUT_FILES_NUMBER
    );
  } catch (e) {
    console.error("Failed to get input file [e:%s]", e);
    return undefined;
  }
  const validatedInputJSON = await jsonParamSetSchema().validate(
    (await fsPromises.readFile(inputFilePath)).toString()
  );
  const paramSet = JSON.parse(validatedInputJSON);
  const dataset = await extractDataset(
    inputFolder,
    process.env.IEXEC_DATASET_FILENAME
  );
  if (dataset !== undefined)
    dataset.address = process.env.IEXEC_DATASET_ADDRESS;
  const apiKey = extractApiKey(paramSet, dataset);
  const headersTable = Object.entries(utils.sortObjKeys(paramSet.headers));

  const oracleId = ethers.utils.solidityKeccak256(
    ["string", "string", "string", "address", "string[][]", "string", "string"],
    [
      paramSet.JSONPath,
      paramSet.body,
      paramSet.dataType,
      paramSet.dataset,
      headersTable,
      paramSet.method,
      paramSet.url,
    ]
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
  console.log(
    "Received response from API [url:%s, date:%s, value:%s]",
    paramSet.url,
    new Date(date * 1000),
    value
  );

  let encodedValue: string;
  try {
    encodedValue = encodeValue(value, date, paramSet.dataType, oracleId);
  } catch (e) {
    console.error("Failed to encode value [e:%s]", e);
    return undefined;
  }

  const signedForwardRequest = await getSignedForwardRequest(
    wallet,
    oracleId,
    encodedValue
  );

  const multiForwardRequest = {
    requests: [signedForwardRequest],
  };

  console.log(JSON.stringify(multiForwardRequest));

  if (await postMultiForwardRequest(multiForwardRequest, oracleId)) {
    return encodedValue;
  }
  return undefined;
};
export default start;

async function postMultiForwardRequest(
  multiForwardRequest: any, //TODO: Update to explciti type
  oracleId: string
): Promise<boolean> {
  const response = await fetch(forwarderApiUrl + "/forward", {
    method: "post",
    body: JSON.stringify(multiForwardRequest),
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    console.log(
      "Successful response from Forwarder API [oracleId:%s, taskId:%s]",
      oracleId,
      oracleId
    );
    return true;
  }
  console.error(
    "Failure response from Forwarder API [oracleId:%s, taskId:%s, error:%s, data:%s]",
    oracleId,
    oracleId,
    response.status,
    await response.json()
  );
  return false;
}

async function getSignedForwardRequest(
  wallet: ethers.Wallet,
  oracleId: string,
  encodedValue: string
) {
  const reporterAddress = await wallet.getAddress();
  const domain = {
    name: "SaltyForwarder",
    version: "0.0.1",
    chainId: chainId.toString(),
    verifyingContract: forwarderAddress,
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

  const classicOracle = new ClassicOracle__factory()
    .attach(oracleReceiver)
    .connect(wallet);

  const forwardRequest = {
    from: reporterAddress,
    to: oracleReceiver,
    value: "0",
    //TODO: Change to receiveResult(taskId, ..)
    gas: (
      await classicOracle.estimateGas.receiveResult(oracleId, encodedValue)
    ).toString(),
    salt: ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(Math.random().toString())
    ),
    data: classicOracle.interface.encodeFunctionData("receiveResult", [
      oracleId,
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
    oracleId, //TODO: Use taskId
    encodedValue,
    JSON.stringify(signedForwardRequest)
  );
  return signedForwardRequest;
}
