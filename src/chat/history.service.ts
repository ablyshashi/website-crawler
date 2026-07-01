import { Injectable } from '@nestjs/common';
import { ChatMessage } from './Interfaces/chat-message.interface';

@Injectable()
export class HistoryService {
  /**
   * Key = sessionId
   * Value = Chat History
   */
  private readonly conversations = new Map<string, ChatMessage[]>();
  private readonly lastMessageIds = new Map<string, string>();

  /**
   * Maximum number of messages to keep.
   *
   * Note:
   * 10 messages = 5 user + 5 assistant
   */
  private readonly MAX_HISTORY = 10;

  /**
   * Returns conversation history.
   */
  getHistory(sessionId: string): ChatMessage[] {
    return this.conversations.get(sessionId) ?? [];
  }

  updateLastResponseId(sessionId: string, id: string): void {
    this.lastMessageIds.set(sessionId, id);
  }

  getLastResponseId(sessionId: string): string | undefined {
    return this.lastMessageIds.get(sessionId);
  }

  /**
   * Adds a user message.
   */
  addUserMessage(sessionId: string, message: string): void {
    this.addMessage(sessionId, {
      role: 'user',
      content: message,
    });
  }

  /**
   * Adds an assistant message.
   */
  addAssistantMessage(sessionId: string, message: string): void {
    this.addMessage(sessionId, {
      role: 'assistant',
      content: message,
    });
  }

  /**
   * Clears one conversation.
   */
  clear(sessionId: string): void {
    this.conversations.delete(sessionId);
  }

  /**
   * Returns all conversations.
   * Useful for debugging.
   */
  getAll() {
    return this.conversations;
  }

  /**
   * Internal helper.
   */
  private addMessage(sessionId: string, message: ChatMessage): void {
    const history = this.getHistory(sessionId);

    history.push(message);

    // Keep only last MAX_HISTORY messages
    if (history.length > this.MAX_HISTORY) {
      history.splice(0, history.length - this.MAX_HISTORY);
    }

    this.conversations.set(sessionId, history);
  }
}
