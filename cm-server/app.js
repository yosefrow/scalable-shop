import express from "express";
import bodyParser from "body-parser";
import KafkaController from "./kafka-controller.js";
import APIController from "./api-controller.js";

const app = express()
const port = 3001
const jsonParser = bodyParser.json()

app.get('/', (req, res) => {
  res.send({
    '/': 'Get API Info',
    '/healthz': 'Health check',
    '/getAllUserBuys': 'Get Purchases for given customer',
    '/buy': 'POST Purchases and send to Kafka'
  })
})

app.get('/healthz', (req, res) => {
  res.send('Success')
})

app.get('/getAllUserBuys/*', jsonParser, APIController.getAllUserBuys)

app.post('/buy', jsonParser, KafkaController.sendMessageToKafka)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})