import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterInstructorDto } from './dto/register-instructor.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { instructor: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Verificar status de aprovação para instrutores
    if (user.role === 'INSTRUCTOR' && user.instructor?.status !== 'APPROVED') {
      throw new UnauthorizedException('Seu cadastro como instrutor ainda está em análise. Aguarde a aprovação administrativa.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || (user.instructor?.id ? `Instrutor ${user.id.slice(-4)}` : `Usuário ${user.id.slice(-4)}`),
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accessToken,
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async registerStudent(dto: RegisterStudentDto) {
    console.log('🔐 [AUTH] Register student - DTO:', dto);
    
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      console.log('🔐 [AUTH] Email já cadastrado:', dto.email);
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    console.log('🔐 [AUTH] Password hashed');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: 'STUDENT',
        name: dto.name,
        phone: dto.phone,
      },
    });

    console.log('🔐 [AUTH] User created:', user.id);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    console.log('🔐 [AUTH] Token generated');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: dto.name,
        phone: dto.phone,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accessToken,
    };
  }

  async registerInstructor(dto: RegisterInstructorDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: 'INSTRUCTOR',
        name: dto.name,
        phone: dto.phone,
      },
    });

    const instructor = await this.prisma.instructor.create({
      data: {
        userId: user.id,
        gender: (dto.gender as any) || 'UNDISCLOSED',
        licenseCategories: ['B'],
        hourlyRate: dto.hourlyRate || 80.0,
        state: dto.state,
        city: dto.city,
        neighborhoodReside: dto.neighborhoodReside,
        neighborhoodTeach: dto.neighborhoodTeach,
      },
    });

    const vehicle = await this.prisma.vehicle.create({
      data: {
        instructorId: instructor.id,
        type: 'MANUAL',
        make: dto.vehicleMake || (dto.vehicleModel ? dto.vehicleModel.split(' ')[0] : null),
        model: dto.vehicleModel,
        year: dto.vehicleYear,
        plate: dto.vehiclePlate,
        transmission: (dto.transmission as any) || 'MANUAL',
        engineType: (dto.engineType as any) || 'COMBUSTION',
      },
    });

    return {
      message: 'Cadastro recebido com sucesso! Aguardando aprovação administrativa.',
      user: {
        id: user.id,
        email: user.email,
        name: dto.name,
        phone: dto.phone,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  // Admin methods
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
      status: 'PENDING', // Todos começam como pending até aprovação
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
        studentLessons: true,
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
    console.log('🔍 [DEBUG] Buscando dados do dashboard...');
    
    const [totalUsers, totalInstructors, totalLessons] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      this.prisma.lesson.count(),
    ]);

    console.log('🔍 [DEBUG] Dashboard data:', {
      totalUsers,
      totalInstructors,
      totalLessons
    });

    return {
      totalUsers,
      pendingInstructors: totalInstructors, // Todos como pending por enquanto
      todayLessons: 0, // Mock até implementar date field
      completedLessons: 0, // Mock até implementar status field
      revenue: 8500, // Mock - calcular real depois
    };
  }

  async approveInstructor(id: string) {
    // Como não temos campo status no schema ainda, vamos apenas simular aprovação
    // Futuro: adicionar campo status no Instructor model
    console.log('🔍 [DEBUG] Aprovando instrutor:', id);
    
    return { message: 'Instrutor aprovado com sucesso', instructorId: id };
  }

  async rejectInstructor(id: string) {
    // Deletar o usuário e registros relacionados se rejeitado
    console.log('🔍 [DEBUG] Rejeitando instrutor:', id);
    
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Instrutor rejeitado com sucesso', instructorId: id };
  }
}
