import { IsString, MinLength } from 'class-validator';

export class AskDto {
  @IsString()
  @MinLength(5)
  query: string;
}
