#!/bin/sh
set -e
set -u

docker build -f ${PWD}/license-tool/Dockerfile -t quay.io/che-incubator/nodejs-license-dashes:next .
