import { Controller, Post, Body } from '@nestjs/common';
import { AskService } from './ask.service';
import { AskDto } from './ask.dto';

@Controller('api/ask')
export class AskController {
  constructor(private readonly askService: AskService) {}

  @Post()
  async ask(@Body() dto: AskDto) {
    return this.askService.handleQuery(dto.query);
  }
}
