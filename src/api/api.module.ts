import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { VideoModule } from 'src/video/video.module';
import { BranchModule } from 'src/branch/branch.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { ApiService } from './api.service';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [
    VideoModule,
    BranchModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    LogModule,
  ],
  controllers: [ApiController],
  providers: [JwtStrategy, ApiService],
})
export class ApiModule {}
