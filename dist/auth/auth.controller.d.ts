import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { RegisterInstructorDto } from './dto/register-instructor.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<{
        message: string;
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
}
