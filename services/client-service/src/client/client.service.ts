import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { Client } from './entities/client.entity';
import { NotFoundError, ConflictError } from '@shared/common/errors';
import { CreateClientDto, UpdateClientDto } from './dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Generate client number if not provided
    if (!createClientDto.clientNumber) {
      createClientDto.clientNumber = await this.generateClientNumber();
    } else {
      const existing = await this.clientRepository.findOne({
        where: { clientNumber: createClientDto.clientNumber },
      });
      if (existing) {
        throw new ConflictError('Client with this client number already exists');
      }
    }

    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
  ): Promise<{ data: Client[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const where: FindOptionsWhere<Client>[] = [];

    if (search) {
      where.push(
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { clientNumber: Like(`%${search}%`) },
      );
    }

    const [data, total] = await this.clientRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id },
    });

    if (!client) {
      throw new NotFoundError('Client', id);
    }

    return client;
  }

  async findByClientNumber(clientNumber: string): Promise<Client | null> {
    return this.clientRepository.findOne({
      where: { clientNumber },
    });
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (updateClientDto.clientNumber && updateClientDto.clientNumber !== client.clientNumber) {
      const existing = await this.clientRepository.findOne({
        where: { clientNumber: updateClientDto.clientNumber },
      });
      if (existing) {
        throw new ConflictError('Client with this client number already exists');
      }
    }

    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  private async generateClientNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CLT-${year}-`;
    const lastClient = await this.clientRepository.findOne({
      where: { clientNumber: Like(`${prefix}%`) },
      order: { clientNumber: 'DESC' },
    });

    if (!lastClient) {
      return `${prefix}0001`;
    }

    const lastNumber = parseInt(lastClient.clientNumber.split('-')[2], 10);
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `${prefix}${nextNumber}`;
  }
}

