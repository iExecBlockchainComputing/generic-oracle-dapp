// localhost
//export const forwarderApiUrl = "http://localhost:5000";
// dev.iex.ec
export const forwarderApiUrl = "https://forwarder.dev-oracle-factory.iex.ec";

const chainIdToOnChainConfig: Record<number, OnChainConfig> = {
  // Goerli
  5: {
    forwarder: "0x2aD6aD4F35cf7354fE703da74F459690dBcC12bf",
    oracle: "0x8dFf608952ADCDa4cF7320324Db1ef44001BE79b",
    providerUrl: undefined, //use default provider from ethers
  },
  // Mumbai Polygon
  80001: {
    forwarder: "0xa715674ecf9D14141421190b6f8Acf20686b54d7",
    oracle: "0x330031CF7e6E2C318Dba230fe25A7f39fD3644EA",
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
