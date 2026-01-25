import { Controller, Delete, Post, UseGuards, Req, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('me/push-token')
  async setPushToken(@Req() req: any, @Body() body: { token: string }) {
    const userId = req.user.sub || req.user.id;
    return this.usersService.setExpoPushToken(userId, body?.token);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    console.log('🔐 [CONTROLLER] DELETE /users/me - User:', userId);
    return this.usersService.deleteAccount(userId, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/export-data')
  async requestDataExport(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    console.log('📦 [CONTROLLER] POST /users/me/export-data - User:', userId);
    return this.usersService.requestDataExport(userId, ipAddress, userAgent);
  }
}
