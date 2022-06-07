# Generic Oracle Iexec Dapp

This application is meant to build a docker container usable in SGX iexec tasks. The dapp take an input file containing a param set in a JSON format. The param set describe the request that should be done to the target API in order to get the wanted data.

The target API must answer by a JSON response.

## Build the project

* Copy smart-contract TS files to `contracts/typechain/`

---

## Parameters set spec

⚠️ **DO NEVER PUT YOUR API KEY INSIDE THE PARAM SET**

The parameters must be a correct JSON object with those fields, no default value will be used.

- `"body" :` The raw string of the request's body.

- `"dataType" :` Must contain "number" or "string" to specify the expected type of the data

- `"dataset" :` The ethereum address hex string of the dataset smart contract.

- `"headers" : ` Contain a sub object composed of the http request headers key - values

- `"JSONPath" :` The JSON path of the data inside the request's answer. Must be a valid [JSON path](https://support.smartbear.com/alertsite/docs/monitors/api/endpoint/jsonpath.html)

- `"method" :` The request's HTTP word

- `"url" :` Should contain the full URL of the API endpoint. **Note that any call to a non-https URL will fail**

The dataset is the only optional field. Adding an unexpected field will produce an error.

## Specify an api key

Param set are meant to be publicly revealed, therefore, api keys can't be directly put inside the param set.

To specify where the API key should be, insert the string `%API_KEY%` instead. This string will be replaced by the api key in the dataset if it's found in the `url`, `body` or one of the `header` field.

The API key itself should be specified in the dataset

## Dataset format

The dataset itself should be a JSON with two fields :

`"apiKey" :` the raw API key
`"callParamsId" :` the hash of the used pararm set

## Dapp Test

To run the tests do `npm i` as sual then run `npm test`

## Build TEE debug image

Prerequisites:

- bash
- docker
- SCONE community account
- SCONE build tools for iExec

```
npm run build
```
