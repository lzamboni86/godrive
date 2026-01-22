import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get('instructor/:instructorId')
  async findByInstructor(@Param('instructorId') instructorId: string) {
    return this.lessonsService.findByInstructor(instructorId);
  }

  @Get('instructor/:instructorId/today')
  async findTodayByInstructor(@Param('instructorId') instructorId: string) {
    return this.lessonsService.findTodayByInstructor(instructorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.lessonsService.updateStatus(id, body.status);
  }

  // Endpoint de teste para criar aula diretamente (sem Mercado Pago)
  @Post('test-create')
  async testCreate(@Body() body: {
    studentId: string;
    instructorId: string;
    lessonDate: string;
    lessonTime: string;
    price: number;
  }) {
    return this.lessonsService.createTestLesson(body);
  }
}
