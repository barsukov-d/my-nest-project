// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from './blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private blacklistService: BlacklistService,
  ) {}

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(token: string) {
    if (this.blacklistService.isBlacklisted(token)) {
      throw new Error('Refresh token is blacklisted');
    }
    const payload = this.jwtService.verify(token, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
    this.blacklistService.add(token); // Черный список старого Refresh Token
    const newAccessToken = this.jwtService.sign(
      { username: payload.username, sub: payload.sub },
      {
        secret: process.env.ACCESS_TOKEN_SECRET,
        expiresIn: '15m',
      },
    );
    const newRefreshToken = this.jwtService.sign(
      { username: payload.username, sub: payload.sub },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      },
    );
    return { access_token: newAccessToken, refresh_token: newRefreshToken };
  }

  async logout(token: string) {
    this.blacklistService.add(token);
  }
}
