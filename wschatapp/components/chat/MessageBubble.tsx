import { Message } from '@/types'
import { Bot, User, Trash2 } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
  onDelete?: (id: string) => void
}

export default function MessageBubble({ message, onDelete }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`flex items-end gap-2 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser ? 'bg-blue-600' : 'bg-white border-2 border-blue-200'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-blue-600" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white text-gray-800 border border-blue-100 rounded-bl-sm'
          }`}
        >
          {message.content}
          
          {isUser && onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md"
              title="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          {isAssistant && onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-md"
              title="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <span className="text-xs text-gray-400 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  )
}