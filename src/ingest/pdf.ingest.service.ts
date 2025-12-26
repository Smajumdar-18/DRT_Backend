import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { chunkText } from '../common/chunk.util';

const pdf = require('pdf-extraction');

@Injectable()
export class PdfIngestService {
  private readonly logger = new Logger(PdfIngestService.name);

  constructor(
    private readonly embeddings: EmbeddingsService,
    private readonly qdrant: QdrantService,
  ) {}

  async ingestPdf(
    fileBuffer: Buffer,
    metadata: { source: string; module?: string; version?: string },
  ) {
    try {
      this.logger.log(`Starting ingestion for: ${metadata.source}`);

      // ✅ CORRECT PARAM FORMAT
      const data = await pdf({ data: new Uint8Array(fileBuffer) });

      if (!data?.text?.trim()) {
        throw new Error('PDF parsing returned empty text');
      }

      const chunks = chunkText(data.text);
      this.logger.log(`Extracted ${chunks.length} chunks`);

      for (const chunk of chunks) {
        const vector = await this.embeddings.embed(chunk);

        await this.qdrant.upsert({
  id: uuidv4(),
  vector: vector,
  payload: {
    text: chunk,
    source: metadata.source,
    module: metadata.module ?? 'N/A',
    version: metadata.version ?? '1.0',
    timestamp: new Date().toISOString(),
  },
});

      }

      return {
        status: 'success',
        chunks: chunks.length,
      };
    } catch (err) {
      this.logger.error(err.stack || err.message);
      throw new InternalServerErrorException(
        `Failed to process PDF: ${err.message}`,
      );
    }
  }
}
