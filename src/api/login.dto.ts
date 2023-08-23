import { IsNotEmpty, IsUUID } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @IsNotEmpty()
  password: string;
}
