const fetch = require("node-fetch");
const jp = require("jsonpath");
const { rawParamsSchema } = require("./validators");
const { API_KEY_PLACEHOLDER } = require("./conf");

const apiCall = async (rawParams) => {
  const { url, method, headers, body, apiKey, JSONPath, dataType } =
    await rawParamsSchema().validate(rawParams);

  const finalUrl = url.replace(API_KEY_PLACEHOLDER, apiKey);
  const finalHeaders = Object.entries(headers)
    .map(([k, v]) => [k, v.replace(API_KEY_PLACEHOLDER, apiKey)])
    .reduce((acc, curr) => ({ ...acc, [curr[0]]: curr[1] }), {});

  const res = await fetch(finalUrl, {
    method,
    ...{ headers: finalHeaders },
    ...(body && { body }),
  }).catch((e) => {
    throw Error(
      `Failed get a response from the API (${e})\nYou can:\n- check your connection\n- check the API url\n- check the HTTP method\n- check the API allows CORS`
    );
  });

  const json = await res.json().catch(() => {
    throw Error("The API response format is not supported, it must be a JSON");
  });

  const jsonPathResult = jp.query(json, JSONPath);

  if (jsonPathResult.length === 0) {
    throw Error(
      `JSONPath selector "${JSONPath}" returned empty result, it must return a single value:\n${JSON.stringify(
        jsonPathResult,
        null,
        2
      )}`
    );
  }
  if (jsonPathResult.length > 1) {
    throw Error(
      `JSONPath selector "${JSONPath}" returned multiple results, it must return a single value:\n${JSON.stringify(
        jsonPathResult,
        null,
        2
      )}`
    );
  }
  const selected = jsonPathResult[0];
  const typeofSelected = typeof selected;

  switch (typeofSelected) {
    case "boolean":
      if (dataType !== "boolean") {
        throw Error(
          `JSONPath selector "${JSONPath}" returned a ${typeofSelected}, wich is NOT compatible with \`dataType: "${dataType}"\`,  use \`dataType: "boolean"\` to store ${typeofSelected}`
        );
      }
      break;
    case "string":
      if (dataType !== "string") {
        throw Error(
          `JSONPath selector "${JSONPath}" returned a ${typeofSelected}, wich is NOT compatible with \`dataType: "${dataType}"\`,  use \`dataType: "string"\` to store ${typeofSelected}`
        );
      }
      break;
    case "number":
      if (dataType !== "number") {
        throw Error(
          `JSONPath selector "${JSONPath}" returned a ${typeofSelected}, wich is NOT compatible with \`dataType: "${dataType}"\`,  use \`dataType: "number"\` to store ${typeofSelected}`
        );
      }
      break;
    default:
      throw Error(
        `JSONPath selector "${JSONPath}" returned a ${typeofSelected}, it must be string, number or boolean:\n${JSON.stringify(
          selected,
          null,
          2
        )}`
      );
  }
  const date = Math.floor(new Date(res.headers.get("date")).getTime() / 1000);

  return { value: selected, date };
};

module.exports = {
  apiCall,
};
