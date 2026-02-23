//Chat Business Logic
import { serverDatabaseService } from '@/services/database/supabase.service'
import { aiService } from '@/services/ai/gemini.service'

export class ChatController {
  async processMessage(userId: string, message: string) {
    // Validate input
    if (!message.trim()) {
      throw new Error('Message cannot be empty')
    }

    // Stream AI response
    let fullResponse = ''
    
    const stream = await this.streamAIResponse(message, (chunk) => {
      fullResponse += chunk
    })

    return {
      stream,
      onComplete: async () => {
        // Save AI response to database after streaming completes
        await serverDatabaseService.createMessage(userId, 'assistant', fullResponse)
      }
    }
  }

  private async streamAIResponse(message: string, onChunk: (text: string) => void) {
    // This returns a stream that can be sent to the client
    return await aiService.streamResponse(
      message,
      onChunk,
      () => {} // onComplete handled separately
    )
  }
}

export const chatController = new ChatController()