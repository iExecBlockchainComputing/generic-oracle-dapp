#!/bin/bash

# declare the app entrypoint
ENTRYPOINT="node /app/app.js"
# declare an image name
IMG_NAME=generic-oracle-dapp

IMG_FROM=${IMG_NAME}:temp-non-tee
IMG_TO=${IMG_NAME}:tee-debug

# build the regular non-TEE image
docker build . -t ${IMG_FROM}

# pull the SCONE curated image corresponding to our base image
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
                --command="node /app/app.js" \
                && echo -e "\n------------------\n" \
                && echo "successfully built TEE docker image => ${IMG_TO}" \
                && echo "application mrenclave.fingerprint is $(docker run -it --rm -e SCONE_HASH=1 ${IMG_TO})"
