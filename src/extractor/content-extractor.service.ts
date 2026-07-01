import { Injectable } from '@nestjs/common';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';

@Injectable()
export class ContentExtractorService {
  private readonly turndown: TurndownService;

  constructor() {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    });

    // Keep developer documentation formatting
    this.turndown.keep(['pre', 'code']);
  }

  extract(html: string, url: string) {
    const dom = new JSDOM(html, { url });

    const article = new Readability(dom.window.document).parse();

    if (!article) {
      return {
        title: '',
        excerpt: '',
        markdown: '',
      };
    }

    // Reuse the existing DOM instead of creating another JSDOM
    const container = dom.window.document.createElement('div');
    container.innerHTML = article.content ?? '';

    container
      .querySelectorAll(
        [
          'img',
          'picture',
          'figure',
          'svg',
          'canvas',
          'video',
          'audio',
          'iframe',
          'noscript',
          'script',
          'style',
          'form',
          'button',
          'input',
          'textarea',
          'select',
          'nav',
          'footer',
          'aside',
        ].join(','),
      )
      .forEach((el) => el.remove());

    // Remove empty wrappers
    container.querySelectorAll('p,div,section').forEach((el) => {
      if (!el.textContent?.trim()) {
        el.remove();
      }
    });

    const markdown = this.turndown
      .turndown(container.innerHTML)
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      title: (article.title ?? '').trim(),
      excerpt: (article.excerpt ?? '').trim(),
      markdown,
    };
  }
}
