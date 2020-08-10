#!/bin/bash

# Validate yarn.lock
if [ -f yarn.lock ]; then
    node dash-licenses/yarn/index.js | \
    java -jar dash-licenses/target/org.eclipse.dash.licenses-0.0.1-SNAPSHOT.jar -
    echo "The DEPENDENCIES file has been generated."
    node ./bump-deps.js
else
    echo "The yarn.lock file is not present!!!"
fi
