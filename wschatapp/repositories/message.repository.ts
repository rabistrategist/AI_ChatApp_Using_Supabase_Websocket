//Message Data Access Layer
import { Message } from '@/types'
import { databaseService } from '@/services/database/supabase.service'
import { DatabaseError } from '@/lib/utils/errors'

export class MessageRepository {
  async findByUserId(userId: string): Promise<Message[]> {
    try {
      return await databaseService.getMessages(userId)
    } catch (error) {
      throw new DatabaseError('Failed to fetch messages')
    }
  }

  async create(userId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    try {
      return await databaseService.createMessage(userId, role, content)
    } catch (error) {
      throw new DatabaseError('Failed to create message')
    }
  }

  async delete(messageId: string): Promise<void> {
    try {
      await databaseService.deleteMessage(messageId)
    } catch (error) {
      throw new DatabaseError('Failed to delete message')
    }
  }

  async deleteMany(messageIds: string[]): Promise<void> {
    try {
      await Promise.all(messageIds.map(id => this.delete(id)))
    } catch (error) {
      throw new DatabaseError('Failed to delete messages')
    }
  }
}

export const messageRepository = new MessageRepository()