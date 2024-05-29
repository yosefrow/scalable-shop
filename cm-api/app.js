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
  res.send('Hello World! look at me go bobby and henry and sally!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})