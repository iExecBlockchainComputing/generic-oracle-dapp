export function buildAppSecret(targetPrivateKey: string | undefined) {
  const appDeveloperSecretJsonString = JSON.stringify({
    targetPrivateKey: targetPrivateKey,
  });
  const buff = Buffer.from(appDeveloperSecretJsonString, "utf-8");
  const encodedAppDeveloperSecret = buff.toString("base64");
  return encodedAppDeveloperSecret;
}
