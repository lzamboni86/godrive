import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(createReviewDto: CreateReviewDto, studentId: string) {
    // Verificar se o aluno pode avaliar esta aula
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: createReviewDto.lessonId },
      include: {
        student: true,
        instructor: true,
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (lesson.studentId !== studentId) {
      throw new Error('Student is not enrolled in this lesson');
    }

    if (lesson.status !== 'COMPLETED') {
      throw new Error('Lesson must be completed before review');
    }

    // Verificar se já existe uma avaliação
    const existingReview = await this.prisma.review.findUnique({
      where: {
        lessonId_studentId: {
          lessonId: createReviewDto.lessonId,
          studentId: studentId,
        },
      },
    });

    if (existingReview) {
      throw new Error('Review already exists for this lesson');
    }

    // Criar a avaliação
    const review = await this.prisma.review.create({
      data: {
        lessonId: createReviewDto.lessonId,
        studentId: studentId,
        instructorId: lesson.instructorId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
      include: {
        instructor: {
          include: {
            user: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Atualizar a média do instrutor
    await this.updateInstructorRating(lesson.instructorId);

    // Mudar status da aula para EVALUATED
    await this.prisma.lesson.update({
      where: { id: createReviewDto.lessonId },
      data: { status: 'EVALUATED' },
    });

    return review;
  }

  async updateInstructorRating(instructorId: string) {
    // Buscar todas as avaliações do instrutor
    const reviews = await this.prisma.review.findMany({
      where: { instructorId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      return;
    }

    // Calcular média
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Atualizar instrutor
    await this.prisma.instructor.update({
      where: { id: instructorId },
      data: {
        averageRating: averageRating,
        rating: averageRating,
        totalReviews: reviews.length,
      },
    });
  }

  async getInstructorReviews(instructorId: string) {
    return this.prisma.review.findMany({
      where: { instructorId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lesson: {
          select: {
            id: true,
            lessonDate: true,
            lessonTime: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLessonReview(lessonId: string, studentId: string) {
    return this.prisma.review.findUnique({
      where: {
        lessonId_studentId: {
          lessonId,
          studentId,
        },
      },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getInstructorStats(instructorId: string) {
    const instructor = await this.prisma.instructor.findUnique({
      where: { id: instructorId },
      select: {
        averageRating: true,
        totalReviews: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Distribuição de ratings
    const ratingDistribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { instructorId },
      _count: {
        rating: true,
      },
    });

    return {
      instructor,
      ratingDistribution: ratingDistribution.map(item => ({
        rating: item.rating,
        count: item._count.rating,
      })),
    };
  }
}
