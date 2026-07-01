import { Injectable } from '@nestjs/common';
import { RobotsProvider } from './providers/robots.provider';
import { SitemapProvider } from './providers/sitemap.provider';
import { AnchorProvider } from './providers/anchor.provider';
import { CrawlResult } from './interfaces/crawl-result.interface';

@Injectable()
export class CrawlerService {
  constructor(
    private readonly robots: RobotsProvider,
    private readonly sitemap: SitemapProvider,
    private readonly anchors: AnchorProvider,
  ) {}

  async crawl(url: string): Promise<CrawlResult> {
    const origin = new URL(url).origin;

    const sitemaps = [
      ...(await this.robots.getSitemaps(origin)),
      `${origin}/sitemap.xml`,
    ];

    for (const sitemap of [...new Set(sitemaps)]) {
      const urls = await this.sitemap.parse(sitemap);
      if (urls.length) {
        return {
          source: 'sitemap',
          urls,
        };
      }
    }

    return {
      source: 'anchors',
      urls: await this.anchors.crawl(origin),
    };
  }
}
