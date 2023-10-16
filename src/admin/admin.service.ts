import { Injectable } from '@nestjs/common';
import { BranchService } from 'src/branch/branch.service';
import { UserService } from 'src/user/user.service';
import { VideoService } from 'src/video/video.service';
import * as bcrypt from 'bcrypt';
import { BranchEntity } from 'src/branch/branch.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly branchService: BranchService,
    private readonly videoService: VideoService,
    private readonly userService: UserService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return false;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return false;
    }
    return user;
  }

  async getBranches() {
    return await this.branchService.getAllBranches();
  }

  async deleteBranch(id: string) {
    await this.branchService.deleteBranch(id);
  }

  async createBranch(name: string, address: string, password: string) {
    const encryptedPassword = await bcrypt.hash(password, 10);
    return await this.branchService.createBranch({
      name,
      address,
      password: encryptedPassword,
    });
  }

  async getBranch(id: string) {
    return await this.branchService.findBranchById(id);
  }

  async updateBranch(
    id: string,
    name: string,
    address: string,
    password: string,
  ) {
    const branch = await this.branchService.findBranchById(id);
    if (!branch) {
      return false;
    }
    const encryptedPassword = password
      ? await bcrypt.hash(password, 10)
      : branch.password;
    return await this.branchService.updateBranch(id, {
      name,
      address,
      password: encryptedPassword,
    });
  }

  async getVideos() {
    return await this.videoService.getAllVideos();
  }

  async deleteVideo(id: string) {
    await this.videoService.deleteVideo(id);
  }

  async getBranchesByIds(ids: string[]) {
    return await this.branchService.findBranchesByIds(ids);
  }

  async createVideo(
    link: string,
    branches: BranchEntity[],
    startDate: string,
    endDate: string,
  ) {
    return await this.videoService.createVideo({
      link,
      branches,
      startDate,
      endDate,
    });
  }

  async getVideo(id: string) {
    return await this.videoService.findVideoById(id);
  }

  async updateVideo(id: string, startDate: string, endDate: string) {
    return await this.videoService.updateVideo(id, {
      startDate,
      endDate,
    });
  }
}
