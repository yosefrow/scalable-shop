import KafkaConfig from "./kafka-config.js"

const sendMessageToKafka = async (req, res) => {
    try {
        const message = JSON.stringify(req.body)
        const kafkaConfig = new KafkaConfig()
        const messages = [
            { key: 'key1', value: message}
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
