import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { AskDto } from './dto/ask.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ask')
  ask(@Body() dto: AskDto) {
    dto.sessionId = dto.sessionId || 'default-session'; // Ensure sessionId is set
    return this.ragService.ask(dto.question, dto.sessionId);
  }
}
