import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async createReview(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewService.createReview(createReviewDto, req.user.id);
  }

  @Get('instructor/:instructorId')
  async getInstructorReviews(@Param('instructorId') instructorId: string) {
    return this.reviewService.getInstructorReviews(instructorId);
  }

  @Get('instructor/:instructorId/stats')
  async getInstructorStats(@Param('instructorId') instructorId: string) {
    return this.reviewService.getInstructorStats(instructorId);
  }

  @Get('lesson/:lessonId')
  async getLessonReview(@Param('lessonId') lessonId: string, @Request() req) {
    return this.reviewService.getLessonReview(lessonId, req.user.id);
  }
}
