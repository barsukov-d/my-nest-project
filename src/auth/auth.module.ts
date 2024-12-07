// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenStrategy } from './refresh-token.strategy';
import { AuthController } from './auth.controller';
import { BlacklistService } from './blacklist.service';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy, BlacklistService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
