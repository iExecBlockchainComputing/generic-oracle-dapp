import fetch from "node-fetch";
import { postMultiForwardRequest } from "../../src/forward/forwardSender";
import { forwarderApiUrl } from "../../src/forward/forwardEnvironment";

jest.mock("node-fetch");

const TASK_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000abc";
const ORACLE_ID = "0x1";

describe("Forward signer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  //TODO: Unskip
  test.skip("should successfully forward", async () => {
    (fetch as any).mockImplementation(async () => ({
      ok: true,
    }));

    await postMultiForwardRequest({ some: "request" }, ORACLE_ID, TASK_ID);

    expect(fetch).toHaveBeenCalledWith(forwarderApiUrl + "/forward", {
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
      await postMultiForwardRequest({ some: "request" }, ORACLE_ID, TASK_ID)
    ).toBe(false);
  });
});
