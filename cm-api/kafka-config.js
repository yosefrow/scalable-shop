import {Kafka} from "kafkajs"

class KafkaConfig {
    constructor() {
        this.kafka = new Kafka({
            clientId: "nodejs-kafka",
            brokers: [process.env.CM_API_KAFKA_BROKERS],
            ssl: false,
            sasl: {
                mechanism: 'plain', // scram-sha-256 or scram-sha-512
                username: process.env.CM_API_KAFKA_USERNAME,
                password: process.env.CM_API_KAFKA_PASSWORD
            },            
        })
        this.topic    = process.env.CM_API_KAFKA_TOPIC || 'scalable-shop-purchases'
        const groupId = process.env.CM_API_KAFKA_GROUPID || 'scalable-shop'
        this.consumer = this.kafka.consumer({ groupId: groupId})
    }

    async consume(callback) {
        try {
            await this.consumer.connect()
            await this.consumer.subscribe({
                topic: this.topic,
                fromBeginning: true
            })
            await this.consumer.run({
                eachMessage: async ({topic, partition, message}) => {
                    const value = message.value.toString()
                    callback(value)
                }
            })
        } catch (error) {
            console.error(error)
        }
    }
}

export default KafkaConfig
