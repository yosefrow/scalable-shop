# Kafka 

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

Get deployed Helm Chart password with `kubectl get secret kafka-user-passwords --namespace kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1`

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