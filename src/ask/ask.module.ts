import { Module } from '@nestjs/common';
import { AskService } from './ask.service';
import { AskController } from './ask.controller';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { QdrantModule } from '../qdrant/qdrant.module';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  imports: [
    EmbeddingsModule,
    QdrantModule,
    GeminiModule,
  ],
  controllers: [AskController],   // 👈 THIS LINE
  providers: [AskService],
})
export class AskModule {}
