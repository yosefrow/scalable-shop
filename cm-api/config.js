import {kafka} from "kafkajs";

class KafkaConfig {
    constructor() {
        this.kafka = new kafka({
            clientId: "nodejs-kafka",
            brokers: [process.env.CM_API_KAFKA_BROKERS]
        })
        this.producer = this.kafka.producer()
        this.consumer = this.kafka.consumer({ groupId: 'test-group'})
    }

    async produce(topic, message) {
        try {
        await this.producer.connect()
        await this.producer.send({
            topic: topic,
            messages: messages
        })
        } catch(error) {
            console.log(error)
        } finally {
            await this.producer.disconnect()
        }
    }

    async consume(topic, callback) {
        try {
            await this.consumer.connect()
            await this.consumer.subscribe({
                topic: topic,
                fromBeginning: true
            })
            await this.consumer.run({
                eachMessage: async ({topic, partition, message}) => {
                    const value = message.value.toString()
                    callback(value)
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export default KafkaConfig
