import { Injectable } from '@nestjs/common';
import { BranchService } from 'src/branch/branch.service';
import * as bcrypt from 'bcrypt';
import { BranchEntity } from 'src/branch/branch.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ApiService {
  constructor(
    private readonly branchService: BranchService,
    private readonly jwtService: JwtService,
  ) {}

  async validateBranch(
    branchId: string,
    password: string,
  ): Promise<BranchEntity | false> {
    const branch = await this.branchService.findBranchById(branchId);
    if (!branch) {
      return false;
    }
    console.log(password, branch.password);
    const isMatch = await bcrypt.compare(password, branch.password);
    if (!isMatch) {
      return false;
    }
    return branch;
  }

  async login(branch: BranchEntity) {
    const payload = { username: branch.name, sub: branch.id };
    return {
      branch: {
        id: branch.id,
        name: branch.name,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}
