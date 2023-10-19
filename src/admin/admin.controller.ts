import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  Res,
  Session,
  UseGuards,
  Query,
  Delete,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { GuestGuard } from './guards/guest.guard';
import { AuthGuard } from './guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { createWriteStream, unlink } from 'fs';
import { join } from 'path';
import { LogService } from 'src/log/log.service';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Controller('/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly logService: LogService,
    private readonly userService: UserService,
  ) {}

  @Get('/')
  @UseGuards(AuthGuard)
  async index(@Res() res: Response) {
    res.redirect('/admin/dashboard');
  }

  @Get('/chart')
  async logTes() {
    const chart = await this.logService.getLogs();
    return chart;
  }

  @Get('/dashboard')
  @Render('dashboard')
  @UseGuards(AuthGuard)
  async dashboard(@Res() res: Response) {
    const data = await this.adminService.dashboard();
    return data;
  }

  @Get('/login')
  @Render('login')
  @UseGuards(GuestGuard)
  async login(@Query('error') error: number) {
    return {
      error: error ? 'Invalid credentials' : false,
    };
  }

  @Post('/login')
  @UseGuards(GuestGuard)
  async loginPost(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
    @Session() session: any,
  ) {
    const signedUser = await this.adminService.login(email, password);
    if (!signedUser) {
      return res.redirect('/admin/login?error=1');
    }
    session.user = signedUser;
    session.save();
    return res.redirect('/admin');
  }

  @Get('/branches')
  @Render('branches/list')
  @UseGuards(AuthGuard)
  async branchList() {
    const branches = await this.adminService.getBranches();
    return {
      branches,
    };
  }

  @Get('/update-password')
  @Render('update-password')
  @UseGuards(AuthGuard)
  async updatePassword(
    @Query('error', new DefaultValuePipe(0)) error: number,
    @Query('success', new DefaultValuePipe(0)) success: number,
  ) {
    return {
      errorCurrentPassword: error === 2,
      errorNewPassword: error === 1,
      success: success === 1,
    };
  }

  @Post('/update-password')
  @UseGuards(AuthGuard)
  async updatePasswordPost(
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @Body('newPasswordConfirm') confirmPassword: string,
    @Res() res: Response,
    @Session() session: any,
  ) {
    if (newPassword !== confirmPassword) {
      return res.redirect('/admin/update-password?error=1');
    }
    const user = await this.userService.findById(session.user.id);
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.redirect('/admin/update-password?error=2');
    }
    await this.adminService.updateUserPassword(session.user.id, newPassword);
    return res.redirect('/admin/update-password?success=1');
  }

  @Get('/branches/create')
  @Render('branches/create')
  @UseGuards(AuthGuard)
  async branchCreate() {}

  @Post('/branches')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('banner'))
  async branchCreatePost(
    @Body('name') name: string,
    @Body('address') address: string,
    @Body('password') password: string,
    @Res() res: Response,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    let fileName = null;
    if (banner) {
      const splittedExt = banner.originalname.split('.');
      const ext = splittedExt[splittedExt.length - 1];
      fileName = `${uuidv4()}.${ext}`;
      const ws = createWriteStream(
        join(__dirname, '..', '..', 'public', 'images', fileName),
      );
      ws.write(banner.buffer);
      ws.close();
    }
    await this.adminService.createBranch(name, address, password, fileName);
    return res.redirect('/admin/branches');
  }

  @Get('/branches/edit/:id')
  @Render('branches/edit')
  @UseGuards(AuthGuard)
  async branchEdit(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const branch = await this.adminService.getBranch(id);
    if (!branch) {
      return res.render('404');
    }
    return {
      branch,
    };
  }

  @Post('/branches/edit/:id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('banner'))
  async updateBranch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
    @Body('name') name: string,
    @Body('address') address: string,
    @Body('password') password: string,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    let fileName = null;
    if (banner) {
      const splittedExt = banner.originalname.split('.');
      const ext = splittedExt[splittedExt.length - 1];
      fileName = `${uuidv4()}.${ext}`;
      const ws = createWriteStream(
        join(__dirname, '..', '..', 'public', 'images', fileName),
      );
      ws.write(banner.buffer);
      ws.close();
    }
    const result = await this.adminService.updateBranch(
      id,
      name,
      address,
      password,
      fileName,
    );
    if (!result) {
      return res.redirect('/admin/branches/edit/' + id);
    }
    return res.redirect('/admin/branches');
  }

  @Delete('/branches/:id')
  @UseGuards(AuthGuard)
  async deleteBranch(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.adminService.deleteBranch(id);
    return {
      message: 'Branch deleted successfully',
    };
  }

  @Get('/videos')
  @Render('videos/list')
  @UseGuards(AuthGuard)
  async videoList() {
    const videos = (await this.adminService.getVideos()).map((v) => {
      v._viewCount = 0;

      Object.keys(v.views).forEach((key) => {
        v._viewCount += v.views[key].count;
      });

      return v;
    });
    return {
      videos,
    };
  }

  @Get('/videos/edit/:id')
  @Render('videos/edit')
  @UseGuards(AuthGuard)
  async videoEdit(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const video = await this.adminService.getVideo(id);
    if (!video) {
      return res.render('404');
    }
    const branches = (await this.adminService.getBranches()).map((branch) => {
      branch._selected = false;
      video.branches.map((videoBranch) => {
        if (branch.id === videoBranch.id) {
          branch._selected = true;
        }
      });
      return branch;
    });

    const today = new Date().toISOString().split('T')[0];
    return {
      video,
      branches,
      today,
    };
  }

  @Post('/videos/edit/:id')
  @UseGuards(AuthGuard)
  async updateVideo(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('endDate') endDate: string,
    @Body('startDate') startDate: string,
    @Body('branches') branches: Array<string>,
    @Body('title') title: string,
    @Res() res: Response,
  ) {
    const branchEntities = await this.adminService.getBranchesByIds(branches);
    const result = this.adminService.updateVideo(
      id,
      startDate,
      endDate,
      branchEntities,
      title,
    );
    if (!result) {
      return res.redirect('/admin/videos/edit/' + id);
    }
    return res.redirect('/admin/videos');
  }

  @Delete('/videos/:id')
  @UseGuards(AuthGuard)
  async deleteVideo(@Param('id', new ParseUUIDPipe()) id: string) {
    const video = await this.adminService.getVideo(id);
    if (!video) {
      return {
        message: 'Video not found',
      };
    }
    try {
      unlink(join(__dirname, '..', '..', '..', 'videos', video.link), () => {});
    } catch (e) {}
    await this.adminService.deleteVideo(id);
    return {
      message: 'Video deleted successfully',
    };
  }

  @Get('/videos/create')
  @UseGuards(AuthGuard)
  @Render('videos/create')
  async videoCreate() {
    const branches = await this.adminService.getBranches();
    const today = new Date().toISOString().split('T')[0];
    return {
      branches,
      today,
    };
  }

  @Post('/videos')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async videoCreatePost(
    @UploadedFile() video: Express.Multer.File,
    @Body('endDate') endDate: string,
    @Body('startDate') startDate: string,
    @Body('branches') branches: Array<string>,
    @Body('title') title: string,
    @Res() res: Response,
  ) {
    const splittedExt = video.originalname.split('.');
    const ext = splittedExt[splittedExt.length - 1];
    const fileName = `${uuidv4()}.${ext}`;
    const ws = createWriteStream(
      join(__dirname, '..', '..', '..', 'videos', fileName),
    );
    ws.write(video.buffer);
    ws.close();
    const branchEntities = await this.adminService.getBranchesByIds(branches);
    await this.adminService.createVideo(
      fileName,
      branchEntities,
      startDate,
      endDate,
      title,
    );
    return res.redirect('/admin/videos');
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  async logout(@Res() res: Response, @Session() session: any) {
    session.destroy();
    return res.redirect('/admin/login');
  }

  @Get('*')
  @Render('404')
  @UseGuards(AuthGuard)
  async notFound() {}
}
