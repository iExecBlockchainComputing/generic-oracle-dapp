import { config as dotEnvConfig } from "dotenv";

export function buildAppSecret(targetPrivateKey: string | undefined) {
  dotEnvConfig();
  const infuraProjectId = process.env.INFURA_PROJECT_ID;
  const infuraProjectSecret = process.env.INFURA_PROJECT_SECRET;
  const appDeveloperSecretJsonString = JSON.stringify({
    infuraProjectId: infuraProjectId,
    infuraProjectSecret: infuraProjectSecret,
    targetPrivateKey: targetPrivateKey,
  });
  const buff = Buffer.from(appDeveloperSecretJsonString, "utf-8");
  const encodedAppDeveloperSecret = buff.toString("base64");
  return encodedAppDeveloperSecret;
}
