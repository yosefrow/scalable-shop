# scalable-shop
Shop that is designed to be scalable

## Kafka 

## Local Development

For Local Docker Kafka testing you can use `zoe`

~/.zoe/config/default.yaml 

```yaml
---
runners:
  default: "local"
clusters:
  docker:
    props:
      bootstrap.servers: "localhost:9092"
      key.deserializer: "org.apache.kafka.common.serialization.StringDeserializer"
      value.deserializer: "org.apache.kafka.common.serialization.StringDeserializer"
      key.serializer: "org.apache.kafka.common.serialization.StringSerializer"
      value.serializer: "org.apache.kafka.common.serialization.ByteArraySerializer"
```

Edit Hosts: `echo 127.0.0.1 kafka` >> /etc/hosts`
Docker Compose: `docker-compose up`

### Kubernetes Deployment

K8s Deployment: `helm install kafka oci://registry-1.docker.io/bitnamicharts/kafka -f kafka/values.yaml --namespace kafka --create-namespace`

**Troubleshooting K8s Kafka deployment**

Setup Configuration File

```bash
cd kafka
# Properties can contain secrets so copy to an ignored file
cp client.example.properties client.properties

# Get client secret from kubernetes
export KAFKA_PASSWORD="$(kubectl get secret kafka-user-passwords --namespace kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1)";

# Generate config from template
cat client.properties.tpl | envsubst | tee > client.properties
```

Create a troubleshooting pod with kafka-cli

```bash
kubectl run kafka-client --restart='Never' --image docker.io/bitnami/kafka:3.7.0-debian-12-r6 --namespace kafka --command -- sleep infinity
kubectl cp --namespace kafka client.properties kafka-client:/tmp/client.properties
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

