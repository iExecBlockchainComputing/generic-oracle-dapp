import fetch from "node-fetch";
import { getForwarderApiUrl } from "./forwardEnvironment";

export async function postForwardRequest(
  signedForwardRequest: any,
  oracleId: string,
  taskId: string
): Promise<boolean> {
  const response = await fetch(getForwarderApiUrl() + "/forward", {
    method: "post",
    body: JSON.stringify(signedForwardRequest),
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    console.log(
      "Forward request accepted by Forwarder API [oracleId:%s, taskId:%s]",
      oracleId,
      taskId
    );
    return true;
  }
  console.error(
    "Forward request rejected by Forwarder API [oracleId:%s, taskId:%s, httpStatus:%s, messageBody:%s]",
    oracleId,
    taskId,
    response.status,
    await response
      .json()
      .then((body) => body.message)
      .catch((e) => undefined)
  );
  return false;
}
