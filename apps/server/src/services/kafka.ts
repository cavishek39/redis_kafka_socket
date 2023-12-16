import { Kafka, Producer } from 'kafkajs'
import fs from 'fs'
import path from 'path'

const kafka = new Kafka({
  brokers: ['kafka-10e5ee67-cavishek39-c056.a.aivencloud.com:14608'],
  sasl: {
    username: 'avnadmin',
    password: 'AVNS_b8vgbBLXtZ7YTLWdkSI',
    mechanism: 'plain',
  },
  ssl: {
    ca: [fs.readFileSync(path.resolve('./ca.pem'), 'utf8')],
  },
})

let producer: Producer | null = null

export async function createProducer() {
  if (producer) return producer

  const _producer = kafka.producer()
  await _producer.connect()
  producer = _producer
  return producer
}

export async function produceMessage(message: string) {
  const producer = await createProducer()

  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: 'MESSAGE',
  })

  return true
}

export default kafka
