import LoginForm from '@/components/auth/LoginForm'
import GoogleButton from '@/components/auth/GoogleButton'
import { Bot } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-white via-blue-100 to-pink-200 flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-900/30 p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to GeminiChat</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to start chatting with AI</p>
        </div>

        {/* Google Button */}
        <GoogleButton />

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-blue-100" />
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-blue-100" />
        </div>

        {/* Email/Password Form */}
        <LoginForm />
      </div>
    </div>
  )
}