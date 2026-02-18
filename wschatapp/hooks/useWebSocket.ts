'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Message } from '@/types'
import { toast } from 'sonner'

export function useWebSocket(userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const supabase = createClient()

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

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          const newMessage = payload.new as Message

          setMessages((prev) => {
            const exists = prev.find((m) => m.id === newMessage.id)
            if (exists) return prev
            return [...prev, newMessage]
          })

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

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content.trim(), userId }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error('Gemini API failed')
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          toast.info('Response stopped')
        } else {
          toast.error('Failed to get AI response. Please try again.')
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
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        toast.error('Failed to delete message')
        return
      }

      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      toast.success('Message deleted')
    },
    []
  )

  return { messages, loading, isTyping, sendMessage, deleteMessage, stopGenerating }
}