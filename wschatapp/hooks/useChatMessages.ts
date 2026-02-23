'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { databaseService } from '@/services/database/supabase.service'
import { realtimeService } from '@/services/realtime/supabase-realtime.service'
import { Message } from '@/types'
import { toast } from 'sonner'

export function useChatMessages(userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!userId) return

    try {
      const data = await databaseService.getMessages(userId)
      setMessages(data)
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (!userId) return

    const unsubscribe = realtimeService.subscribeToMessages(userId, (newMessage) => {
      if (newMessage.role === 'assistant') {
        setIsTyping(false)
        
        setMessages((prev) => {
          const tempIndex = prev.findIndex((m) => m.id.startsWith('temp-') && m.role === 'assistant')
          if (tempIndex !== -1) {
            const updated = [...prev]
            updated[tempIndex] = newMessage
            return updated
          }
          
          const exists = prev.find((m) => m.id === newMessage.id)
          if (exists) return prev
          return [...prev, newMessage]
        })
        
        toast.success('Gemini replied!', {
          description: newMessage.content.slice(0, 60) + '...',
          duration: 3000,
        })
      } else {
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === newMessage.id)
          if (exists) return prev
          return [...prev, newMessage]
        })
      }
    })

    return unsubscribe
  }, [userId])

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!userId || !content.trim()) return

      try {
        await databaseService.createMessage(userId, 'user', content.trim())
        
        await new Promise(resolve => setTimeout(resolve, 150))

        setIsTyping(true)

        const tempId = `temp-${Date.now()}`
        
        setMessages((prev) => [
          ...prev,
          {
            id: tempId,
            user_id: userId,
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString(),
          } as Message,
        ])

        abortControllerRef.current = new AbortController()

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content.trim(), userId }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error('API failed')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response body')
        }

        let accumulatedText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('0:')) {
              const text = line.slice(2).trim().replace(/^"|"$/g, '')
              if (text) {
                accumulatedText += text
                
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === tempId
                      ? { ...m, content: accumulatedText }
                      : m
                  )
                )
              }
            }
          }
        }

        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        setIsTyping(false)

      } catch (error: any) {
        setMessages((prev) => prev.filter((m) => m.id.startsWith('temp-')))
        
        if (error.name === 'AbortError') {
          toast.info('Response stopped')
        } else {
          toast.error('Failed to send message')
        }
        setIsTyping(false)
      } finally {
        abortControllerRef.current = null
      }
    },
    [userId]
  )

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsTyping(false)
      toast.info('Stopped generating response')
    }
  }, [])

  const deleteMessage = useCallback(
    async (messageId: string): Promise<void> => {
      try {
        await databaseService.deleteMessage(messageId)
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
        toast.success('Message deleted')
      } catch (error) {
        toast.error('Failed to delete message')
      }
    },
    []
  )

  const editMessage = useCallback(
    async (messageId: string, newContent: string): Promise<void> => {
      if (!userId || !newContent.trim()) return

      const messageIndex = messages.findIndex(m => m.id === messageId)
      if (messageIndex === -1) return

      const messagesToDelete = messages.slice(messageIndex)
      
      try {
        await Promise.all(
          messagesToDelete.map(msg => databaseService.deleteMessage(msg.id))
        )

        setMessages(prev => prev.slice(0, messageIndex))

        await sendMessage(newContent)

        toast.success('Message edited')
      } catch (error) {
        toast.error('Failed to edit message')
      }
    },
    [userId, messages, sendMessage]
  )

  return {
    messages,
    loading,
    isTyping,
    sendMessage,
    deleteMessage,
    stopGenerating,
    editMessage,
  }
}