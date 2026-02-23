//Message CRUD Logic
import { databaseService } from '@/services/database/supabase.service'
import { Message } from '@/types'

export class MessageController {
  async getMessages(userId: string): Promise<Message[]> {
    return await databaseService.getMessages(userId)
  }

  async sendMessage(userId: string, content: string): Promise<Message> {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty')
    }

    return await databaseService.createMessage(userId, 'user', content)
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    // Add authorization check here if needed
    await databaseService.deleteMessage(messageId)
  }

  async deleteMessagesFrom(messageId: string, userId: string): Promise<void> {
    // For edit feature - delete message and all after it
    const messages = await this.getMessages(userId)
    const messageIndex = messages.findIndex(m => m.id === messageId)
    
    if (messageIndex === -1) {
      throw new Error('Message not found')
    }

    const messagesToDelete = messages.slice(messageIndex)
    
    await Promise.all(
      messagesToDelete.map(msg => this.deleteMessage(msg.id, userId))
    )
  }
}

export const messageController = new MessageController()