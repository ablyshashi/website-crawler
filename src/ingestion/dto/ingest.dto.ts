import { IsUrl } from 'class-validator';

export class IngestDto {
  @IsUrl()
  url: string;
}
