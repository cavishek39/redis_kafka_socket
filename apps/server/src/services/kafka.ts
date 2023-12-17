import { Kafka, Producer } from 'kafkajs'
import fs from 'fs'
import path from 'path'
import prismaClient from './prisma'

const kafka = new Kafka({
  brokers: [process.env.KAFKA || ''],
  sasl: {
    username: process.env.KAFKA_USERNAME || '',
    password: process.env.KAFKA_PASSWORD || '',
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

export async function startMessageConsumer() {
  const consumer = kafka.consumer({ groupId: 'default' })

  await consumer.connect()
  await consumer.subscribe({ topic: 'MESSAGE', fromBeginning: true })

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return
      // console.log(`New message received`)

      try {
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        })
      } catch (error) {
        /**
         * If something went wrong during creating the message
         * we will pause the kafka server and try again after 1 min
         */
        console.log(`Error creating message`)
        pause()

        setTimeout(() => consumer.resume([{ topic: 'MESSAGE' }]), 60 * 1000)
      }
    },
  })
}
export default kafka
