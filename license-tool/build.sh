#!/bin/sh
set -e
set -u

docker build -f ${PWD}/license-tool/Dockerfile -t quay.io/che-incubator/license-tool:next .
