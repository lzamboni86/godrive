import { Controller, Post, Get, Body, HttpCode, HttpStatus, BadRequestException, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterInstructorDto } from './dto/register-instructor.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register/student')
  async registerStudent(@Body() dto: RegisterStudentDto) {
    return this.authService.registerStudent(dto);
  }

  @Post('register/instructor')
  async registerInstructor(@Body() dto: RegisterInstructorDto) {
    return this.authService.registerInstructor(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('validate-reset-token')
  async validateResetToken(@Body() body: { token: string }) {
    return this.authService.validatePasswordResetToken(body.token);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  // Admin endpoints
  @Get('admin/instructors')
  async getInstructors() {
    console.log('🔍 [CONTROLLER] GET /admin/instructors');
    const result = await this.authService.getInstructors();
    console.log('🔍 [CONTROLLER] Result:', result);
    return result;
  }

  @Get('admin/students')
  async getStudents() {
    console.log('🔍 [CONTROLLER] GET /admin/students');
    const result = await this.authService.getStudents();
    console.log('🔍 [CONTROLLER] Result:', result);
    return result;
  }

  @Get('admin/dashboard')
  async getDashboard() {
    console.log('🔍 [CONTROLLER] GET /admin/dashboard');
    const result = await this.authService.getDashboard();
    console.log('🔍 [CONTROLLER] Result:', result);
    return result;
  }

  @Delete('delete-account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    console.log('🗑️ [AUTH-CONTROLLER] Solicitação de exclusão de conta:', userId);
    
    try {
      const result = await this.authService.deleteAccount(userId);
      console.log('✅ [AUTH-CONTROLLER] Conta excluída com sucesso:', userId);
      return result;
    } catch (error) {
      console.error('❌ [AUTH-CONTROLLER] Erro ao excluir conta:', error);
      throw error;
    }
  }

  @Post('admin/instructors/:id/approve')
  async approveInstructor(@Param('id') id: string) {
    console.log('🔍 [CONTROLLER] POST /admin/instructors/', id, '/approve');
    const result = await this.authService.approveInstructor(id);
    console.log('🔍 [CONTROLLER] Approve result:', result);
    return result;
  }

  @Post('admin/instructors/:id/reject')
  async rejectInstructor(@Param('id') id: string) {
    console.log('🔍 [CONTROLLER] POST /admin/instructors/', id, '/reject');
    const result = await this.authService.rejectInstructor(id);
    console.log('🔍 [CONTROLLER] Reject result:', result);
    return result;
  }
}
