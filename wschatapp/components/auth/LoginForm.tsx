'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // Check if user already exists
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          toast.error('An account with this email already exists. Please sign in.')
          setIsSignUp(false)
          return
        }

        // Email confirmation required
        setEmailSent(true)
        toast.success('Account created! Please check your email to verify.')

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          // Email not confirmed yet
          if (error.message.toLowerCase().includes('email not confirmed')) {
            toast.error('Please verify your email first. Check your inbox for a confirmation link.')
            return
          }
          // Wrong credentials
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            toast.error('Incorrect email or password. Please try again.')
            return
          }
          throw error
        }

        toast.success('Welcome back!')
        router.push('/chat')
        router.refresh()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Check your email</h3>
          <p className="text-gray-500 text-sm mt-1">
            We sent a confirmation link to <span className="font-semibold text-blue-600">{email}</span>
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Click the link in the email to activate your account, then come back to sign in.
          </p>
        </div>
        <button
          onClick={() => {
            setEmailSent(false)
            setIsSignUp(false)
          }}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-200"
        >
          Back to Sign In
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full pl-10 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-500 bg-blue-50/30 text-gray-800 placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* Password Field */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full pl-10 pr-10 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-500 bg-blue-50/30 text-gray-800 placeholder:text-gray-400 transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            {isSignUp ? 'Creating account...' : 'Signing in...'}
          </span>
        ) : (
          isSignUp ? 'Create Account' : 'Sign In'
        )}
      </button>

      {/* Toggle Sign Up / Sign In */}
      <p className="text-center text-sm text-gray-500">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </form>
  )
}