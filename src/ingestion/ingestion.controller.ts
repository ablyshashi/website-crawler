import { Body, Controller, Post } from '@nestjs/common';

import { IngestionService } from './ingestion.service';
import { IngestDto } from './dto/ingest.dto';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  ingest(@Body() dto: IngestDto) {
    return this.ingestionService.ingest(dto.url);
  }
}
