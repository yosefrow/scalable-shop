import KafkaConfig from "./config.js"

const sendMessageToKafka = async (req, res) => {
    try {
        const {message} = req.body
        const kafkaConfig = new kafkaConfig()
        const messages = [
            { key: 'key1', value: message}
        ]
        kafkaConfig.produce("my-topic", messages)

        res.status(200).json({
            status: "Ok!",
            message: "Message successfully sent!"
        })
    } catch (error) {
        console.log(error)
    }
}

const controllers = { sendMessageToKafka }

export default controllers
