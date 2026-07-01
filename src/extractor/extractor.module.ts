import { Module } from '@nestjs/common';
import { ContentExtractorService } from './content-extractor.service';

@Module({
  controllers: [],
  providers: [ContentExtractorService],
  exports: [ContentExtractorService],
})
export class ExtractorModule {}
