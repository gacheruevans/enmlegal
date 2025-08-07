'use client';
import React, { Fragment, useState } from 'react'
import axios from 'axios'

type message = {role:'user' | 'assistant', content: string}


const ChatBot = () => {
    const [messages, setMessages] = useState<message[]>([])
    const [minimize, setMinimize] = useState<boolean>(false)
    const [input, setInput] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessage: message = { role: 'user', content: input }
        setMessages([...messages, newMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await axios.post('http://localhost:3000/chat', {
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
    <div className="fixed max-w-xl p-4 mx-auto right-8 bottom-8 ">
      <div className="relative inline-flex items-center justify-start w-full px-6 py-3 overflow-hidden font-medium transition-all bg-indigo-200 rounded hover:bg-white group ">
        <span
          className="w-48 h-48 rounded rotate-[-40deg] bg-royal absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0">
        </span>
        {/* mb-4 font-sans text-lg font-normal  */}
        <button onClick={()=> setMinimize(false)} className={`font-thin z-10 group-hover:text-white ${minimize ? '' : ` relative w-full text-base font-normal text-left text-black transition-colors duration-300 ease-in-out `}`}> AI Legal Assistant</button>
        { minimize ? null : (
        <button 
          
          onClick={() => { setMinimize(true); setMessages([]); setInput(''); setLoading(false); }}
          className="p-1 mb-4 text-amber-900 hover:text-red-700 hover:"
        >x</button>)
        }
      </div>
      { minimize ? null : (
        <Fragment>
        <div className="h-64 space-y-2 overflow-y-auto bg-slate-100">
          {messages.map((msg, idx) => (
            <div key={idx} className={`p-2 rounded-lg ${msg.role === 'user' ? 'ml-20 mt-2 bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
              {msg.content}
            </div>
          ))}
          {loading && <div className="text-sm text-gray-500">Responding...</div>}
        </div>
        <div className="flex mt-4">
            <input
              type="text"
              className="flex-1 p-2 border rounded-l"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a legal question..." />
            <button onClick={sendMessage} className="px-4 text-white bg-blue-600 rounded-r">Send</button>
          </div>
          </Fragment>
      )}
    </div>
  )
}

export default ChatBot