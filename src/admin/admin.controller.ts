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
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { GuestGuard } from './guards/guest.guard';
import { AuthGuard } from './guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { createWriteStream, unlink } from 'fs';
import { join } from 'path';

@Controller('/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/')
  @UseGuards(AuthGuard)
  async index(@Res() res: Response) {
    res.redirect('/admin/branches');
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
    console.log(branches);
    return {
      branches,
    };
  }

  @Get('/branches/create')
  @Render('branches/create')
  @UseGuards(AuthGuard)
  async branchCreate() {}

  @Post('/branches')
  @UseGuards(AuthGuard)
  async branchCreatePost(
    @Body('name') name: string,
    @Body('address') address: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    await this.adminService.createBranch(name, address, password);
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
  async updateBranch(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
    @Body('name') name: string,
    @Body('address') address: string,
    @Body('password') password: string,
  ) {
    const result = this.adminService.updateBranch(id, name, address, password);
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
    const videos = await this.adminService.getVideos();
    return {
      videos,
    };
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
    );
    return res.redirect('/admin/videos');
  }

  @Get('logout')
  @UseGuards(AuthGuard)
  async logout(@Res() res: Response, @Session() session: any) {}

  @Get('*')
  @Render('404')
  @UseGuards(AuthGuard)
  async notFound() {}
}
