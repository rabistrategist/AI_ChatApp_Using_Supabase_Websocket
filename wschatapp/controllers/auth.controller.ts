//Auth Business Logic
import { databaseService } from '@/services/database/supabase.service'
import { userRepository } from '@/repositories/user.repository'
import { AuthError, ValidationError } from '@/lib/utils/errors'

export class AuthController {
  async signIn(email: string, password: string): Promise<void> {
    if (!email || !password) {
      throw new ValidationError('Email and password are required')
    }

    try {
      await databaseService.signIn(email, password)
    } catch (error) {
      throw new AuthError('Invalid email or password')
    }
  }

  async signUp(email: string, password: string): Promise<void> {
    if (!email || !password) {
      throw new ValidationError('Email and password are required')
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters')
    }

    try {
      await databaseService.signUp(email, password)
    } catch (error) {
      throw new AuthError('Failed to create account')
    }
  }

  async signInWithOAuth(provider: 'google'): Promise<void> {
    try {
      await databaseService.signInWithOAuth(provider)
    } catch (error) {
      throw new AuthError('OAuth authentication failed')
    }
  }

  async signOut(): Promise<void> {
    try {
      await databaseService.signOut()
    } catch (error) {
      throw new AuthError('Failed to sign out')
    }
  }

  async getCurrentUser() {
    return await userRepository.getCurrentUser()
  }

  async requireAuth() {
    return await userRepository.requireCurrentUser()
  }
}

export const authController = new AuthController()