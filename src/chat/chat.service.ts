import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface SearchResult {
  id: string;
  document: string;
  distance: number | null;
  metadata: {
    url: string;
    title?: string;
    [key: string]: any;
  };
}

@Injectable()
export class ChatService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Converts follow-up questions into standalone questions.
   *
   * Example:
   *
   * User:
   * What is useState?
   *
   * Assistant:
   * ...
   *
   * User:
   * Can I use it inside loops?
   *
   * Returns:
   * Can React useState be used inside loops?
   */
  async rewriteQuestion(
    question: string,
    previousResponseId?: string,
  ): Promise<string> {
    // First message in the conversation
    if (!previousResponseId) {
      return question;
    }

    try {
      const response = await this.openai.responses.create({
        model: 'gpt-4.1-mini',
        previous_response_id: previousResponseId,
        input: `
Rewrite the user's latest question into a standalone question.

Rules:
- If the latest question depends on previous conversation,
  rewrite it into a standalone question.
- If it is already standalone, return it unchanged.
- Return ONLY the rewritten question.

Latest question:
${question}
`,
      });

      return response.output_text.trim() || question;
    } catch (error) {
      console.error('Question rewrite failed:', error);

      // Fallback to original question
      return question;
    }
  }

  /**
   * Generate final RAG answer.
   */
  async ask(
    question: string,
    documents: SearchResult[],
    previousResponseId?: string,
  ): Promise<{ answer: string; responseId: string }> {
    const context = documents
      .map(
        (doc, index) => `
Source ${index + 1}

Title:
${doc.metadata.title ?? 'Unknown'}

URL:
${doc.metadata.url}

Content:
${doc.document}
`,
      )
      .join('\n\n--------------------------\n\n');

    const response = await this.openai.responses.create({
      model: 'gpt-4.1-mini',
      temperature: 0,
      previous_response_id: previousResponseId,
      input: [
        {
          role: 'system',
          content: `
You are a RAG assistant.

Answer ONLY using the supplied context.

If the answer is not present in the context,
reply exactly:

"I couldn't find that information in the knowledge base."

Always include the URL(s) of the source(s) you used.
`,
        },
        {
          role: 'system',
          content: `Context:\n\n${context}`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
    });

    return {
      answer: response.output_text,
      responseId: response.id,
    };
  }
}
