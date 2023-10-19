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
    const data = await this.logRepository.query(
      `SELECT COUNT(id) AS "count", DATE_TRUNC('DAY', created_at) AS "trunc_date" 
      FROM "logs" "log" 
      WHERE created_at <= '${tomorrow.toISOString()}' AND created_at > '${todayMinus30days.toISOString()}' 
      GROUP BY trunc_date
      ORDER BY trunc_date ASC;`,
    );

    return {
      last: tomorrow.toISOString(),
      first: todayMinus30days.toISOString(),
      data,
    };
  }
}
