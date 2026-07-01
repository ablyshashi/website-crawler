export interface CrawlResult {
  source: 'sitemap' | 'anchors';
  urls: string[];
}
