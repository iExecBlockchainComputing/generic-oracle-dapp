import {
  DRONE_TARGET_DEPLOY_DEV,
  DRONE_TARGET_DEPLOY_PROD,
  DRONE_TARGET_PUSH_SECRET_DEV,
  DRONE_TARGET_PUSH_SECRET_PROD,
  WEB3_MAIL_ENS_NAME_DEV,
  WEB3_MAIL_ENS_NAME_PROD,
} from "./config/config.js";
import { pushSecret } from "./singleFunction/pushSecret.js";
import { resolveName } from "./singleFunction/resolveName.js";
import { getIExec, loadAppAddress } from "./utils/utils.js";

const main = async () => {
  // get env variables from drone
  const {
    DRONE_DEPLOY_TO,
    WALLET_PRIVATE_KEY_DEV,
    WALLET_PRIVATE_KEY_PROD,
    REPORTER_DEV_PRIVATE_KEY,
    REPORTER_PROD_PRIVATE_KEY,
  } = process.env;

  if (
    !DRONE_DEPLOY_TO ||
    ![
      DRONE_TARGET_DEPLOY_DEV,
      DRONE_TARGET_DEPLOY_PROD,
      DRONE_TARGET_PUSH_SECRET_DEV,
      DRONE_TARGET_PUSH_SECRET_PROD,
    ].includes(DRONE_DEPLOY_TO)
  )
    throw Error(`Invalid promote target ${DRONE_DEPLOY_TO}`);

  if (!REPORTER_DEV_PRIVATE_KEY)
    throw Error("Missing env REPORTER_DEV_PRIVATE_KEY");
  if (!REPORTER_PROD_PRIVATE_KEY)
    throw Error("Missing env REPORTER_PROD_PRIVATE_KEY");

  let privateKey;
  if (
    DRONE_DEPLOY_TO === DRONE_TARGET_DEPLOY_DEV ||
    DRONE_DEPLOY_TO === DRONE_TARGET_PUSH_SECRET_DEV
  ) {
    privateKey = WALLET_PRIVATE_KEY_DEV;
  } else if (
    DRONE_DEPLOY_TO === DRONE_TARGET_DEPLOY_PROD ||
    DRONE_DEPLOY_TO === DRONE_TARGET_PUSH_SECRET_PROD
  ) {
    privateKey = WALLET_PRIVATE_KEY_PROD;
  }

  if (!privateKey)
    throw Error(`Failed to get privateKey for target ${DRONE_DEPLOY_TO}`);

  const iexec = getIExec(privateKey);

  const appAddress = await loadAppAddress().catch(() => {
    console.log("No app address found falling back to ENS");
    let ensName;
    if (DRONE_DEPLOY_TO === DRONE_TARGET_PUSH_SECRET_DEV) {
      ensName = WEB3_MAIL_ENS_NAME_DEV;
    } else if (DRONE_DEPLOY_TO === DRONE_TARGET_PUSH_SECRET_PROD) {
      ensName = WEB3_MAIL_ENS_NAME_PROD;
    }
    if (!ensName)
      throw Error(`Failed to get ens name for target ${DRONE_DEPLOY_TO}`);
    return resolveName(iexec, ensName);
  });

  if (!appAddress) throw Error("Failed to get app address"); // If the app was not deployed, do not continue

  //deploy app
  //push app secret to the secret management
  const jsonSecret = JSON.stringify({
    targetPrivateKey: REPORTER_DEV_PRIVATE_KEY,
    // targetPrivateKey: REPORTER_PROD_PRIVATE_KEY,
  });
  await pushSecret(iexec, appAddress, jsonSecret);
};

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
