import { buildAppSecret } from "../tests/utils";

process.env.INFURA_PROJECT_ID = "";
process.env.INFURA_PROJECT_SECRET = "";
const encodedAppSecret = buildAppSecret(process.argv[2]);
console.log(encodedAppSecret);

// Enable it to verify final app secret
//console.log("App secret recovered [decodedAppSecret:%s]", Buffer.from(encodedAppSecret, "base64").toString());
