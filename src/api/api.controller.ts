import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  BadRequestException,
  Body,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BranchService } from 'src/branch/branch.service';
import { VideoService } from 'src/video/video.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiService } from './api.service';
import { LoginDto } from './login.dto';
import { ConfigService } from '@nestjs/config';
import { LogService } from 'src/log/log.service';

@Controller('api')
@ApiTags('api')
export class ApiController {
  constructor(
    private readonly videoService: VideoService,
    private readonly branchService: BranchService,
    private readonly apiService: ApiService,
    private readonly configService: ConfigService,
    private readonly logService: LogService,
  ) {}

  @Post('login')
  async login(@Body() { branchId, password }: LoginDto) {
    const validateBranch = await this.apiService.validateBranch(
      branchId,
      password,
    );
    if (!validateBranch) {
      throw new BadRequestException();
    }
    return await this.apiService.login(validateBranch);
  }

  @Get('branches')
  // @UseGuards(JwtAuthGuard)
  async getBranches() {
    const branches = await this.branchService.getAllBranches();
    return {
      success: true,
      branches: branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
      })),
    };
  }

  @Get('video')
  @UseGuards(JwtAuthGuard)
  async getVideo(@Query('key') skip: string, @Req() req: any) {
    const key = parseInt(skip) - 1;
    if (isNaN(key) || key < 0 || key === undefined) {
      throw new BadRequestException();
    }
    const branchId = req.user.branchId;
    const video = await this.videoService.findVideoByBranchId(branchId, key);
    if (!video) {
      return {
        success: false,
      };
    }
    await this.videoService.updateVideoViews(video.id, branchId);
    const videoCount = await this.videoService.getVideoCountByBranchId(
      branchId,
    );
    await this.logService.addToLogs({
      videoId: video.id,
      branchId: branchId,
    });
    return {
      success: true,
      total: videoCount,
      currentVideo: {
        url: `https://newcdn.145group.com/${video.link}`,
        key: key + 1,
      },
    };
  }
}
