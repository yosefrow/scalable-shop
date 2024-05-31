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
        this.producer = this.kafka.producer()
    }

    async produce(messages) {
        try {
        await this.producer.connect()
        await this.producer.send({
            topic: this.topic,
            messages: messages
        })
        } catch(error) {
            console.error(error)
        } finally {
            await this.producer.disconnect()
        }
    }
}

export default KafkaConfig
