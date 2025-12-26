import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { GeminiService } from '../gemini/gemini.service';
import { assembleContext } from '../common/context.util';
import { SearchResult } from '../common/types';

@Injectable()
export class AskService {
  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly qdrant: QdrantService,
    private readonly gemini: GeminiService,
  ) {}

  async handleQuery(query: string) {
    // 0. Basic validation
    if (!query || !query.trim()) {
      return {
        answer: 'Query cannot be empty.',
        sources: [],
      };
    }

    // 1. Embed query
    const queryVector = await this.embeddings.embed(query);

    // 2. Search Qdrant
    const results = await this.qdrant.search(queryVector);

    // 3. No results fallback
    if (!results.length) {
      return {
        answer: 'No relevant information found in Infor M3 knowledge base.',
        sources: [],
      };
    }

    // 4. Assemble context
    const context = assembleContext(results);

    // 5. Generate answer (ONLY ONCE)
    const answer = await this.gemini.generateAnswer(query, context);

    // 6. Return consistent response
    return {
      answer,
      sources: results.map(r => ({
        source: r.source,
        score: r.score,
      })),
    };
  }
}
