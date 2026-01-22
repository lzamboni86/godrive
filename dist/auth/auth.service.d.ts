import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterInstructorDto } from './dto/register-instructor.dto';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private mailService;
    constructor(prisma: PrismaService, jwtService: JwtService, mailService: MailService);
    private isDeletedAccount;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.UserRole;
            createdAt: string;
            updatedAt: string;
        };
        accessToken: string;
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        email: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
    } | null>;
    registerStudent(dto: RegisterStudentDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: import("@prisma/client").$Enums.UserRole;
            createdAt: string;
            updatedAt: string;
        };
        accessToken: string;
    }>;
    registerInstructor(dto: RegisterInstructorDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: import("@prisma/client").$Enums.UserRole;
            createdAt: string;
            updatedAt: string;
        };
    }>;
    getInstructors(): Promise<{
        id: string;
        name: string;
        email: string;
        phone: null;
        status: string;
        vehicle: string;
        cnh: string;
        createdAt: string;
    }[]>;
    getStudents(): Promise<{
        id: string;
        name: string;
        email: string;
        phone: null;
        totalLessons: number;
        completedLessons: number;
        createdAt: string;
        status: string;
    }[]>;
    getDashboard(): Promise<{
        totalUsers: number;
        pendingInstructors: number;
        todayLessons: number;
        completedLessons: number;
        revenue: number;
    }>;
    approveInstructor(id: string): Promise<{
        message: string;
        instructorId: string;
    }>;
    rejectInstructor(id: string): Promise<{
        message: string;
        instructorId: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
