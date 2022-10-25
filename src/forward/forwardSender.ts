import fetch from "node-fetch";
import { forwarderApiUrl } from "./forwardEnvironment";

export async function postMultiForwardRequest(
  signedForwardRequest: any,
  oracleId: string,
  taskId: string
): Promise<boolean> {
  console.log(signedForwardRequest);
  const response = await fetch(forwarderApiUrl + "/forward", {
    method: "post",
    body: JSON.stringify(signedForwardRequest),
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    console.log(
      "Successful response from Forwarder API [oracleId:%s, taskId:%s]",
      oracleId,
      taskId
    );
    return true;
  }
  console.error(
    "Failure response from Forwarder API [oracleId:%s, taskId:%s, error:%s, data:%s]",
    oracleId,
    taskId,
    response.status,
    await response.json().then((body) => console.log(body.message))
  );
  return false;
}
