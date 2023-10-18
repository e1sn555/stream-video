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
    const today = new Date();
    today.setHours(0, 0, 0);
    const todayMinus30days = new Date();
    todayMinus30days.setDate(todayMinus30days.getDate() - 30);
    todayMinus30days.setHours(0, 0, 0);
    const data = await this.logRepository
      .createQueryBuilder('log')
      .where('log.createdAt <= :today', { today: today })
      .andWhere('log.createdAt > :todayMinus30days', {
        todayMinus30days: todayMinus30days,
      })
      .getSql();
    console.log(data);
  }
}
