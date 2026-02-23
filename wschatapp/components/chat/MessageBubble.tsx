import { Message } from '@/types'
import { Bot, User, Trash2, Edit2 } from 'lucide-react'
import { useState } from 'react'

interface MessageBubbleProps {
  message: Message
  onDelete?: (id: string) => void
  onEdit?: (id: string, newContent: string) => void
  isLastUserMessage?: boolean
}

export default function MessageBubble({ message, onDelete, onEdit, isLastUserMessage }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  return (
    <div className={`flex items-end gap-2 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
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

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {isEditing ? (
          <div className="w-full">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-400 rounded-2xl text-sm leading-relaxed focus:outline-none resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
              >
                Save & Resend
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                isUser
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-blue-100 rounded-bl-sm'
              }`}
            >
              {message.content}
              
              {(onDelete || (onEdit && isLastUserMessage)) && (
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && isLastUserMessage && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md"
                      title="Edit message"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(message.id)}
                      className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 px-1">
              {formatTime(message.created_at)}
            </span>
          </>
        )}
      </div>
    </div>
  )
}