import { createClient } from '@/lib/supabase/server'
import { DatabaseService } from './index'
import { Message, Profile } from '@/types'

class SupabaseServerService implements DatabaseService {
  async getCurrentUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null
    
    return {
      id: user.id,
      email: user.email!,
    }
  }

  async signIn(email: string, password: string) {
    throw new Error('Use client-side for auth operations')
  }

  async signUp(email: string, password: string) {
    throw new Error('Use client-side for auth operations')
  }

  async signInWithOAuth(provider: 'google') {
    throw new Error('Use client-side for auth operations')
  }

  async signOut() {
    throw new Error('Use client-side for auth operations')
  }

  async getMessages(userId: string): Promise<Message[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as Message[]
  }

  async createMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({ user_id: userId, role, content })
      .select()
      .single()

    if (error) throw error
    return data as Message
  }

  async deleteMessage(messageId: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error
  }

  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) return null
    return data as Profile
  }
}

export const serverDatabaseService = new SupabaseServerService()