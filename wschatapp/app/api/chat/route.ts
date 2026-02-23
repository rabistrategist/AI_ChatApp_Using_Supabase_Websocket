//Chat API endpoint
//import { serverDatabaseService } from '@/services/database/supabase.service'
import { serverDatabaseService } from '@/services/database/supabase-server.service'
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export async function POST(req: Request) {
  try {
    // Get current user
    const user = await serverDatabaseService.getCurrentUser()
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Parse request
    const { message, userId } = await req.json()

    if (!message || !userId || userId !== user.id) {
      return new Response('Invalid request', { status: 400 })
    }

    // Stream AI response
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'system',
          content: 'You are a helpful and friendly AI assistant. Respond clearly and concisely.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      async onFinish({ text }) {
        // Save complete response to database
        await serverDatabaseService.createMessage(userId, 'assistant', text)
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}