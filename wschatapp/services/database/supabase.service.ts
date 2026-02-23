import { createBrowserClient } from '@supabase/ssr'
import { DatabaseService } from './index'
import { Message, Profile } from '@/types'

// Singleton browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null

function getBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('This service is client-only. Use serverDatabaseService for server-side operations.')
  }
  
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  return browserClient
}

class SupabaseDatabaseService implements DatabaseService {
  async getCurrentUser() {
    const client = getBrowserClient()
    const { data: { user }, error } = await client.auth.getUser()
    
    if (error || !user) return null
    
    return {
      id: user.id,
      email: user.email!,
    }
  }

  async signIn(email: string, password: string) {
    const client = getBrowserClient()
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async signUp(email: string, password: string) {
    const client = getBrowserClient()
    const { error } = await client.auth.signUp({ email, password })
    if (error) throw error
  }

  async signInWithOAuth(provider: 'google') {
    const client = getBrowserClient()
    await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async signOut() {
    const client = getBrowserClient()
    await client.auth.signOut()
  }

  async getMessages(userId: string): Promise<Message[]> {
    const client = getBrowserClient()
    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as Message[]
  }

  async createMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    const client = getBrowserClient()
    const { data, error } = await client
      .from('messages')
      .insert({ user_id: userId, role, content })
      .select()
      .single()

    if (error) throw error
    return data as Message
  }

  async deleteMessage(messageId: string): Promise<void> {
    const client = getBrowserClient()
    const { error } = await client
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const client = getBrowserClient()
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) return null
    return data as Profile
  }
}

// Export ONLY client service
export const databaseService = new SupabaseDatabaseService()