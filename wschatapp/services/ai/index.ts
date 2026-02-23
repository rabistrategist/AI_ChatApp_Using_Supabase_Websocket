//AI Abstraction
// Export AI service for easy imports
export { aiService } from './gemini.service'

// Export interface for custom implementations
export interface AIService {
  streamResponse(
    message: string,
    onChunk: (text: string) => void,
    onComplete: (fullText: string) => void
  ): Promise<void>
}