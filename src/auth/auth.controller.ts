// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(body);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // установить true в продакшене
      path: '/auth/refresh',
      sameSite: 'strict',
    });
    return { access_token: tokens.access_token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('test')
  async test(@Req() req) {
    return { message: 'You are authenticated', user: req.user };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    const tokens = await this.authService.refreshToken(refreshToken);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh',
      sameSite: 'strict',
    });
    return { access_token: tokens.access_token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh',
      sameSite: 'strict',
    });
    return { message: 'Logged out successfully' };
  }
}
