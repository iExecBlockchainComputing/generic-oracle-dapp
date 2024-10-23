import {
  getForwarderApiUrl,
  getOnChainConfig,
} from "../../src/forward/forwardEnvironment";

describe("Environment", () => {
  test("should get environment", async () => {
    expect(getForwarderApiUrl()).toContain("https");
    expect(getOnChainConfig(1)).toBeDefined();
    expect(getOnChainConfig(137)).toBeDefined();
  });
});
