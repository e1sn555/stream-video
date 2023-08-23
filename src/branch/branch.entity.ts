import * as moment from 'moment';
import { VideoEntity } from 'src/video/video.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('branches')
export class BranchEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  address?: string;

  @ManyToMany(() => VideoEntity)
  @JoinTable()
  videos: VideoEntity[];

  @Column({
    type: 'varchar',
    length: 255,
  })
  password?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  get _createdAt(): string {
    return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
  }
}
