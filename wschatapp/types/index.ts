export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Message {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface GeminiRequest {
  message: string
  userId: string
}

export interface GeminiResponse {
  reply: string
  error?: string
}

export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T | null
}

export interface AuthError {
  message: string
  status?: number
}