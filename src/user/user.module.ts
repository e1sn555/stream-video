import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements OnModuleInit {
  constructor(private readonly userService: UserService) {}

  // async onModuleInit() {
  //   await this.userService.deleteAllUsers();
  //   const countUsers = await this.userService.countUsers();
  //   const password = await bcrypt.hash('123456789', 10);
  //   if (countUsers === 0) {
  //     await this.userService.createUser({
  //       email: 'admin@admin.com',
  //       password,
  //       name: 'Admin',
  //     });
  //   }
  // }
}
