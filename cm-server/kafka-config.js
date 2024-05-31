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
