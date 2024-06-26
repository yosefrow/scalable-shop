# Scalable Shop

Shop that is designed to be scalable.

**Please make sure to read the important sections at the end of the page**

- [Assumptions, Understandings, and Notes](#assumptions-understandings-and-notes)
- [Production Considerations](#production-considerations)

## General Flows

1. Frontend (/buy) -> cm-server -> Kafka (produce)
2. Frontend (/getAllUserBuys/{user}) -> cm-server -> cm-api (/buyList/{user})
3. cm-api -> Kafka (consume purchase)
4. cm-api -> MongoDB (insert and find purchases for user)

## Data structures

1.  Each purchase consists of the following fields
    1.  **username:**: name of the user purchasing
    2.  **userid**: id of the user purchasing
    3.  **price**: price of the item
    4.  **timestamp**: when the purchase was sent

## Kafka & Kafka UI

Kafka and Kafka UI are installed and configured with helm using 3 controllers and one broker configuration for KRaft. See [kafka/README.md](kafka/README.md) for more info.

- [Install & Upgrade](kafka/README.md#install--upgrade)
- [Install & Upgrade UI](kafka/README.md#install--upgrade-1)

### Notes

Strimzi was considered as a possible solution for kafka, but in this case the bitnami chart was good enough for the task.

## MongoDB

MongoDB is installed and configured with helm using PSA configuration. See [mongodb/README.md](mongodb/README.md) for more info.

- [Install & Upgrade](mongodb/README.md#install--upgrade)

## ingress-nginx

Install Ingress-Nginx to handle external requests to cm-server

```bash
helm repo add nginx-stable https://helm.nginx.com/stable
helm repo update
helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx --namespace ingress-nginx --create-namespace
```

## Customer Management API (cm-api)

Customer-Management API for scalable-shop

1. Provide an API that's queried by customer-management server 
2. Consume events from Kafka that were produced by cm-server service

cm-api is installed and configured with helm. See [cm-api/README.md](cm-api/README.md) for more info.

- [Install & Upgrade](cm-api/README.md#install--upgrade)

## Customer Management Server (cm-server)

Customer-Management Server for scalable-shop

1. Provide Endpoints that are accessed by the customer frontend
2. Produce events for Kafka based on buy data sent via the customer frontend that are consumed by the cm-api service
3. Make requests from cm-api e.g. 

cm-server is installed and configured with helm. See [cm-api/README.md](cm-server/README.md) for more info.

- [Install & Upgrade](cm-server/README.md#install--upgrade)

## Test The Application

Set Environment

```bash
export INGRESS_HOST=localhost
```

### External Health Check

```bash
curl http://${INGRESS_HOST}/scalable-shop-cm-server/healthz
```

Expected Response:

`Success`

### Make a purchase

```bash
curl http://${INGRESS_HOST}/scalable-shop-cm-server/buy \
--header 'Content-Type: application/json' \
--data '{
	"username": "joe",
	"userid": "005",
	"price": "1195.30",
	"timestamp": "2024-05-31T15:54:32.204Z"
}'
```

Expected Response:

```json
{
    "status": "Ok!",
    "message": "Message successfully sent to Kafka!"
}
```

### Get Purchases

```bash
curl http://${INGRESS_HOST}/scalable-shop-cm-server/getAllUserBuys/joe
```

Expected response:

```json
{
    "username": "joe",
    "purchases": [
        {
            "_id": "665ca845678cb66959d42f4a",
            "username": "joe",
            "userid": "005",
            "price": "1195.30",
            "timestamp": "2024-05-31T15:54:32.204Z"
        }
    ]
}
```

## Assumptions, Understandings, and Notes

1. We assume that timestamp is sent by the client and reflects when the request was sent. However, in case this should be when request is received, a timestamp should be generated by the server.
2. Based on the initial spec for this project it seems that getAllUserBuys and buyList endpoints should provide similar results. Ideally, we should probably use snake cased paths for APIs e.g. buy-list and also use consistent naming to avoid confusion later. However getAllUserBuys and buyList names were used to be consistent with the spec.
3. We did not overly generalize controllers (kafka controller can either consume or produce depending on the service) -- but maintaining a single shared kafka controller might be better.

## Production Considerations

While some efforts were made to increase security and availability, due to the nature of this project being a PoC, you should *definitely* not use this project as-is in production. In order to make this project production ready, the following points should be considered.

1. Caching and more unique message lookup scenarios were not part of the design
2. It is probably better to store users in a separate collection with userid and username and then lookup username by userid for example
3. We can also consider a design where we consistently update a user's list of purchase ids, so we don't need to find which purchases are associated with a user every time.
4. Currently logs are verbose by default and no logging controller is used. Generally different log levels should be set with varying levels of verbosity and and production logs should be minimized by default to avoid log spam
5. NodePorts services are used for debugging purposes. In a production environment the service type should be changed to hide internal services.
6. Healthchecks are incomplete (e.g. in the PoC we don't check dependent services like mongodb and kafka) so a service reports itself as healthy even when it can't handle requests
7.  We should check all data before its submitted to avoid duplicate purchases e.g. purchases with same value sent at exact time
8.  Every request and attached data submitted from the client-side should be validated to prevent various cyber attacks.
9.  TLS is not used at all, but in production environments, connections should be encrypted with TLS
10. API Authentication should be used to ensure that requests come form a trusted source
11. Dedicated non-root users or IAM Authorization should be used for database and queue connections
12. Secret values should not be placed in the deployment as env vars. They should actually come from a secret (even though atm most clusters use Opaque secrets)
