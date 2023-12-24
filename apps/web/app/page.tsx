'use client'
import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'
import classes from './page.module.css'
import { UserButton } from '@clerk/nextjs'

export default function Page() {
  const { sendMessage, messages } = useSocket()
  const [message, setMessage] = useState('')

  useEffect(() => {}, [])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <UserButton />
        <input
          onChange={(e) => setMessage(e.target.value)}
          className={classes['chat-input']}
          placeholder='Message...'
        />
        <button
          onClick={(e) => sendMessage(message)}
          className={classes['button']}>
          Send
        </button>
      </div>
      <div>
        {messages.map((e, index) => (
          <li key={e + '' + index?.toString()}>{e}</li>
        ))}
      </div>
    </div>
  )
}
