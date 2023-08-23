import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { BranchEntity } from './branch.entity';
import { BranchService } from './branch.service';

@Module({
  imports: [TypeOrmModule.forFeature([BranchEntity])],
  providers: [BranchService],
  exports: [BranchService],
})
export class BranchModule {}
