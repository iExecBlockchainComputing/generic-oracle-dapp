import fsPromises from "fs/promises";
import { ethers } from "ethers";
import dapp from "./dapp";

dapp()
  .then(async (callbackData) => {
    // Declare everything is computed
    // Produce callback data as often as possible
    const computedJsonObj = {
      "callback-data":
        callbackData != undefined ? callbackData : ethers.constants.HashZero,
    };
    const outputRoot = process.env.IEXEC_OUT;
    await fsPromises.writeFile(
      `${outputRoot}/computed.json`,
      JSON.stringify(computedJsonObj)
    );
  })
  .catch((e) => {
    console.error("Unexpected error in dapp [e:%s]", e);
    process.exit(1);
  });
