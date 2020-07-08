#!/bin/sh
set -e
set -u

docker build -f ${PWD}/license-tool/Dockerfile -t nodejs-license-dashes:next .
