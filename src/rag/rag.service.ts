import { Injectable } from '@nestjs/common';
import { ChromaService } from 'src/chroma/chroma.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { ChatService } from 'src/chat/chat.service';
import { HistoryService } from 'src/chat/history.service';

@Injectable()
export class RagService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly chromaService: ChromaService,
    private readonly chatService: ChatService,
    private readonly historyService: HistoryService,
  ) {}

  async ask(question: string, sessionId: string) {
    const previousResponseId = this.historyService.getLastResponseId(sessionId);
    const rewrittenQuestion = await this.chatService.rewriteQuestion(
      question,
      previousResponseId,
    );

    const embedding = await this.embeddingService.embed(rewrittenQuestion);

    const documents = await this.chromaService.search(embedding);

    const response = await this.chatService.ask(
      rewrittenQuestion,
      documents,
      previousResponseId,
    );

    this.historyService.addUserMessage(sessionId, question);

    this.historyService.addAssistantMessage(sessionId, response.answer);
    this.historyService.updateLastResponseId(sessionId, response.responseId);

    return response.answer;
  }
}
