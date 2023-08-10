# Generic Oracle Iexec Dapp

This application is meant to build a docker container usable in SGX iexec tasks. The dapp take an input file containing a param set in a JSON format. The param set describe the request that should be done to the target API in order to get the wanted data.

The target API must answer by a JSON response.

---

## Setting up the project

#### 1. Building the DApp

To compile and build the dapp code, run the following command:

```bash
npm run build
```

This command builds the dapp code, making it ready for execution.

#### 2. Running the Code Locally

If you wish to run the dapp locally without using Docker or sconification, follow the steps below:

1. **Setting up the Environment File**:

   - First, rename the `.env.override` to `.env`.
   - Move the `.env` file to the `src` folder:
     ```bash
     cp .env.override .env
     ```
   - Complete the variables inside the `.env` file as required :

     - Create the required folders `temp/iexec_in` and `temp/iexec_out` for instance
     - Inside the `temp/iexec_in` directory, create a file named (for instance) `input_file.json`.
     - You can use the following command to do that:

       ```bash
       mkdir -p temp/iexec_in temp/iexec_out && touch temp/iexec_in/input_file.json
       ```

     - To correctly set up `temp/iexec_in` file, use the following example as a guide:

       ```json
       {
         "url": "https://api.coindesk.com/v1/bpi/currentprice.json",
         "method": "GET",
         "headers": {},
         "dataType": "number",
         "JSONPath": "$.bpi.USD.rate_float",
         "dataset": "0x0000000000000000000000000000000000000000",
         "body": ""
       }
       ```

     Note: This is a basic example that does not include the API_KEY. To appropriately set up the input_file.json, follow the [Param set spec file section later in this README](#Param-set-spec-file).

2. **Configuring for Local, Dev, or Production**:

   - You should choose the configuration file that corresponds to your intended environment:
     - Use `config.local.json` if you are running the API locally.
     - Use `config.dev.json` if you intend to use the dev forwarder API that forwards the oracle's result to the development smart contract.
     - Use `config.prod.json` if you plan to utilize the prod forwarder API that updates the production oracle Smart Contract.
   - Move the chosen configuration file to the `src` folder and rename it to `config.json`. For instance, if you're setting up for local, you can use this following command:
     ```bash
     cp config.local.json src/config.json
     ```

3. **Running the Local Server**:
   - Once you have the environment and configuration set up, run the code using the following command:
     ```bash
     npm run start:local
     ```

#### 3. Testing the DApp

To perform a test coverage of the dapp, run:

```bash
npm run test
```

This command will test the dapp and provide a coverage report, ensuring that the dapp functions as expected.

---

## Param set spec file

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

#### Specify an api key

Param set are meant to be publicly revealed, therefore, api keys can't be directly put inside the param set.

To specify where the API key should be, insert the string `%API_KEY%` instead. This string will be replaced by the api key in the dataset if it's found in the `url`, `body` or one of the `header` field.

The API key itself should be specified in the dataset

#### Dataset format

The dataset itself should be a JSON with two fields :

`"apiKey" :` the raw API key
`"callParamsId" :` the hash of the used param set

---

## Test deployed Dapp on live network

#### Overview

The `runTask.sh` script facilitates task execution for either development (`dev`) or production (`prod`) environments. Before running specific tasks, it initializes the iexec environment.

#### Prerequisites

- Ensure you have the necessary permissions to execute the script. If not, you can grant them with the following command:

```bash
chmod +x runTask.sh
```

#### Usage

Execute the script with the desired environment argument:

```bash
./runTask.sh <environment>
```

Where `<environment>` can be:

- `dev` for development tasks
- `prod` for production tasks

#### Examples

1. To run tasks for the development environment:

```bash
./runTask.sh dev
```

2. To run tasks for the production environment:

```bash
./runTask.sh prod
```

#### Note

Make sure to provide the correct environment argument. The script will exit with an error if an invalid argument is provided.
When it's done, you can check the result on the Smart Contract [Bellecour explorer](https://blockscout-bellecour.iex.ec/). See the Smart Contract Address on the github [README](https://github.com/iExecBlockchainComputing/generic-oracle-contracts/blob/main/README.md)

---

## Build native image (TODO: update this section and clean local-dapp-test folder)

```
docker image build -f docker/Dockerfile -t generic-oracle-dapp:local --build-arg CONFIG_FILE=config.local.json .
```

#### Build TEE debug image

Prerequisites:

- bash
- docker
- SCONE community account
- SCONE build tools for iExec

```
npm run scone
```

Sure, I'll add the information you provided into the existing guide. Here's the updated section for your `README.md`:
