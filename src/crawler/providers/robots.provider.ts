import { Injectable } from '@nestjs/common';
import { HtmlProvider } from './html.provider';

@Injectable()
export class RobotsProvider {
  constructor(private readonly html: HtmlProvider) {}

  async getSitemaps(baseUrl: string): Promise<string[]> {
    try {
      const robots = await this.html.fetch(`${baseUrl}/robots.txt`);

      return robots
        .split('\n')
        .filter((line) => line.toLowerCase().startsWith('sitemap:'))
        .map((line) => line.replace(/sitemap:/i, '').trim());
    } catch {
      return [];
    }
  }
}
