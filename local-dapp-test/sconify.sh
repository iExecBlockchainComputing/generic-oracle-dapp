#!/bin/bash

# declare the app entrypoint
ENTRYPOINT="node /app/app.js"
USER_DOCKER_HUB="your_docker_hub_username"
# Declare image related variables
IMG_NAME=generic-oracle-dapp
NON_TEE_TAG=non-tee
DEBUG_TAG=1.0.0-debug
IMG_FROM=${USER_DOCKER_HUB}/${IMG_NAME}:${NON_TEE_TAG}
IMG_TO=${USER_DOCKER_HUB}/${IMG_NAME}:${DEBUG_TAG}


# build the regular non-TEE image
docker build . -t ${IMG_FROM}
docker pull registry.scontain.com:5050/sconecuratedimages/node:14.4.0-alpine3.11

docker run -it --rm \
            -v /var/run/docker.sock:/var/run/docker.sock \
            registry.scontain.com:5050/scone-production/iexec-sconify-image:5.3.7 \
            sconify_iexec \
                --name=${IMG_NAME} \
                --from=${IMG_FROM} \
                --to=${IMG_TO} \
                --binary-fs \
                --fs-dir=/app \
                --host-path=/etc/hosts \
                --host-path=/etc/resolv.conf \
                --binary=/usr/local/bin/node \
                --heap=1G \
                --dlopen=2 \
                --no-color \
                --command=${ENTRYPOINT} \
                && echo -e "\n------------------\n" \
                && echo "successfully built TEE docker image => ${IMG_TO}" \
                && echo "application mrenclave.fingerprint is $(docker run -it --rm -e SCONE_HASH=1 ${IMG_TO})"
