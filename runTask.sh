#!/bin/bash
# Usage: ./runTask.sh <0xrequesterAddress>

REQUESTER=$1
# Bellecour prod pool
WORKERPOOL=0xEb14Dc854A8873e419183c81a657d025EC70276b
WALLET="--wallet-address $REQUESTER"
CHAIN="--chain bellecour"

iexec order sign --request $CHAIN
WORKERPOOL_ORDER=$(iexec orderbook workerpool --tag tee $WORKERPOOL $CHAIN --raw | jq -r .workerpoolOrders[0].orderHash)
echo "WORKERPOOL_ORDER: $WORKERPOOL_ORDER"
iexec order fill --workerpool $WORKERPOOL_ORDER $CHAIN $WALLET
