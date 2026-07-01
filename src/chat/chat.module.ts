import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { HistoryService } from './history.service';

@Module({
  imports: [],
  providers: [ChatService, HistoryService],
  exports: [ChatService, HistoryService],
})
export class ChatModule {}
