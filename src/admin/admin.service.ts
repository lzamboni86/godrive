import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getInstructors() {
    console.log('🔍 [DEBUG] Buscando instrutores...');
    
    const instructors = await this.prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      include: {
        instructor: {
          include: {
            vehicles: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('🔍 [DEBUG] Instrutores encontrados:', instructors.length);
    console.log('🔍 [DEBUG] Instrutores data:', JSON.stringify(instructors, null, 2));

    const result = instructors.map(user => ({
      id: user.id,
      name: user.email.split('@')[0], // Nome temporário do email
      email: user.email,
      phone: null, // Não temos phone no User ainda
      status: (user.instructor as any)?.status || 'PENDING', // Usar status real do Instructor
      vehicle: user.instructor?.vehicles?.[0] 
        ? `${user.instructor.vehicles[0].make} ${user.instructor.vehicles[0].model}`
        : 'Não informado',
      cnh: 'Não informado', // Não temos CNH no banco ainda
      createdAt: user.createdAt.toISOString().split('T')[0],
    }));

    console.log('🔍 [DEBUG] Instrutores result:', result);
    return result;
  }

  async getStudents() {
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        studentLessons: {
          where: { status: 'COMPLETED' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return students.map(user => ({
      id: user.id,
      name: user.email.split('@')[0], // Nome temporário do email
      email: user.email,
      phone: null,
      totalLessons: user.studentLessons.length,
      completedLessons: user.studentLessons.filter(l => l.status === 'COMPLETED').length,
      createdAt: user.createdAt.toISOString().split('T')[0],
      status: 'ACTIVE',
    }));
  }

  async getDashboard() {
    const [totalUsers, totalInstructors, totalLessons] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      this.prisma.lesson.count(),
    ]);

    return {
      totalUsers,
      pendingInstructors: totalInstructors, // Todos como pending por enquanto
      todayLessons: 0, // Mock até implementar date field
      completedLessons: 0, // Mock até implementar status field
      revenue: 8500, // Mock - calcular real depois
    };
  }

  async approveInstructor(id: string) {
    console.log('🔍 [ADMIN SERVICE] Aprovando instrutor:', id);
    
    // Atualizar o status do instrutor para APPROVED
    await this.prisma.$executeRaw`UPDATE "Instructor" SET status = 'APPROVED' WHERE "userId" = ${id}`;
    
    return { message: 'Instrutor aprovado com sucesso', instructorId: id };
  }

  async rejectInstructor(id: string) {
    console.log('🔍 [ADMIN SERVICE] Rejeitando instrutor:', id);
    // Deletar o usuário (cascade delete vai remover instructor e vehicle)
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: 'Instrutor rejeitado com sucesso', instructorId: id };
  }
}
