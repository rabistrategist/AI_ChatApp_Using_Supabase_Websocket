import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGeminiResponse } from '@/lib/gemini'
import { GeminiRequest, GeminiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: GeminiRequest = await request.json()
    const { message, userId } = body

    if (!message || !userId) {
      return NextResponse.json({ error: 'Message and userId are required' }, { status: 400 })
    }

    // Get Gemini response
    const reply = await getGeminiResponse(message)

    // Save Gemini response to DB (this triggers WebSocket event)
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        role: 'assistant',
        content: reply,
      })

    if (insertError) {
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }

    const response: GeminiResponse = { reply }
    return NextResponse.json(response)

  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}