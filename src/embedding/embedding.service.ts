import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    this.model =
      this.configService.get<string>('EMBEDDING_MODEL') ??
      'text-embedding-3-small';
  }

  async embed(text: string): Promise<number[]> {
    const input = text.trim();

    if (!input) {
      throw new Error('Cannot create embedding for empty text.');
    }

    const response = await this.openai.embeddings.create({
      model: this.model,
      input,
    });

    return response.data[0].embedding;
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const response = await this.openai.embeddings.create({
      model: this.model,
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  }
}
