import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly config: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.config.getOrThrow<string>('GEMINI_API_KEY')
    );
  }

  async generateAnswer(query: string, context: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: this.config.getOrThrow<string>('GEMINI_LLM_MODEL'),
    });

    const prompt = `
You are an Infor M3 expert.
Use ONLY the context below to answer.

Context:
${context}

Question:
${query}

If the answer is not found, say you do not know.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
