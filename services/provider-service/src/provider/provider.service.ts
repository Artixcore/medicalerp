import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { NotFoundError, ConflictError } from '@shared/common/errors';
import { CreateProviderDto, UpdateProviderDto } from './dto';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    if (createProviderDto.npi) {
      const existing = await this.providerRepository.findOne({
        where: { npi: createProviderDto.npi },
      });
      if (existing) {
        throw new ConflictError('Provider with this NPI already exists');
      }
    }

    const provider = this.providerRepository.create(createProviderDto);
    return this.providerRepository.save(provider);
  }

  async findAll(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    type?: string,
    isActive?: boolean,
  ): Promise<{ data: Provider[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.providerRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { name: 'ASC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({ where: { id } });
    if (!provider) {
      throw new NotFoundError('Provider', id);
    }
    return provider;
  }

  async findByNpi(npi: string): Promise<Provider | null> {
    return this.providerRepository.findOne({ where: { npi } });
  }

  async update(id: string, updateProviderDto: UpdateProviderDto): Promise<Provider> {
    const provider = await this.findOne(id);

    if (
      updateProviderDto.npi &&
      updateProviderDto.npi !== provider.npi
    ) {
      const existing = await this.providerRepository.findOne({
        where: { npi: updateProviderDto.npi },
      });
      if (existing) {
        throw new ConflictError('Provider with this NPI already exists');
      }
    }

    Object.assign(provider, updateProviderDto);
    return this.providerRepository.save(provider);
  }

  async remove(id: string): Promise<void> {
    const provider = await this.findOne(id);
    await this.providerRepository.remove(provider);
  }
}

