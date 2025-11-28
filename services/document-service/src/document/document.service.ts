import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { NotFoundError } from '@shared/common/errors';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class DocumentService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
    uploadedBy: string,
  ): Promise<Document> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const storagePath = path.join(this.uploadDir, fileName);

    // Save file to disk (in production, this would be S3 or similar)
    await fs.writeFile(storagePath, file.buffer);

    const document = this.documentRepository.create({
      ...createDocumentDto,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      storagePath,
      uploadedBy,
    });

    return this.documentRepository.save(document);
  }

  async findAll(
    clientId?: string,
    caseId?: string,
    documentType?: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ data: Document[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }
    if (caseId) {
      where.caseId = caseId;
    }
    if (documentType) {
      where.documentType = documentType;
    }

    const [data, total] = await this.documentRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { uploadedAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundError('Document', id);
    }
    return document;
  }

  async getFileBuffer(id: string): Promise<Buffer> {
    const document = await this.findOne(id);
    return fs.readFile(document.storagePath);
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(id);
    Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    
    // Delete file from storage
    try {
      await fs.unlink(document.storagePath);
    } catch (error) {
      // File might not exist, continue with deletion
    }

    await this.documentRepository.remove(document);
  }
}

