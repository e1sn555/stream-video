import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { LogEntity } from './log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';

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

  getRange(startDate: any, endDate: any, type) {
    let fromDate = moment(startDate);
    let toDate = moment(endDate);
    let diff = toDate.diff(fromDate, type);
    let range = [];
    for (let i = 0; i < diff; i++) {
      range.push(moment(startDate).add(i, type));
    }
    return range;
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

    // between dates  todayMinus30days and tomorrow
    const labels = this.getRange(todayMinus30days, tomorrow, 'days');

    const values = [];

    labels.forEach((label) => {
      if (
        data.find((item: any) => item.trunc_date === label.format('YYYY-MM-DD'))
      ) {
        values.push(
          data.find(
            (item: any) => item.trunc_date === label.format('YYYY-MM-DD'),
          ).count,
        );
      } else {
        values.push(0);
      }
    });

    return {
      labels,
      data: values,
    };
  }
}
