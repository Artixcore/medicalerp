import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { NotFoundError } from '@shared/common/errors';
import { CreatePaymentDto, UpdatePaymentDto } from './dto';
import { ClaimService } from '../claim/claim.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly claimService: ClaimService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Verify claim exists
    await this.claimService.findOne(createPaymentDto.claimId);

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paymentDate: new Date(createPaymentDto.paymentDate),
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update claim status and paid amount
    await this.claimService.markPaid(
      createPaymentDto.claimId,
      createPaymentDto.amount,
    );

    return savedPayment;
  }

  async findAll(
    claimId?: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ data: Payment[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (claimId) {
      where.claimId = claimId;
    }

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      skip,
      take: pageSize,
      order: { paymentDate: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundError('Payment', id);
    }
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, {
      ...updatePaymentDto,
      paymentDate: updatePaymentDto.paymentDate
        ? new Date(updatePaymentDto.paymentDate)
        : payment.paymentDate,
    });
    return this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }
}

