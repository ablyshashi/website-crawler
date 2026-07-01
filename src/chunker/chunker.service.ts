import { Injectable } from '@nestjs/common';
import { MarkdownTextSplitter } from '@langchain/textsplitters';
import { createHash } from 'crypto';

import { Chunk } from './interfaces/chunk.interface';

@Injectable()
export class ChunkerService {
  private readonly splitter = new MarkdownTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  async chunk(markdown: string, url: string, title: string): Promise<Chunk[]> {
    if (!markdown.trim()) {
      return [];
    }

    const documents = await this.splitter.createDocuments([markdown]);

    return documents.map((doc, index) => ({
      id: this.createChunkId(url, index),
      index,
      text: doc.pageContent.trim(),
      metadata: {
        url,
        title,
      },
    }));
  }

  private createChunkId(url: string, index: number): string {
    const hash = createHash('sha256').update(`${url}-${index}`).digest('hex');

    return hash;
  }
}
