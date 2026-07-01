import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { HtmlProvider } from './providers/html.provider';
import { RobotsProvider } from './providers/robots.provider';
import { SitemapProvider } from './providers/sitemap.provider';
import { AnchorProvider } from './providers/anchor.provider';

@Module({
  providers: [
    CrawlerService,
    HtmlProvider,
    RobotsProvider,
    SitemapProvider,
    AnchorProvider,
  ],
  exports: [CrawlerService, HtmlProvider],
})
export class CrawlerModule {}
