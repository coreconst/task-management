import {ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import {UserDocument} from "../user/schemas/user.schema";
import {LoginDto} from "./dto/login.dto";
import {AuthResponseDto} from "./dto/auth-response.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
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
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException();

    const isValidPassword = await bcrypt.compare(loginDto.password, user.password);
    if(!isValidPassword) throw new UnauthorizedException();

    const token = await this.jwtService.signAsync({
      sub: user._id?.toString(),
      email: user.email,
    });

    return {
      id: user._id?.toString(),
      email: user.email,
      name: user.name,
      accessToken: token,
    };
  }
}
