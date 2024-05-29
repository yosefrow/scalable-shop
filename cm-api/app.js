import express from "express";
import bodyParser from "express";
import controller from "./controller.js";
import KafkaConfig from "./config.js";

const app = express()
const port = 3000
const jsonParser = bodyParser.json()

app.post('/api/send', jsonParser, controller.sendMessageToKafka)

const kafkaConfig = new KafkaConfig()
kafkaConfig.consume('my-topic', (value) => {
  console.log(value)
})

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