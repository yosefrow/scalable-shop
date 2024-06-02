# scalable-shop
Shop that is designed to be scalable

### A General word about Security and Availability

While efforts are made to use decent security and availability standards, due to the nature of this project being a PoC, you should definitely not use this project as-is in production because some things will definitely be missing.

For example TLS is generally not provisioned for DB connections in this project. In general, in a production environment all components should connect securely using methods that include but are not limited to API Authentication, TLS encryption for in-transit traffic, creating dedicated non-root users, or using IAM based authentication.

## Kafka

Kafka and Kafka UI are installed and configured with helm using 3 controller and one broker configuration for KRaft. See [kafka/README.md](kafka/README.md) for more info.
Strimzi was considered as a possible solution for kafka, but in this case the bitnami chart is good enough for the task.

### Kafka Install & Upgrade

```bash
helm upgrade --install kafka oci://registry-1.docker.io/bitnamicharts/kafka -f kafka/kafka-values.yaml --namespace kafka --create-namespace
```

### Kafka UI Install & Upgrade

```bash
helm repo add kafka-ui https://provectus.github.io/kafka-ui-charts
helm install kafka-ui kafka-ui/kafka-ui
helm upgrade --install kafka-ui kafka-ui/kafka-ui -f kafka/kafka-ui-values.yaml --namespace kafka --create-namespace
```

## MongoDB

MongoDB is installed and configured with helm using PSA configuration. See [mongodb/README.md](mongodb/README.md) for more info.

### Install & Upgrade

```bash
helm upgrade --install mongodb oci://registry-1.docker.io/bitnamicharts/mongodb -f mongodb/values.yaml --namespace mongodb --create-namespace 
```

## Customer Management API (cm-api)

cm-api is installed and configured with helm. See [cm-api/README.md](cm-api/README.md) for more info.

### Install & Upgrade

```bash
export KAFKA_PASSWORD="$(kubectl get secret kafka-user-passwords -n kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1)"
export MONGODB_ROOT_PASSWORD=$(kubectl get secret --namespace mongodb mongodb -o jsonpath="{.data.mongodb-root-password}" | base64 -d)

export VERSION=0.1.0; helm upgrade --install scalable-shop-cm-api oci://registry-1.docker.io/yosefrow/scalable-shop-cm-api \
  --version "$VERSION" \
  --set kafka.password="$KAFKA_PASSWORD" \
  --set mongodb.password="$MONGODB_ROOT_PASSWORD" \
  --namespace scalable-shop --create-namespace
```

## Customer Management API (cm-server)

cm-server is installed and configured with helm. See [cm-api/README.md](cm-server/README.md) for more info.

### Install & Upgrade

```bash
export KAFKA_PASSWORD="$(kubectl get secret kafka-user-passwords -n kafka -o jsonpath='{.data.client-passwords}' | base64 -d | cut -d , -f 1)"

export VERSION=0.1.0; helm upgrade --install scalable-shop-cm-server oci://registry-1.docker.io/yosefrow/scalable-shop-cm-server \
  --version "$VERSION" \
  --set kafka.password="$KAFKA_PASSWORD" \
  --namespace scalable-shop --create-namespace
```