import { Injectable, Logger } from '@nestjs/common';

import { CrawlerService } from '../crawler/crawler.service';
import { HtmlProvider } from '../crawler/providers/html.provider';

import { ContentExtractorService } from '../extractor/content-extractor.service';
import { ChunkerService } from '../chunker/chunker.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { ChromaService } from '../chroma/chroma.service';
import pLimit from 'p-limit';
import { Chunk } from 'src/chunker/interfaces/chunk.interface';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly crawler: CrawlerService,
    private readonly htmlProvider: HtmlProvider,
    private readonly extractor: ContentExtractorService,
    private readonly chunker: ChunkerService,
    private readonly embedding: EmbeddingService,
    private readonly chroma: ChromaService,
  ) {}

  async ingest(startUrl: string) {
    //  const crawl = await this.crawler.crawl(startUrl);

    const urls = [startUrl];
    // const urls = crawl.urls;

    const limit = pLimit(5);

    const allChunks: Chunk[] = [];

    await Promise.all(
      urls.map((url) =>
        limit(async () => {
          try {
            this.logger.log(`Processing ${url}`);

            const html = await this.htmlProvider.fetch(url);

            const page = this.extractor.extract(html, url);

            if (!page.markdown.trim()) {
              return;
            }

            const chunks = await this.chunker.chunk(
              page.markdown,
              url,
              page.title,
            );

            allChunks.push(...chunks);
          } catch (err) {
            this.logger.error(`Failed ${url}`, err);
          }
        }),
      ),
    );

    this.logger.log(`Collected ${allChunks.length} chunks`);

    if (!allChunks.length) {
      return {
        success: false,
        message: 'No chunks found.',
      };
    }

    // ONE embedding request
    const embeddings = await this.embedding.embedMany(
      allChunks.map((c) => c.text),
    );

    // ONE chroma request
    await this.chroma.upsert(
      allChunks.map((chunk, index) => ({
        id: chunk.id,
        document: chunk.text,
        embedding: embeddings[index],
        metadata: {
          ...chunk.metadata,
          chunk: chunk.index,
          source: 'website',
          crawledAt: new Date().toISOString(),
        },
      })),
    );

    return {
      success: true,
      pages: urls.length,
      chunks: allChunks.length,
    };
  }
}
