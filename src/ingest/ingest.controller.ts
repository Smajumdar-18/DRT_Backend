import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfIngestService } from './pdf.ingest.service';

@Controller('ingest')
export class IngestController {
  constructor(private readonly pdfIngest: PdfIngestService) {}

  @Post('pdf')
  @UseInterceptors(FileInterceptor('file')) // Key must be "file" in Postman
  async ingestPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { source: string; module?: string; version?: string },
  ) {
    if (!file) {
      throw new BadRequestException('File is missing. Ensure the key is named "file".');
    }

    if (!body.source) {
      throw new BadRequestException('The "source" field is required in form-data.');
    }

    // Pass the buffer and metadata body
    return await this.pdfIngest.ingestPdf(file.buffer, body);
  }
}