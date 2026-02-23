//Realtime Abstraction
// Export realtime service for easy imports
export { realtimeService } from './supabase-realtime.service'

// Export interface for custom implementations
export interface RealtimeService {
  subscribeToMessages(
    userId: string,
    onMessage: (message: any) => void
  ): () => void
}