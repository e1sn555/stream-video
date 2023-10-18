import { Injectable } from '@nestjs/common';
import { BranchService } from 'src/branch/branch.service';
import { UserService } from 'src/user/user.service';
import { VideoService } from 'src/video/video.service';
import * as bcrypt from 'bcrypt';
import { BranchEntity } from 'src/branch/branch.entity';
import { VideoEntity } from 'src/video/video.entity';

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

  async createBranch(
    name: string,
    address: string,
    password: string,
    fileName?: string | null,
  ) {
    const encryptedPassword = await bcrypt.hash(password, 10);
    return await this.branchService.createBranch({
      name,
      address,
      password: encryptedPassword,
      banner: fileName,
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
    title: string,
  ) {
    return await this.videoService.createVideo({
      link,
      branches,
      startDate,
      endDate,
      title,
    });
  }

  async getVideo(id: string) {
    return await this.videoService.findVideoById(id);
  }

  async updateVideo(
    id: string,
    startDate: string,
    endDate: string,
    branches: BranchEntity[],
    title: string,
  ) {
    return await this.videoService.updateVideo(id, {
      startDate,
      endDate,
      branches,
      title,
    });
  }

  async getVideoByBranchId(branchId: string): Promise<VideoEntity[]> {
    return await this.videoService.getVideosByBranchId(branchId);
  }

  async dashboard() {
    const videoCount = await this.videoService.totalVideoCount();
    const viewCount = await this.videoService.totalViewCount();
    const branchCount = await this.branchService.totalBranchCount();
    const lastFiveVideos = await this.videoService.lastFiveActiveVideos();

    return {
      videoCount,
      viewCount,
      branchCount,
      lastFiveVideos,
    };
  }
}
