import {Kafka} from "kafkajs"

class KafkaConfig {
    constructor() {
        this.kafka = new Kafka({
            clientId: "nodejs-kafka",
            brokers: [process.env.KAFKA_BROKERS],
            ssl: false,
            sasl: {
                mechanism: 'plain', // scram-sha-256 or scram-sha-512
                username: process.env.KAFKA_USERNAME,
                password: process.env.KAFKA_PASSWORD
            },            
        })
        this.topic    = process.env.KAFKA_TOPIC || 'scalable-shop-purchases'
        const groupId = process.env.KAFKA_GROUPID || 'scalable-shop'
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
