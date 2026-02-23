import { createBrowserClient } from '@supabase/ssr'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { Message } from '@/types'

// Create client once outside the class
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}

export class SupabaseRealtimeService {
  private getClient() {
    return getSupabaseClient()
  }

  subscribeToMessages(
    userId: string,
    onMessage: (message: Message) => void
  ): () => void {
    const client = this.getClient()
    
    const channel = client
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
          onMessage(payload.new as Message)
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }
}

export const realtimeService = new SupabaseRealtimeService()