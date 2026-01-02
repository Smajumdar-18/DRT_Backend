import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { chunkText } from '../common/chunk.util';
import * as cheerio from 'cheerio';

@Injectable()
export class TextIngestService {
  private readonly logger = new Logger(TextIngestService.name);

  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly qdrant: QdrantService,
  ) {}

  extractText(file: Express.Multer.File): string {
    const ext = file.originalname.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'txt':
      case 'md':
        return file.buffer.toString('utf-8');

      case 'json': {
        const json = JSON.parse(file.buffer.toString('utf-8'));
        return JSON.stringify(json, null, 2);
      }

      case 'html':
      case 'htm': {
        const $ = cheerio.load(file.buffer.toString('utf-8'));
        return $('body').text();
      }

      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  async ingestText(
    text: string,
    metadata: { source: string; module?: string; version?: string },
  ) {
    try {
      const chunks = chunkText(text);
      this.logger.log(`Extracted ${chunks.length} chunks`);

      for (const chunk of chunks) {
        const vector = await this.embeddings.embed(chunk);

        await this.qdrant.upsert({
          id: uuidv4(),
          vector,
          payload: {
            text: chunk,
            source: metadata.source,
            module: metadata.module ?? 'N/A',
            version: metadata.version ?? '1.0',
            timestamp: new Date().toISOString(),
          },
        });
      }

      return { status: 'success', chunks: chunks.length };
    } catch (err) {
      this.logger.error(err.stack || err.message);
      throw new InternalServerErrorException(
        `Failed to process text file: ${err.message}`,
      );
    }
  }
}
