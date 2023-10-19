import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { LogEntity } from './log.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepository: Repository<LogEntity>,
  ) {}

  async addToLogs(log: DeepPartial<LogEntity>) {
    console.log(log);
    await this.logRepository.save(log);
  }

  async getLogs() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0);
    const todayMinus30days = new Date();
    todayMinus30days.setDate(todayMinus30days.getDate() - 30);
    todayMinus30days.setHours(0, 0, 0);
    const data = await this.logRepository
      .createQueryBuilder('log')
      .select('COUNT(id)', 'count')
      .addSelect("DATE_TRUNC('DAY', created_at)", 'trunc_date')
      .where('created_at <= :tomorrow', { tomorrow: tomorrow })
      .andWhere('created_at > :todayMinus30days', {
        todayMinus30days: todayMinus30days,
      })
      .groupBy('trunc_date')
      .getMany();
    console.log(data);
  }
}
