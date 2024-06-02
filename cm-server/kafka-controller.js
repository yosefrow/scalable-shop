import KafkaConfig from "./kafka-config.js"

const sendMessageToKafka = async (req, res) => {
    try {
        const message = req.body
        const purchase = {
            username: message.username,
            userid: message.userid,
            price: message.price,
            timestamp: message.timestamp
        }
        const kafkaConfig = new KafkaConfig()
        const messages = [
            { key: 'key1', value: JSON.stringify(purchase)}
        ]
        console.log(messages)
        await kafkaConfig.produce(messages)

        res.status(200).json({
            status: "Ok!",
            message: "Message successfully sent to Kafka!"
        })
    } catch (error) {
        console.log(error)
    }
}

const controllers = { sendMessageToKafka }

export default controllers
