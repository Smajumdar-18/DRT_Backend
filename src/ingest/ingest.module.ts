import { Module } from '@nestjs/common';
import { PdfIngestService } from './pdf.ingest.service';
import { IngestController } from './ingest.controller';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { QdrantModule } from '../qdrant/qdrant.module';

@Module({
  imports: [
    EmbeddingsModule, 
    QdrantModule,     
  ],
  controllers: [IngestController],
  providers: [PdfIngestService],
})
export class IngestModule {}
