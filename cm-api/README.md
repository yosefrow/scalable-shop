# Customer Management API

## app.js

1.  Method: Get all customer purchases - for specific customer (userid)
    1.  Query mongoDB for list of all customer purchases
    2.  Read purchase from MongoDB by userid
    3.  Originally looks like we want a list of purchases only but based on ui task, looks like we care about purchases for our user only so maybe we should consider storing requests by user ……**.but this kind of feels wrong. The data type is purchases. Maybe we can associate purchases to a user by id somehow 💡**
    4.  **Example**
        1.  **User:**
            1.  **Id**
            2.  **Name**
            3.  **Purchases(ids)**
        2.  **Purchase:** 
            1.  **Userid:**
            2.  **Userid.username**
            3.  **Price,**
            4.  **timestamp**
2.  Method: Store data in MongoDB
    1.  Write purchase data into MongoDB
3.  Main Loop: Kafka Consumer
    1.  Watch for and consume messages from Kafka
        1.  Messages contain “buy” request data object
            1.  username, userid, price, timestamp
        2.  Calls Store data in MongoDB Method

## config.js

## controller.js

## API Definition

- /
  - returns information about the api
- /healthz
  - returns 200, "Success" when successful
  - returns 503, "Service Unavailable" when healthcheck fails
- /get-all-user-buys
  - GET route - Return all customer purchases

## Considerations

## Local Development

### Docker Environment

Docker compose is used to test the app with docker

run with: `docker-compose up --build`
test with: `curl localhost:3030/healthz`

### Local Host Environment

You can also perform a more basic test using flask on your host machine

```bash
# Setup dev config and configure it
cp .env.example .env

# Install and Run th app
npm install
npm run dev

# Test the app
curl localhost:3000/healthz
```

### Helm Chart

Build Image for k8s Architecture with `./scripts/docker-build-and-push.sh ./cm-api yosefrow/scalable-shop-cm-api:latest`

Package and Push with `scripts/helm-package-and-push.sh cm-api/helm yosefrow`

## Helm Commands

- *Install & Upgrade*:
```bash
export VERSION=0.1.0
export KAFKA_PASSWORD="$(kubectl get secret kafka-user-passwords -n kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1)"
helm upgrade --install scalable-shop-cm-api oci://registry-1.docker.io/yosefrow/scalable-shop-cm-api \
  --version "$VERSION" --set kafka.password="$KAFKA_PASSWORD" \
  --namespace scalable-shop --create-namespace
```
- *Uninstall*:
  - `helm uninstall scalable-shop-cm-api --namespace scalable-shop`
- *Template*
  - `helm template $CHART`
- *Test*
  - `helm test scalable-shop-cm-api --namespace scalable-shop`