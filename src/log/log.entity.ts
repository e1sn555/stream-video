import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('logs')
export class LogEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  videoId: string;

  @Column()
  branchId: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdAt: Date;
}
