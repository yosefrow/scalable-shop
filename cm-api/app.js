import express from "express";
import bodyParser from "body-parser";
import KafkaConfig from "./kafka-config.js";
import MongoDBClient from "./mongodb-client.js";
import MongoController from "./mongodb-controller.js";

const app = express()
const port = 3000
const jsonParser = bodyParser.json()

const kafkaConfig = new KafkaConfig()
const mongoDBConfig = new MongoDBClient()

kafkaConfig.consume('my-topic', (msg) => {
  console.log(msg)
  MongoController.insertPurchase(JSON.parse(msg))
})

app.post('/find', jsonParser, MongoController.findPurchases)

app.get('/', (req, res) => {
  res.send({
    '/': 'Get API Info',
    '/healthz': 'Health check',
    '/get-all-user-buys': 'Get Purchases for given customer'
  })
})

app.get('/healthz', (req, res) => {
  res.send('Success')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})