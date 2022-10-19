import fetch from "node-fetch";
import { forwarderApiUrl } from "./forwardEnvironment";

export async function postMultiForwardRequest(
  multiForwardRequest: any,
  oracleId: string,
  taskId: string
): Promise<boolean> {
  const response = await fetch(forwarderApiUrl + "/forward", {
    method: "post",
    body: JSON.stringify(multiForwardRequest),
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
    await response.json().then((aa) => console.log(aa.message))
  );
  return false;
}
