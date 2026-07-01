import { Module } from '@nestjs/common';

import { CrawlerModule } from '../crawler/crawler.module';
import { ExtractorModule } from '../extractor/extractor.module';
import { ChunkerModule } from '../chunker/chunker.module';
import { EmbeddingModule } from '../embedding/embedding.module';
import { ChromaModule } from '../chroma/chroma.module';

import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

@Module({
  imports: [
    CrawlerModule,
    ExtractorModule,
    ChunkerModule,
    EmbeddingModule,
    ChromaModule,
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
