import { Module } from '@nestjs/common';
import { BranchModule } from 'src/branch/branch.module';
import { UserModule } from 'src/user/user.module';
import { VideoModule } from 'src/video/video.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { GuestGuard } from './guards/guest.guard';

@Module({
  imports: [BranchModule, UserModule, VideoModule],
  controllers: [AdminController],
  providers: [AdminService, GuestGuard],
})
export class AdminModule {}
