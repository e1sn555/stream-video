import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { VideoEntity } from './video.entity';
import { Repository, DeepPartial, DeleteResult } from 'typeorm';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoEntity)
    private readonly videoRepository: Repository<VideoEntity>,
  ) {}

  async getAllVideos(): Promise<VideoEntity[]> {
    return await this.videoRepository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: ['branches'],
    });
  }

  async createVideo(video: DeepPartial<VideoEntity>): Promise<VideoEntity> {
    return await this.videoRepository.save(video);
  }

  async updateVideo(id: string, video: DeepPartial<VideoEntity>) {
    return await this.videoRepository.save({ id, ...video });
  }

  async deleteVideo(id: string): Promise<DeleteResult> {
    return await this.videoRepository.delete(id);
  }

  async findVideoById(id: string): Promise<VideoEntity> {
    return await this.videoRepository.findOne({
      where: { id },
      relations: ['branches'],
    });
  }

  async getVideoCountByBranchId(branchId: string): Promise<number> {
    return await this.videoRepository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.branches', 'branch')
      .where('branch.id = :branchId', { branchId })
      .andWhere('video.startDate <= :today', { today: new Date() })
      .andWhere('video.endDate >= :today', { today: new Date() })
      .getCount();
  }

  async findVideoByBranchId(
    branchId: string,
    skip: number,
  ): Promise<VideoEntity> {
    return await this.videoRepository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.branches', 'branch')
      .where('branch.id = :branchId', { branchId })
      .andWhere('video.startDate <= :today', { today: new Date() })
      .andWhere('video.endDate >= :today', { today: new Date() })
      .orderBy('video.createdAt', 'ASC')
      .skip(skip)
      .getOne();
  }

  async updateVideoViews(id: string, branchId: string) {
    const video = await this.findVideoById(id);
    const branch = video.branches.find((branch) => branch.id === branchId);
    if (!video) {
      return false;
    }
    const views = video.views || {};
    if (!views[branchId]) {
      views[branchId] = {
        name: branch.name,
        count: 1,
      };
    } else {
      views[branchId].count++;
    }
    console.log(views);
    await this.updateVideo(id, { views });
  }
}
