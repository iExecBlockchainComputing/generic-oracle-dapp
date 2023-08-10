#!/bin/bash

################################################################################
# Script Name: runTask.sh
# Description: This script is used to run tasks for either development or production environments.
# 
# Usage:
#   ./runTask.sh <environment>
#
#   <environment>:
#     dev  - Runs tasks specific to the development environment.
#     prod - Runs tasks specific to the production environment.
#
# Example:
#   ./runTask.sh dev   - Executes the development tasks.
#   ./runTask.sh prod  - Executes the production tasks.
#
# Note:
#   - Please ensure to provide the correct environment argument.
#   - The script initializes the iexec environment before executing the respective tasks.
################################################################################

#Both of the oracle sould registered on the Smart Contract this string : "Bitcoin"

# Check for 'dev' or 'prod' and run the init commands
if [ "$1" == "dev" ] || [ "$1" == "prod" ]; then
    echo "Executing init command..."
    iexec init
    iexec init storage

else
    echo "Error: Invalid argument. Please provide 'dev' or 'prod' as an argument."
    exit 1
fi

# Check the provided argument
if [ "$1" == "dev" ]; then
    echo "Executing dev command..."
    #to run run the development dapp
    iexec app run oracle-factory-dev.apps.iexec.eth --tag tee,scone --workerpool prod-v8-bellecour.main.pools.iexec.eth --input-files https://ipfs-gateway.v8-bellecour.iex.ec/ipfs/QmNvWJ2W2u1PeaG5KnsqNguMsDPqTBS8NGtq81cVU5PXsF --callback 0x0132DaF5c7C177499c256b5eaC30E7201A9b75e2 --watch


elif [ "$1" == "prod" ]; then
    echo "Executing prod command..."
    #to run the production dapp
    iexec app run oracle-factory.apps.iexec.eth --tag tee,scone --workerpool prod-v8-bellecour.main.pools.iexec.eth --input-files https://ipfs-gateway.v8-bellecour.iex.ec/ipfs/QmNvWJ2W2u1PeaG5KnsqNguMsDPqTBS8NGtq81cVU5PXsF --callback 0x36dA71ccAd7A67053f0a4d9D5f55b725C9A25A3E --watch
fi