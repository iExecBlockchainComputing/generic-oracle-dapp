#!/bin/bash
# IMG_FROM=docker.io/iexechub/generic-oracle-dapp:dev \
#     IMG_TO=docker.io/iexechub/generic-oracle-dapp:dev-debug \
#     ./sconify.sh

cd $(dirname $0)

ARGS=$(sed -e "s'\${IMG_FROM}'${IMG_FROM}'" -e "s'\${IMG_TO}'${IMG_TO}'" sconify.args)
echo $ARGS

/bin/bash -c "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            registry.scontain.com:5050/scone-production/iexec-sconify-image:5.3.15 \
            sconify_iexec $ARGS"
