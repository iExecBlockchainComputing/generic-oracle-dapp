// localhost
//export const forwarderApiUrl = "http://localhost:5000";
// dev.iex.ec
export const forwarderApiUrl = "https://forwarder.dev-oracle-factory.iex.ec";

const chainIdToOnChainConfig: Record<number, OnChainConfig> = {
  // Goerli
  5: {
    forwarder: "0xc83de370A0D1C99F3D3D9e77bd930520ded81fFA",
    oracle: "0x8Ad317241854b1A29A06cE5478e6B92FA09Cd03a",
    providerUrl: undefined, //use default provider from ethers
  },
  // Mumbai Polygon
  80001: {
    forwarder: "0x6843aA5A3a777Ae750DD9d93a9D0fdF99e061b53",
    oracle: "0x68bDfa911178f72CEA7BCFd0FeEbbA4cDDE24eCF",
    providerUrl: "https://rpc-mumbai.maticvigil.com",
  },
};
export function getOnChainConfig(chainId: number) {
  return chainIdToOnChainConfig[chainId];
}

export interface OnChainConfig {
  forwarder: string;
  oracle: string;
  providerUrl: string | undefined;
}
