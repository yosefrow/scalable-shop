#!/bin/bash

SCRIPT_DIR=$(dirname $0)
cd "$SCRIPT_DIR"
echo $SCRIPT_DIR

for i in {1..5}; do
    echo generate-single-request-load.sh x$i
    ./generate-single-request-load.sh &
done