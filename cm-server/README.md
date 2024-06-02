# Customer Management Server

Customer-Management Server for scalable-shop

1. Provide Endpoints that are accessed by the customer frontend
2. Produce events for Kafka based on buy data sent via the customer frontend that are consumed by the cm-api service

## Data structures

1.  Each purchase consists of the following fields
    1.  **username:**: name of the user purchasing
    2.  **userid**: id of the user purchasing
    3.  **price**: price of the item
    4.  **timestamp**: when the purchase was received

## API Definition

- /
  - returns information about the API
- /healthz
  - returns 200, "Success" when successful
- /getAllUserBuys/{user}
  - GET route - Return purchases for given user
- /buy
  - POST Purchases and send to Kafka 

## app.js

1.  Method: Get all customer purchases for specific customer (username)
    1.  Query cm-api service with username
    2.  Return results to the frontend


## kafka-config.js

Initialize kafka produce configuration as an importable module.
Provide method to produce for kafka-controller

## kafka-controller.js

include kafka-config module and use it to get kafka methods and configurations
provided to app.js

*When posted requests are sent to kafka, only valid fields are extracted from the body*

## api-controller.js

provide methods to query cm-api, for example, provides access to `/buyList/{user}` path in cm-api












## Considerations

1. we did not overly generalize controllers (it can only either consume or produce depending on the service)
2. caching and more unique message lookup scenarios were not part of the design
3. It might be better to store users in a separate collection with userid and username and then lookup userid or username with whichever we use at the user key
4. Additionally we can consider a design where we add purchase ids and update a users list of purchase ids, so it isn't needed to find which purchases are associated with a user every time.

## Local Development

### Docker Environment

Docker compose is used to test the app with docker

run with: `docker-compose up --build`
test with: `curl localhost:3030/healthz`

### Local Host Environment

You can also perform a more basic test using flask on your host machine

```bash
# Setup dev config from repo root dir and configure it
cp .env.example .env

# Install and Run th app
cd cm-server
npm install
npm run dev

# Test the app
curl localhost:3000/healthz
```

### Helm Chart

Build Image for k8s Architecture with `./scripts/docker-build-and-push.sh ./cm-server yosefrow/scalable-shop-cm-server:latest`

Package and Push with `scripts/helm-package-and-push.sh cm-server/helm yosefrow`

## Helm Commands

- *Install & Upgrade*:
```bash
export KAFKA_PASSWORD="$(kubectl get secret kafka-user-passwords -n kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1)"

export VERSION=0.1.0; helm upgrade --install scalable-shop-cm-server oci://registry-1.docker.io/yosefrow/scalable-shop-cm-server \
  --version "$VERSION" \
  --set kafka.password="$KAFKA_PASSWORD" \
  --set mongodb.password="$MONGODB_ROOT_PASSWORD" \
  --namespace scalable-shop --create-namespace
```
- *Uninstall*:
  - `helm uninstall scalable-shop-cm-server --namespace scalable-shop`
- *Template*
  - `helm template $CHART`
- *Test*
  - `helm test scalable-shop-cm-server --namespace scalable-shop`
