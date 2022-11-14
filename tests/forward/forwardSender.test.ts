import fetch from "node-fetch";
import { postForwardRequest } from "../../src/forward/forwardSender";
import { getForwarderApiUrl } from "../../src/forward/forwardEnvironment";

jest.mock("node-fetch");
jest.mock("../../src/forward/forwardEnvironment");

const TASK_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000abc";
const ORACLE_ID = "0x1";

describe("Forward signer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("should successfully forward", async () => {
    (fetch as any).mockImplementation(async () => ({
      ok: true,
    }));
    jest
      .mocked(getForwarderApiUrl)
      .mockImplementation(() => "http://forwarder");

    await postForwardRequest({ some: "request" }, ORACLE_ID, TASK_ID);

    expect(fetch).toHaveBeenCalledWith("http://forwarder/forward", {
      method: "post",
      body: '{"some":"request"}',
      headers: { "Content-Type": "application/json" },
    });
  });

  test("should not forward", async () => {
    (fetch as any).mockImplementation(async () => ({
      ok: false,
      status: 500,
      json: () =>
        Promise.resolve({
          message: "error message",
        }),
    }));

    expect(
      await postForwardRequest({ some: "request" }, ORACLE_ID, TASK_ID)
    ).toBe(false);
  });
});
