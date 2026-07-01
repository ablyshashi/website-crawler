import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { HtmlProvider } from './html.provider';

@Injectable()
export class AnchorProvider {
  private readonly logger = new Logger(AnchorProvider.name);

  private readonly skipProtocols = [
    'mailto:',
    'tel:',
    'javascript:',
    'sms:',
    'data:',
    'blob:',
    'whatsapp:',
  ];

  private readonly skipExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.svg',
    '.webp',
    '.ico',
    '.pdf',
    '.zip',
    '.rar',
    '.7z',
    '.tar',
    '.gz',
    '.mp4',
    '.mp3',
    '.avi',
    '.mov',
    '.css',
    '.js',
    '.xml',
    '.json',
  ];

  constructor(private readonly htmlProvider: HtmlProvider) {}

  async crawl(
    startUrl: string,
    maxPages = 500,
    maxDepth = 5,
  ): Promise<string[]> {
    const origin = new URL(startUrl).origin;

    const visited = new Set<string>();

    const queue: Array<{
      url: string;
      depth: number;
    }> = [
      {
        url: startUrl,
        depth: 0,
      },
    ];

    while (queue.length > 0 && visited.size < maxPages) {
      const current = queue.shift()!;

      if (visited.has(current.url)) {
        continue;
      }

      if (current.depth > maxDepth) {
        continue;
      }

      this.logger.debug(
        `[${visited.size + 1}] Crawling ${current.url} (depth=${current.depth})`,
      );

      visited.add(current.url);

      try {
        const html = await this.htmlProvider.fetch(current.url);

        const links = this.extractLinks(html, origin);

        for (const link of links) {
          if (!visited.has(link)) {
            queue.push({
              url: link,
              depth: current.depth + 1,
            });
          }
        }
      } catch (err) {
        this.logger.warn(`Failed: ${current.url}`);
      }
    }

    return [...visited];
  }

  private extractLinks(html: string, origin: string): string[] {
    const $ = cheerio.load(html);

    const urls = new Set<string>();

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')?.trim();

      if (!href) {
        return;
      }

      if (href.startsWith('#')) {
        return;
      }

      if (
        this.skipProtocols.some((protocol) =>
          href.toLowerCase().startsWith(protocol),
        )
      ) {
        return;
      }

      try {
        const url = new URL(href, origin);

        if (url.origin !== origin) {
          return;
        }

        url.hash = '';

        [
          'utm_source',
          'utm_medium',
          'utm_campaign',
          'utm_term',
          'utm_content',
          'gclid',
          'fbclid',
        ].forEach((param) => url.searchParams.delete(param));

        const pathname = url.pathname.toLowerCase();

        if (
          this.skipExtensions.some((extension) => pathname.endsWith(extension))
        ) {
          return;
        }

        let normalized = url.toString();

        if (normalized.endsWith('/')) {
          normalized = normalized.slice(0, -1);
        }

        urls.add(normalized);
      } catch {
        // Ignore invalid URLs
      }
    });

    return [...urls];
  }
}
