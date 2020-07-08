#!/bin/sh
set -e
set -u

docker run --rm -t -v ${PWD}/yarn.lock:/workspace/yarn.lock -v ${PWD}/package.json:/workspace/package.json -v ${PWD}/.deps:/workspace/.deps  nodejs-license-dashes:next
