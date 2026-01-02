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
import { TextIngestService } from './text.ingest.service';


@Controller('ingest')
export class IngestController {
  constructor(private readonly pdfIngest: PdfIngestService,
  private readonly textIngest: TextIngestService,) {}


  @Post('file')
@UseInterceptors(FileInterceptor('file'))
async ingestAnyFile(
  @UploadedFile() file: Express.Multer.File,
  @Body() body: { source: string; module?: string; version?: string },
) {
  if (!file) {
    throw new BadRequestException('File is missing. Ensure key is "file".');
  }

  if (!body.source) {
    throw new BadRequestException('The "source" field is required.');
  }

  const ext = file.originalname.split('.').pop()?.toLowerCase();

  // PDF → existing logic
  if (ext === 'pdf') {
    return this.pdfIngest.ingestPdf(file.buffer, body);
  }

  // Text-based files
  const text = this.textIngest.extractText(file);
  return this.textIngest.ingestText(text, body);
}


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