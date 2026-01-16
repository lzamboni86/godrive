import { Controller, Post, Get, Body, HttpCode, HttpStatus, BadRequestException, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
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
