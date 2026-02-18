import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function getGeminiResponse(userMessage: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

  const prompt = `You are a helpful and friendly AI assistant. Respond clearly and concisely. 
  User: ${userMessage}`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}