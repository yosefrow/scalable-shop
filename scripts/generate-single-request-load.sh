#!/bin/bash

INGRESS_HOST=localhost

i=0
while true; do
    curl -s http://${INGRESS_HOST}/scalable-shop-cm-server/buy \
    --header 'Content-Type: application/json' \
    --data '{
        "username": "load",
        "userid": "005",
        "price": "1195.30",
        "timestamp": "2024-05-31T15:54:32.204Z"
    }'
    i=$((i+1))
    echo $i
done