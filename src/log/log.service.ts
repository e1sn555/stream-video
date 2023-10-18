import { Injectable } from '@nestjs/common';
import { DeepPartial, LessThanOrEqual, Repository } from 'typeorm';
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
    console.log(today, todayMinus30days);
    const data = await this.logRepository.find({
      where: {
        createdAt: LessThanOrEqual(today),
      },
    });
    console.log(data);
  }
}
