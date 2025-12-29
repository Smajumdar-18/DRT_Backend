import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GeminiService {
  private readonly apiKey: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.getOrThrow('GEMINI_API_KEY');
  }

  async generateAnswer(query: string, context: string): Promise<string> {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `
You are an expert Infor M3 assistant.

Answer ONLY from the context below.
If not found, say:
"No relevant information found in Infor M3 knowledge base."

Context:
${context}

Question:
${query}
                  `,
                },
              ],
            },
          ],
        },
        { headers: { 'Content-Type': 'application/json' } },
      );

      return (
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ??
        'No response generated.'
      );
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Gemini v1 Error: ${error.response?.data?.error?.message || error.message}`,
      );
    }
  }
}
