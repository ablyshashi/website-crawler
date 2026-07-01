import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HtmlProvider {
  async fetch(url: string): Promise<string> {
    const response = await axios.get<string>(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'NestCrawler/1.0',
      },
    });

    return response.data;
  }
}
