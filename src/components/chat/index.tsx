'use client';
import React, { useState } from 'react'
import axios from 'axios'

type message = {role:'user' | 'assistant', content: string}


const ChatBot = () => {
    const [messages, setMessages] = useState<message[]>([])
    const [input, setInput] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessage: message = { role: 'user', content: input }
        setMessages([...messages, newMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await axios.post('/api/chat', {
                message: input,
                history: messages
            })
            const reply: message = { role: 'assistant', content: response.data.reply }
            setMessages([...messages, newMessage, reply])
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setLoading(false)
        }
    }
  return (
    <div className="max-w-xl p-4 mx-auto bg-white rounded-lg shadow">
      <h2 className="mb-4 text-lg font-semibold">ENM Legal Assistant</h2>
      <div className="h-64 space-y-2 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Typing...</div>}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          className="flex-1 p-2 border rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a legal question..."
        />
        <button onClick={sendMessage} className="px-4 text-white bg-blue-600 rounded-r">Send</button>
      </div>
    </div>
  )
}

export default ChatBot