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
}
