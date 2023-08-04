import { readFileSync } from "fs";

//hosting url
export const HOST = "https://bellecour.iex.ec";

//deployment parameters
export const APP_NAME = "generic-oracle-dapp";
export const APP_TYPE = "DOCKER";
export const FRAMEWORK = "scone";

//publish sell order parameters
export const DEFAULT_APP_PRICE = 0;
export const DEFAULT_APP_VOLUME = 1000000;
export const APP_TAG = ["tee", "scone"];

//ENS name
export const WEB3_MAIL_ENS_NAME_DEV = "oracle-factory-dev.apps.iexec.eth";
export const WEB3_MAIL_ENS_NAME_PROD = "oracle-factory.apps.iexec.eth";

// image
const SCONIFIER_VERSION = "5.7.5-v9";
const dappVersion = JSON.parse(
  readFileSync("../package.json", "utf-8")
).version;

export const DOCKER_IMAGE_NAMESPACE = "iexechub";
export const DOCKER_IMAGE_REPOSITORY = "generic-oracle-dapp";
export const DOCKER_IMAGE_PROD_TAG = `${dappVersion}-sconify-${SCONIFIER_VERSION}-production`;
export const DOCKER_IMAGE_DEV_TAG = `dev-${process.env.DRONE_COMMIT}-sconify-${SCONIFIER_VERSION}-production`;

//drone target
export const DRONE_TARGET_DEPLOY_DEV = "dapp-dev";
export const DRONE_TARGET_DEPLOY_PROD = "dapp-prod";
export const DRONE_TARGET_SELL_ORDER_DEV = "dapp-publish-sell-order-dev";
export const DRONE_TARGET_SELL_ORDER_PROD = "dapp-publish-sell-order-prod";
export const DRONE_TARGET_REVOKE_SELL_ORDER_DEV = "dapp-revoke-sell-order-dev";
export const DRONE_TARGET_REVOKE_SELL_ORDER_PROD =
  "dapp-revoke-sell-order-prod";
export const DRONE_TARGET_PUSH_SECRET_DEV = "dapp-push-secret-dev";
export const DRONE_TARGET_PUSH_SECRET_PROD = "dapp-push-secret-prod";
