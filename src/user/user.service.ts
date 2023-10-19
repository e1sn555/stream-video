import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async deleteAllUsers(): Promise<void> {
    await this.userRepository.clear();
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async createUser(user: DeepPartial<UserEntity>): Promise<UserEntity> {
    return await this.userRepository.save(user);
  }

  async countUsers(): Promise<number> {
    return await this.userRepository.count();
  }

  async updatePassword(id: string, password: string) {
    const encryptedPassword = await bcrypt.hash(password, 10);
    return await this.userRepository.update(id, {
      password: encryptedPassword,
    });
  }

  async findById(id: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: { id },
    });
  }
}
