'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/types'
import MessageBubble from './MessageBubble'
import { Bot } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  isTyping: boolean
  deleteMessage: (id: string) => void
  editMessage: (id: string, newContent: string) => void
}

export default function MessageList({ messages, isTyping, editMessage, deleteMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Find index of last user message
  const lastUserMessageIndex = messages.map(m => m.role).lastIndexOf('user')

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
      {messages.length === 0 && !isTyping && (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Start a conversation</h3>
            <p className="text-sm text-gray-400 mt-1">Ask me anything — I'm powered by Gemini AI</p>
          </div>
        </div>
      )}

      {messages.map((message, index) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          onDelete={deleteMessage}
          onEdit={editMessage}
          isLastUserMessage={message.role === 'user' && index === lastUserMessageIndex}
        />
      ))}

      {isTyping && (
        <div className="flex items-end gap-2">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <div className="bg-white border border-blue-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <div className="flex gap-1 items-center h-4">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}