import {
  DRONE_TARGET_DEPLOY_DEV,
  DRONE_TARGET_DEPLOY_BUBBLE,
  DRONE_TARGET_DEPLOY_PROD,
  ORACLE_FACTORY_DAPP_ENS_NAME_DEV,
  ORACLE_FACTORY_DAPP_ENS_NAME_BUBBLE,
  ORACLE_FACTORY_DAPP_ENS_NAME_PROD,
} from "./config/config.js";
import { getIExec, loadAppAddress } from "./utils/utils.js";
import { configureEnsName } from "./singleFunction/configureEnsName.js";
import "dotenv/config";

const main = async () => {
  // get env variables from drone
  const {
    DRONE_DEPLOY_TO,
    WALLET_PRIVATE_KEY_DEV,
    WALLET_PRIVATE_KEY_BUBBLE,
    WALLET_PRIVATE_KEY_PROD,
  } = process.env;

  if (
    !DRONE_DEPLOY_TO ||
    (DRONE_DEPLOY_TO !== DRONE_TARGET_DEPLOY_DEV &&
      DRONE_DEPLOY_TO !== DRONE_TARGET_DEPLOY_BUBBLE &&
      DRONE_DEPLOY_TO !== DRONE_TARGET_DEPLOY_PROD)
  )
    throw Error(`Invalid promote target ${DRONE_DEPLOY_TO}`);

  const appAddress = await loadAppAddress();

  let privateKey;
  let ensName;
  if (DRONE_DEPLOY_TO === DRONE_TARGET_DEPLOY_DEV) {
    privateKey = WALLET_PRIVATE_KEY_DEV;
    ensName = ORACLE_FACTORY_DAPP_ENS_NAME_DEV;
  } else if (DRONE_DEPLOY_TO === DRONE_TARGET_DEPLOY_BUBBLE) {
    privateKey = WALLET_PRIVATE_KEY_BUBBLE;
    ensName = ORACLE_FACTORY_DAPP_ENS_NAME_BUBBLE;
  } else if (DRONE_DEPLOY_TO === DRONE_TARGET_DEPLOY_PROD) {
    privateKey = WALLET_PRIVATE_KEY_PROD;
    ensName = ORACLE_FACTORY_DAPP_ENS_NAME_PROD;
  }

  if (!privateKey)
    throw Error(`Failed to get privateKey for target ${DRONE_DEPLOY_TO}`);

  if (!ensName)
    throw Error(`Failed to get ens name for target ${DRONE_DEPLOY_TO}`);

  const iexec = getIExec(privateKey);

  await configureEnsName(iexec, appAddress, ensName);
};

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
