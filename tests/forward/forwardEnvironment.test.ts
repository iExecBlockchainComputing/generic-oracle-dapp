import {
  getForwarderApiUrl,
  getOnChainConfig,
} from "../../src/forward/forwardEnvironment";

describe("Environment", () => {
  test("should get environment", async () => {
    expect(getForwarderApiUrl()).toContain("http");
    expect(getOnChainConfig(5)).not.toBeUndefined();
    expect(getOnChainConfig(80001)).not.toBeUndefined();
  });
});
