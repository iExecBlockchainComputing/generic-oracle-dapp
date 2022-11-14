import config from "../config.json";

function getConfig(): Config {
  return config;
}

export function getForwarderApiUrl() {
  return getConfig().forwarderApiUrl;
}

export function getOnChainConfig(chainId: number) {
  return getConfig().onChainConfig[chainId];
}

export interface Config {
  forwarderApiUrl: string;
  onChainConfig: Record<number, OnChainConfig>;
}

export interface OnChainConfig {
  forwarder: string;
  oracle: string;
  providerUrl: string | undefined;
}
