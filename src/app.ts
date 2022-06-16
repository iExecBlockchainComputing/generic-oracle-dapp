import fsPromises from "fs/promises";
import { ethers } from "ethers";
import { Dapp } from "./dapp";

new Dapp()
  .start()
  .then(async (callbackData) => {
    // Declare everything is computed
    const computedJsonObj = {
      "callback-data":
        callbackData != undefined ? callbackData : ethers.constants.HashZero,
    };
    const outputRoot = process.env.IEXEC_OUT;
    await fsPromises.writeFile(
      `${outputRoot}/computed.json`,
      JSON.stringify(computedJsonObj)
    );

    // exit gracefully
    if (callbackData != undefined) {
      process.exitCode = 0;
    } else {
      process.exitCode = 1;
    }
  })
  .catch((e) => {
    console.error("Unexpected error in dapp [e:%s]", e);
    process.exit(1);
  });
