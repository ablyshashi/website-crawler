import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChromaClient, Collection } from 'chromadb';
import { ChromaDocument } from './interfaces/chroma-document.interface';
import { SearchResult } from 'src/chat/chat.service';

@Injectable()
export class ChromaService implements OnModuleInit {
  private client: ChromaClient;
  private collection: Collection;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.client = new ChromaClient({
      host: 'localhost',
      port: 8000,
      ssl: false,
    });

    this.collection = await this.client.getOrCreateCollection({
      name: this.config.get<string>('CHROMA_COLLECTION')!,
      embeddingFunction: null,
    });
  }

  async upsert(documents: ChromaDocument[]) {
    if (!documents.length) return;

    await this.collection.upsert({
      ids: documents.map((d) => d.id),
      documents: documents.map((d) => d.document),
      embeddings: documents.map((d) => d.embedding),
      metadatas: documents.map((d) => d.metadata),
    });
  }

  async delete(ids: string[]) {
    await this.collection.delete({
      ids,
    });
  }

  async search(embedding: number[], limit = 5): Promise<SearchResult[]> {
    const result = await this.collection.query({
      queryEmbeddings: [embedding],
      nResults: limit,
    });

    return (result.documents?.[0] ?? []).map((document, index) => ({
      id: String(result.ids?.[0]?.[index] ?? ''),
      document: String(document ?? ''),
      distance: result.distances?.[0]?.[index] ?? null,
      metadata: (result.metadatas?.[0]?.[
        index
      ] as SearchResult['metadata']) ?? {
        url: '',
      },
    }));
  }
}
