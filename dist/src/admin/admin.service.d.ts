import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getInstructors(): Promise<{
        id: string;
        name: string;
        email: string;
        phone: null;
        status: any;
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
