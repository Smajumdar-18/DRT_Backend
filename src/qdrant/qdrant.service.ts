import { Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { ConfigService } from '@nestjs/config';
import { SearchResult } from '../common/types';

@Injectable()
export class QdrantService {
  private client: QdrantClient;
  private readonly collection = 'infor_m3_knowledge';

  constructor(private readonly config: ConfigService) {
    this.client = new QdrantClient({
      url: this.config.getOrThrow<string>('QDRANT_URL'),
      apiKey: this.config.get<string>('QDRANT_API_KEY'),
    });
  }

  // ✅ FIX 1: Named vector support
 async upsert(point: {
  id: string;
  vector: number[];
  payload: Record<string, any>;
}) {
  await this.client.upsert('infor_m3_knowledge', {
    wait: true,
    points: [
      {
        id: point.id,
        vector: point.vector,
        payload: point.payload,
      },
    ],
  });
}


  // ✅ FIX 2: Search using named vector
  async search(vector: number[]): Promise<SearchResult[]> {
    const result = await this.client.search(this.collection, {
      vector: {
        name: 'content_vector',
        vector,
      },
      limit: 5,
      with_payload: true,
    });

    return result
      .filter(r => r.score > 0.7)
      .map(r => ({
        text: String(r.payload?.text ?? ''),
        source: String(r.payload?.source ?? 'unknown'),
        score: r.score,
      }));
  }
}
