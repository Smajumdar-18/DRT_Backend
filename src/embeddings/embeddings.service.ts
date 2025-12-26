import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingsService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly config: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.config.getOrThrow<string>('GEMINI_API_KEY')
    );
  }

  async embed(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({
      model: this.config.getOrThrow<string>('GEMINI_EMBEDDING_MODEL'),
    });

    const result = await model.embedContent(text);
    return result.embedding.values;
  }
}

