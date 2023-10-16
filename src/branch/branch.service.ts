import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BranchEntity } from './branch.entity';
import { Repository, DeepPartial, DeleteResult, In } from 'typeorm';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(BranchEntity)
    private readonly branchRepository: Repository<BranchEntity>,
  ) {}

  async getAllBranches(): Promise<BranchEntity[]> {
    return await this.branchRepository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: ['videos'],
    });
  }

  async createBranch(branch: DeepPartial<BranchEntity>): Promise<BranchEntity> {
    return await this.branchRepository.save(branch);
  }

  async updateBranch(
    id: string,
    branch: DeepPartial<BranchEntity>,
  ): Promise<BranchEntity> {
    return await this.branchRepository.save({ id, ...branch });
  }

  async deleteBranch(id: string): Promise<DeleteResult> {
    return await this.branchRepository.delete(id);
  }

  async findBranchById(id: string): Promise<BranchEntity> {
    return await this.branchRepository.findOne({
      where: { id },
    });
  }

  async findBranchesByIds(ids: string[]): Promise<BranchEntity[]> {
    return await this.branchRepository.find({
      where: { id: In(ids) },
    });
  }
}
