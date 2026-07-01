import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { ChromaModule } from 'src/chroma/chroma.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  controllers: [RagController],
  imports: [EmbeddingModule, ChromaModule, ChatModule],
  providers: [RagService],
  exports: [],
})
export class RagModule {}
