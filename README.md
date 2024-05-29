# scalable-shop
Shop that is designed to be scalable

### A General word about Security and Availability

While efforts are made to use decent security and availability standards, due to the nature of this project being a PoC, you should definitely not use this project as-is in production because some things will definitely be missing.

For example TLS is generally not provisioned for DB connections in this project. In general, in a production environment all components should connect securely using methods that include but are not limited to API Authentication, TLS encryption for in-transit traffic, creating dedicated non-root users, or using IAM based authentication.

## Kafka 

Warning: this Kafka deployment does not include Encryption. That means if you connect to it from outside the cluster without encrypting traffic in another way, *Traffic to the cluster will be visible even if you authenticated*

### Install & Upgrade

```bash
helm upgrade --install kafka oci://registry-1.docker.io/bitnamicharts/kafka -f kafka/kafka-values.yaml --namespace kafka --create-namespace
```

*The client password is automatically generated and stored in k8s secret every time app is deployed*

values are configured so that Kafka can be reached externally at `localhost:30111`. In production environments dynamic discovery or alternative dns should be used e.g. `controller.service.domain`, `broker.service.domain`

Generally internal clients can reach Kafka at `kafka-controller-0.kafka-controller-headless.kafka.svc.cluster.local:9092`

`clusterId` is set to a unique value to avoid conflicts in state from unique id generation across multiple deploys

## Local Development

For Local Docker Kafka testing you can use [zoe](https://adevinta.github.io/zoe/) 

Get deployed Helm Chart password with `kubectl get secret kafka-user-passwords --namespace kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1"`

~/.zoe/config/default.yaml 

```yaml
---
runners:
  default: "local"
clusters:
  k8s:
    props:
      bootstrap.servers: "localhost:30111"
      key.deserializer: "org.apache.kafka.common.serialization.StringDeserializer"
      value.deserializer: "org.apache.kafka.common.serialization.StringDeserializer"
      key.serializer: "org.apache.kafka.common.serialization.StringSerializer"
      value.serializer: "org.apache.kafka.common.serialization.ByteArraySerializer"
      security.protocol: SASL_PLAINTEXT
      sasl.mechanism: PLAIN
      sasl.jaas.config: org.apache.kafka.common.security.scram.ScramLoginModule required username="user1" password="results_of_kubectl_get_secret";
```

Example commands for zoe:

*Publish data to topic*

```bash
echo '[{"id": "1", "msg": "test"}]' | zoe -c k8s topics produce -t test  --from-stdin --key-path id
```

*Get last 20 messages from Last 1hour*

```bash
zoe -c k8s --silent -o table topics consume test -n 20 --from 'PT1h'
```

**Troubleshoot K8s Kafka deployment From in the cluster**

Setup Configuration File

```bash
cd kafka

# Get client secret from kubernetes
export KAFKA_USER="user1"
export KAFKA_PASSWORD="$(kubectl get secret kafka-user-passwords --namespace kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1)";

# Generate config from template
cat client.properties.tpl | envsubst | tee > k8s.client.properties
```

Create a troubleshooting pod with kafka-cli

```bash
kubectl run kafka-client --restart='Never' --image docker.io/bitnami/kafka:3.7.0-debian-12-r6 --namespace kafka --command -- sleep infinity
kubectl cp --namespace kafka k8s.client.properties kafka-client:/tmp/client.properties
kubectl exec --tty -i kafka-client --namespace kafka -- bash
```

Test the Producer

```bash
kafka-console-producer.sh \
    --producer.config /tmp/client.properties \
    --bootstrap-server kafka.kafka.svc.cluster.local:9092 \
    --topic test
```

Test the Consumer

```bash
kafka-console-consumer.sh \
    --consumer.config /tmp/client.properties \
    --bootstrap-server kafka.kafka.svc.cluster.local:9092 \
    --topic test \
    --from-beginning
```

## Kafka UI

Deployed to the same namespace as Kafka and allows visualization of Kafka for debugging purposes. Dynamically retrieves client secret from kafka on deploy.

### Install & Upgrade

```bash
helm repo add kafka-ui https://provectus.github.io/kafka-ui-charts
helm install kafka-ui kafka-ui/kafka-ui
helm upgrade --install kafka-ui kafka-ui/kafka-ui -f kafka/kafka-ui-values.yaml --namespace kafka --create-namespace
```

## MongoDB

### Install and Upgrade

### Install & Upgrade

```bash
helm upgrade --install mongodb oci://registry-1.docker.io/bitnamicharts/mongodb -f mongodb/values.yaml --namespace mongodb --create-namespace 
```

### Local Development Connection

When running from a local k8s cluster, your main host is typically not resolvable through DNS that is visible to both the mongo in cluster and your localhost. However, it looks like Mongo requires that the dns that is advertised must be resolvable to the same host in all cases.

As such, short of playing with DNS or switching to using docker-compose with network_mode: host, the remaining option appears to be using direct connect which can be done like so:

```bash
export MONGODB_ROOT_PASSWORD=$(kubectl get secret --namespace mongodb mongodb -o jsonpath="{.data.mongodb-root-password}" | base64 -d)
mongosh mongodb://localhost:30711/admin?directConnection=true -u root -p $MONGODB_ROOT_PASSWORD
```

If you happen to not fit the description above, you can configure `externalAccess.service.domain` in Helm and use a replicaset connection string in your local development.

### Testing Replicaset Connection In K8s

The replicaset connection can be tested by running:

```bash
# Get Root secret
export MONGODB_ROOT_PASSWORD=$(kubectl get secret --namespace mongodb mongodb -o jsonpath="{.data.mongodb-root-password}" | base64 -d)

# Run a client inside the cluster
kubectl run --namespace mongodb mongodb-client --rm --tty -i --restart='Never' --env="MONGODB_ROOT_PASSWORD=$MONGODB_ROOT_PASSWORD" --image docker.io/bitnami/mongodb:7.0.11-debian-12-r0 --command -- bash

# Connect dynamically to the replicaset
mongosh admin --host "mongodb-0.mongodb-headless.mongodb.svc.cluster.local:27017,mongodb-1.mongodb-headless.mongodb.svc.cluster.local:27017" --authenticationDatabase admin -u root -p $MONGODB_ROOT_PASSWORD
```

### Arbiter Usage

We install MongoDB with the bitnami helm chart in PSA (Primary, Secondary, Arbiter) configuration since this is a PoC and we aim to reduce resources deployed.

*Please be aware of the following Caveats regarding Arbiters*

1. Using Arbiter has downsides such as not actually serving any data and failing to prevent downtime in a 3 node PSA configuration since helm updates Arbiter and Mongo stateful sets simultaneously
2. You should use at most a single arbiter to avoid fake elections (arbiters electing stale secondary)