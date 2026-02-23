//User Data Access Layer
import { Profile } from '@/types'
import { databaseService } from '@/services/database/supabase.service'
import { DatabaseError, NotFoundError } from '@/lib/utils/errors'

export class UserRepository {
  async findById(userId: string): Promise<Profile | null> {
    try {
      return await databaseService.getProfile(userId)
    } catch (error) {
      throw new DatabaseError('Failed to fetch user profile')
    }
  }

  async getCurrentUser(): Promise<{ id: string; email: string } | null> {
    try {
      return await databaseService.getCurrentUser()
    } catch (error) {
      throw new DatabaseError('Failed to get current user')
    }
  }

  async requireCurrentUser(): Promise<{ id: string; email: string }> {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new NotFoundError('User not authenticated')
    }
    return user
  }
}

export const userRepository = new UserRepository()