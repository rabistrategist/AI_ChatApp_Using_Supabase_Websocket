'use client'

import { useWebSocket } from '@/hooks/useWebSocket'
import { useAuth } from '@/hooks/useAuth'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Bot, LogOut, Wifi } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ChatBox() {
  const { user, signOut } = useAuth()
  const { messages, loading, isTyping, sendMessage, deleteMessage } = useWebSocket(user?.id)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-blue-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-blue-600 font-medium">Loading your chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-blue-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">Gemini Chat</h1>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500 font-medium">Live via WebSocket</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User Info */}
          <div className="hidden sm:flex items-center gap-2">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-blue-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">
                {user?.email?.[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm text-gray-600 max-w-35 truncate">
              {user?.user_metadata?.full_name || user?.email}
            </span>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Message Area */}
     <MessageList messages={messages} isTyping={isTyping} deleteMessage={deleteMessage} />

      {/* Input Area */}
      <MessageInput onSend={sendMessage} disabled={isTyping} />
    </div>
  )
}