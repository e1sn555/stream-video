import { BranchEntity } from 'src/branch/branch.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('videos')
export class VideoEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  _viewCount?: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  link: string;

  @Column({
    type: 'date',
  })
  startDate: string;

  @Column({
    type: 'date',
  })
  endDate: string;

  @Column({
    type: 'jsonb',
    default: {},
  })
  views: {
    [key: string]: {
      name: string;
      count: number;
    };
  };

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToMany(() => BranchEntity)
  @JoinTable()
  branches: BranchEntity[];

  get _createdAt(): string {
    return this.createdAt.toLocaleDateString();
  }

  get __viewCount(): number {
    let count = 0;
    Object.keys(this.views).forEach((key) => {
      count += this.views[key].count;
    });
    return count;
  }
}
