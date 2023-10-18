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
    await this.logRepository.save(log);
  }

  async getLogs() {
    const today = new Date();
    const todayMinus30day = new Date();
    todayMinus30day.setDate(todayMinus30day.getDate() - 30);
  }
}
