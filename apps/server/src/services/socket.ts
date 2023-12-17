import { Server } from 'socket.io'
import Redis from 'ioredis'
import prismaClient from './prisma'
import { produceMessage } from './kafka'

type MessageType = {
  message: string
}
const pub = new Redis({
  host: process.env.SOCKET || '',
  port: 14595,
  username: 'default',
  password: process.env.SOCKET_PASSWORD || '',
  maxRetriesPerRequest: 100,
})

const sub = new Redis({
  host: process.env.SOCKET || '',
  port: 14595,
  username: 'default',
  password: process.env.SOCKET_PASSWORD || '',
  maxRetriesPerRequest: 100,
})

class SocketService {
  private _io: Server

  constructor() {
    console.log('Init Socket Service...')
    this._io = new Server({
      cors: {
        allowedHeaders: ['*'],
        origin: '*',
      },
    })
    sub.subscribe('MESSAGES')
  }

  public initListeners() {
    const io = this.io
    console.log('Init Socket Listeners...')

    io.on('connect', (socket) => {
      console.log(`New Socket Connected`, socket.id)
      socket.on('event:message', async ({ message }: { message: string }) => {
        console.log('New Message Rec.', message)
        // publish this message to redis
        await pub.publish('MESSAGES', JSON.stringify({ message }))
      })
    })

    sub.on('message', async (channel, message) => {
      if (channel === 'MESSAGES') {
        console.log('new message from redis', message)
        io.emit('message', message)
        // Write the message to the DB
        // await prismaClient.message.create({
        //   data: {
        //     text: JSON.parse(message),
        //   },
        // })
        await produceMessage(message)
        console.log('new message produce to kafka', message)
      }
    })
  }

  get io() {
    return this._io
  }
}

export default SocketService
