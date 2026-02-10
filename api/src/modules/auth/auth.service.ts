import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import {UserDocument} from "../user/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const user: UserDocument = await this.userService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: passwordHash,
    });

    const token = await this.jwtService.signAsync({
      sub: user._id?.toString(),
      email: user.email,
    });

    return {
      id: user._id?.toString(),
      email: user.email,
      name: user.name,
      token,
    };
  }
}
