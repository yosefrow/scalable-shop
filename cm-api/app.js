import express from "express";
import bodyParser from "express";

const app = express()
const port = 3000
const jsonParser = bodyParser.json()

app.get('/', (req, res) => {
  res.send('Hello World! look at me go bobby and henry and sally!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})