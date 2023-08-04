export function buildAppSecret(targetPrivateKey: string | undefined) {
  return JSON.stringify({
    targetPrivateKey: targetPrivateKey,
  });
}
