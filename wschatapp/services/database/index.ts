//Database Abstraction
import { Message, Profile } from '@/types'

export interface DatabaseService {
  // Auth methods
  getCurrentUser(): Promise<{ id: string; email: string } | null>
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string): Promise<void>
  signInWithOAuth(provider: 'google'): Promise<void>
  signOut(): Promise<void>
  
  // Message methods
  getMessages(userId: string): Promise<Message[]>
  createMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<Message>
  deleteMessage(messageId: string): Promise<void>
  
  // Profile methods
  getProfile(userId: string): Promise<Profile | null>
}

export interface RealtimeService {
  subscribeToMessages(
    userId: string,
    onMessage: (message: Message) => void
  ): () => void
}

export interface AIService {
  streamResponse(
    message: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  ): Promise<void>
}