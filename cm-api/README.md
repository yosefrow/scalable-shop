# Customer Management API (cm-api)

Customer-Management API for scalable-shop

1. Provide an API that's queried by customer-management server 
2. Consume events from Kafka that were produced by cm-server service

## Data structures

1.  Each purchase consists of the following fields
    1.  **username:**: name of the user purchasing
    2.  **userid**: id of the user purchasing
    3.  **price**: price of the item
    4.  **timestamp**: when the purchase was sent

## API Definition

- /
  - returns information about the API
- /healthz
  - returns 200, "Success" when successful
- /buyList/{user}
  - GET route - Return purchases for given user

## app.js

1.  Method: Get all customer purchases for specific customer (username)
    1.  Query mongoDB for list of all customer purchases
    2.  Read purchase from MongoDB by username

2.  Main Loop: Kafka Consumer
    1.  Watch for and consume messages from Kafka
        1.  Messages contain purchases that were posted to /buy in cm-server
        2.  Calls method to insert data into MongoDB

## kafka-config.js

Initialize kafka consumer configuration as an importable module.
Provide method to consume from Kafka provided to app.js

## mongodb-client.js

Initialize mongodb client as an importable module.
Provide method to find and insert for mongodb-controller

## mongodb-controller.js

include mongodb-config module and use it to get mongodb methods and configurations
provided to app.js

*When kafka messages are forwarded to mongo, only valid fields are extracted from the message*

## Local Development

Run and test locally for development purposes (depends on local databases & queue systems, for example running kafka and mongodb through k3s with helm)

```bash
# Setup dev config from repo root dir and configure it
cp .env.example .env

# Install and Run th app
cd cm-api
npm install
npm run dev

# Test the app
curl localhost:3000/healthz
```

### Helm Chart

Build Image for k8s Architecture with `./scripts/docker-build-and-push.sh ./cm-api yosefrow/scalable-shop-cm-api:latest`

Package and Push with `scripts/helm-package-and-push.sh cm-api/helm yosefrow`

## Install & Upgrade

```bash
export KAFKA_PASSWORD="$(kubectl get secret kafka-user-passwords -n kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1)"
export MONGODB_ROOT_PASSWORD=$(kubectl get secret --namespace mongodb mongodb -o jsonpath="{.data.mongodb-root-password}" | base64 -d)

export VERSION=0.1.0; helm upgrade --install scalable-shop-cm-api oci://registry-1.docker.io/yosefrow/scalable-shop-cm-api \
  --version "$VERSION" \
  --set kafka.password="$KAFKA_PASSWORD" \
  --set mongodb.password="$MONGODB_ROOT_PASSWORD" \
  --namespace scalable-shop --create-namespace
```
## Other Helm Commands

- *Uninstall*:
  - `helm uninstall scalable-shop-cm-api --namespace scalable-shop`
- *Template*
  - `helm template $CHART`
- *Test*
  - `helm test scalable-shop-cm-api --namespace scalable-shop`
