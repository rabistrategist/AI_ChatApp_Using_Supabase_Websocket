//Gemini Implementation
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { AIService } from '../database'

class GeminiAIService implements AIService {
  async streamResponse(
    message: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  ): Promise<void> {
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
    })

    let fullResponse = ''

    for await (const chunk of result.textStream) {
      fullResponse += chunk
      onChunk(chunk)
    }

    onComplete(fullResponse)
  }
}

export const aiService = new GeminiAIService()