
## MongoDB

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