import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('instructors')
  async getInstructors() {
    return this.adminService.getInstructors();
  }

  @Get('students')
  async getStudents() {
    return this.adminService.getStudents();
  }

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('payments')
  async getPayments() {
    return this.adminService.getPayments();
  }

  @Post('instructors/:id/approve')
  async approveInstructor(@Param('id') id: string) {
    return this.adminService.approveInstructor(id);
  }

  @Post('instructors/:id/reject')
  async rejectInstructor(@Param('id') id: string) {
    return this.adminService.rejectInstructor(id);
  }

  @Post('payments/:id/process')
  async processPayment(@Param('id') id: string) {
    return this.adminService.processPayment(id);
  }

  @Post('payments/:id/invoice')
  async generateInvoice(@Param('id') id: string) {
    return this.adminService.generateInvoice(id);
  }

  @Get('logs')
  async getLogs() {
    return this.adminService.getLogs();
  }
}
