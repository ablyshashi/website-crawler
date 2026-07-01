import { Injectable } from '@nestjs/common';
import { HtmlProvider } from './html.provider';
import { XMLParser } from 'fast-xml-parser';

interface UrlEntry {
  loc: string;
}

interface Urlset {
  url: UrlEntry[];
}

interface SitemapEntry {
  loc: string;
}

interface SitemapIndex {
  sitemap: SitemapEntry[];
}

interface ParsedXml {
  urlset?: Urlset;
  sitemapindex?: SitemapIndex;
}

@Injectable()
export class SitemapProvider {
  constructor(private readonly html: HtmlProvider) {}

  async parse(url: string): Promise<string[]> {
    try {
      const xml: string = await this.html.fetch(url);

      const parser = new XMLParser();

      const json: ParsedXml = parser.parse(xml) as ParsedXml;

      if (json.urlset?.url) {
        return json.urlset.url.map((x: UrlEntry) => x.loc);
      }

      if (json.sitemapindex?.sitemap) {
        const children: string[] = json.sitemapindex.sitemap.map(
          (x: SitemapEntry) => x.loc,
        );

        const urls: string[] = [];

        for (const child of children) {
          urls.push(...(await this.parse(child)));
        }

        return urls;
      }

      return [];
    } catch {
      return [];
    }
  }
}
