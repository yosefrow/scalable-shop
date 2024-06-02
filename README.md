# Scalable Shop

Shop that is designed to be scalable

## A General word about Security and Availability

While efforts are made to use some security and availability standards, due to the nature of this project being a PoC, you should definitely not use this project as-is in production because some things will definitely be missing.

For example TLS is generally not provisioned for DB connections in this project. In general, in a production environment all components should connect securely using methods that include but are not limited to API Authentication, TLS encryption for in-transit traffic, creating dedicated non-root users, or using IAM based authentication.

Additionally, every request and attached data submitted from the client-side should be validated to prevent various cyber attacks.

## Additional Considerations

1. We did not overly generalize controllers (it can only either consume or produce depending on the service)
2. Caching and more unique message lookup scenarios were not part of the design
3. It is probably better to store users in a separate collection with userid and username and then lookup username by userid for example
4. We can also consider a design where we consistently update a user's list of purchase ids, so we don't need to find which purchases are associated with a user every time.
5. Currently logs are verbose by default and no logging controller is used. Generally Different log levels should be set with varying levels of verbosity and use low level of verbosity in production by default to avoid log spam

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
helm show values ingress-nginx --repo https://kubernetes.github.io/ingress-nginx
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

cm-server is installed and configured with helm. See [cm-api/README.md](cm-server/README.md) for more info.

- [Install & Upgrade](cm-server/README.md#install--upgrade)