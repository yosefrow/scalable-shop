import express from "express"
import bodyParser from "body-parser"
import KafkaConfig from "./kafka-config.js"
import MongoController from "./mongodb-controller.js"

const app = express()
const port = 3000
const jsonParser = bodyParser.json()

const kafkaConfig = new KafkaConfig()

kafkaConfig.consume((msg) => {
  console.log(msg)
  MongoController.insertPurchase(JSON.parse(msg))
})

app.get('/buyList/*', jsonParser, MongoController.findPurchases)

app.get('/', (req, res) => {
  res.send({
    '/': 'Get API Info',
    '/healthz': 'Health check',
    '/buyList/{username}': 'Get Purchases for given username'
  })
})

app.get('/healthz', (req, res) => {
  res.send('Success')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})