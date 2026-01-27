import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterInstructorDto } from './dto/register-instructor.dto';
import { MailService } from '../mail/mail.service';
import { isValidCpf } from '../utils/cpf-validator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private isDeletedAccount(user: { passwordHash: string; email: string }) {
    if (user.passwordHash === 'DELETED') return true;
    if (user.email?.startsWith('deleted_') && user.email?.endsWith('@anonimizado.godrive.com')) return true;
    return false;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { instructor: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    if (this.isDeletedAccount(user)) {
      throw new UnauthorizedException('Esta conta foi excluída.');
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
        cpf: (user as any).cpf,
        addressStreet: (user as any).addressStreet,
        addressNumber: (user as any).addressNumber,
        addressZipCode: (user as any).addressZipCode,
        addressNeighborhood: (user as any).addressNeighborhood,
        addressCity: (user as any).addressCity,
        addressState: (user as any).addressState,
        addressComplement: (user as any).addressComplement,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accessToken,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;
    if (this.isDeletedAccount(user)) return null;
    return user;
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

    // Valida CPF se fornecido
    if (dto.cpf && !isValidCpf(dto.cpf)) {
      throw new BadRequestException('CPF inválido');
    }

    // Verifica duplicidade de CPF
    if (dto.cpf) {
      const existingCpf = await this.prisma.user.findFirst({
        where: { cpf: dto.cpf },
      });
      if (existingCpf) {
        throw new ConflictException('CPF já cadastrado');
      }
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
        cpf: dto.cpf || null,
        addressStreet: dto.addressStreet || null,
        addressNumber: dto.addressNumber || null,
        addressZipCode: dto.addressZipCode || null,
        addressNeighborhood: dto.addressNeighborhood || null,
        addressCity: dto.addressCity || null,
        addressState: dto.addressState || null,
        addressComplement: dto.addressComplement || null,
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
        cpf: (user as any).cpf,
        addressStreet: (user as any).addressStreet,
        addressNumber: (user as any).addressNumber,
        addressZipCode: (user as any).addressZipCode,
        addressNeighborhood: (user as any).addressNeighborhood,
        addressCity: (user as any).addressCity,
        addressState: (user as any).addressState,
        addressComplement: (user as any).addressComplement,
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

    // Valida CPF se fornecido
    if (dto.cpf && !isValidCpf(dto.cpf)) {
      throw new BadRequestException('CPF inválido');
    }

    // Verifica duplicidade de CPF
    if (dto.cpf) {
      const existingCpf = await this.prisma.user.findFirst({
        where: { cpf: dto.cpf },
      });
      if (existingCpf) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        role: 'INSTRUCTOR',
        name: dto.name,
        phone: dto.phone,
        cpf: dto.cpf || null,
        addressStreet: dto.addressStreet || null,
        addressNumber: dto.addressNumber || null,
        addressZipCode: dto.addressZipCode || null,
        addressNeighborhood: dto.addressNeighborhood || null,
        addressCity: dto.addressCity || null,
        addressState: dto.addressState || null,
        addressComplement: dto.addressComplement || null,
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
        cpf: (user as any).cpf,
        addressStreet: (user as any).addressStreet,
        addressNumber: (user as any).addressNumber,
        addressZipCode: (user as any).addressZipCode,
        addressNeighborhood: (user as any).addressNeighborhood,
        addressCity: (user as any).addressCity,
        addressState: (user as any).addressState,
        addressComplement: (user as any).addressComplement,
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
    console.log('🔍 [DEBUG] Aprovando instrutor:', id);
    
    // Atualizar o status do instrutor para APPROVED
    await this.prisma.instructor.update({
      where: { userId: id },
      data: { status: 'APPROVED' }
    });
    
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

  async forgotPassword(email: string) {
    console.log('📧 [AUTH] Solicitação de recuperação de senha para:', email);

    try {
      // Gerar token
      const token = await this.mailService.generatePasswordResetToken(email);
      
      // Enviar e-mail
      await this.mailService.sendPasswordResetEmail(email, token);
      
      return {
        message: 'Se o e-mail existir em nossa base, você receberá um link para redefinir sua senha',
      };
    } catch (error) {
      console.error('📧 [AUTH] Erro na recuperação de senha:', error);
      // Por segurança, sempre retornamos sucesso mesmo que o email não exista
      return {
        message: 'Se o e-mail existir em nossa base, você receberá um link para redefinir sua senha',
      };
    }
  }

  async validatePasswordResetToken(token: string) {
    console.log('📧 [AUTH] Validando token de reset de senha');

    try {
      const user = await this.mailService.validatePasswordResetToken(token);
      console.log('📧 [AUTH] Token válido para usuário:', user.id);
      
      return {
        valid: true,
        message: 'Token válido'
      };
    } catch (error) {
      console.error('📧 [AUTH] Token inválido:', error);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    console.log('📧 [AUTH] Tentativa de reset de senha com token');

    try {
      // Validar token
      const user = await this.mailService.validatePasswordResetToken(token);
      
      // Hash da nova senha
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      // Atualizar senha do usuário
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      
      // Marcar token como usado
      await this.mailService.markTokenAsUsed(token);
      
      console.log('📧 [AUTH] Senha redefinida com sucesso para usuário:', user.id);
      
      return {
        message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.',
      };
    } catch (error) {
      console.error('📧 [AUTH] Erro no reset de senha:', error);
      throw new UnauthorizedException('Token inválido ou expirado. Por favor, solicite uma nova recuperação de senha.');
    }
  }

  async deleteAccount(userId: string) {
    console.log('🗑️ [AUTH] Iniciando exclusão da conta:', userId);

    try {
      // Buscar usuário para verificar se existe
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      console.log('🗑️ [AUTH] Usuário encontrado:', { id: user.id, email: user.email, role: user.role });

      // Excluir dados relacionados baseado no tipo de usuário
      if (user.role === 'INSTRUCTOR') {
        console.log('🗑️ [AUTH] Excluindo dados de instrutor...');
        
        // Buscar instrutor relacionado
        const instructor = await this.prisma.instructor.findFirst({
          where: { userId }
        });

        if (instructor) {
          // Excluir aulas do instrutor
          await this.prisma.lesson.deleteMany({
            where: { instructorId: instructor.id }
          });

          // Excluir avaliações recebidas
          await this.prisma.review.deleteMany({
            where: { instructorId: instructor.id }
          });

          // Excluir instrutor
          await this.prisma.instructor.delete({
            where: { id: instructor.id }
          });
        }
      }

      if (user.role === 'STUDENT') {
        console.log('🗑️ [AUTH] Excluindo dados de aluno...');
        
        // Excluir aulas do aluno (usando diretamente o userId como studentId)
        await this.prisma.lesson.deleteMany({
          where: { studentId: userId }
        });

        // Excluir avaliações feitas pelo aluno
        await this.prisma.review.deleteMany({
          where: { studentId: userId }
        });
      }

      // Excluir tokens de reset de senha
      await this.prisma.passwordReset.deleteMany({
        where: { userId }
      });

      // Excluir requisições de exportação de dados
      await this.prisma.dataExportRequest.deleteMany({
        where: { userId }
      });

      // Excluir mensagens enviadas
      await this.prisma.message.deleteMany({
        where: { senderId: userId }
      });

      // Finalmente, excluir o usuário
      await this.prisma.user.delete({
        where: { id: userId }
      });

      console.log('✅ [AUTH] Conta excluída com sucesso:', userId);

      return {
        message: 'Conta excluída permanentemente',
        deletedAt: new Date()
      };
    } catch (error) {
      console.error('❌ [AUTH] Erro ao excluir conta:', error);
      throw new Error('Não foi possível excluir sua conta. Tente novamente ou entre em contato com o suporte.');
    }
  }
}
