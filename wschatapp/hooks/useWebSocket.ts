'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Message } from '@/types'
import { toast } from 'sonner'

export function useWebSocket(userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const supabase = createClient()

  // Fetch existing messages on mount
  const fetchMessages = useCallback(async () => {
    if (!userId) return

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data as Message[])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Subscribe to Realtime WebSocket channel
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          const newMessage = payload.new as Message

          // Add message to state
          setMessages((prev) => {
            const exists = prev.find((m) => m.id === newMessage.id)
            if (exists) return prev
            return [...prev, newMessage]
          })

          // Show toast when Gemini responds
          if (newMessage.role === 'assistant') {
            setIsTyping(false)
            toast.success('Gemini replied!', {
              description: newMessage.content.slice(0, 60) + '...',
              duration: 3000,
            })
          }
        }
      )
      .subscribe()

    // Cleanup WebSocket on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!userId || !content.trim()) return

      const { error } = await supabase.from('messages').insert({
        user_id: userId,
        role: 'user',
        content: content.trim(),
      })

      if (error) {
        toast.error('Failed to send message')
        return
      }

      setIsTyping(true)

      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content.trim(), userId }),
        })

        if (!response.ok) {
          throw new Error('Gemini API failed')
        }
      } catch {
        setIsTyping(false)
        toast.error('Failed to get AI response. Please try again.')
      }
    },
    [userId]
  )

  const deleteMessage = useCallback(
  async (messageId: string): Promise<void> => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) {
      toast.error('Failed to delete message')
      return
    }

    // Remove from local state immediately
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
    toast.success('Message deleted')
  },
  []
)

// Return it from the hook
return { messages, loading, isTyping, sendMessage, deleteMessage }
}