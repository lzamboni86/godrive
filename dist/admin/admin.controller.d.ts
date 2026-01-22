import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
        phone: string | null;
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
        monthRevenue: number;
    }>;
    getPayments(): Promise<{
        id: string;
        lessonId: string;
        instructorName: string;
        studentName: string;
        lessonDate: string;
        lessonTime: string;
        originalAmount: number;
        commissionFee: number;
        finalAmount: number;
        status: string;
        createdAt: string;
        rating: number;
        paymentId: string | undefined;
        mercadoPagoId: string | null | undefined;
    }[]>;
    approveInstructor(id: string): Promise<{
        message: string;
        instructorId: string;
    }>;
    rejectInstructor(id: string): Promise<{
        message: string;
        instructorId: string;
    }>;
    processPayment(id: string): Promise<{
        message: string;
        paymentId: string;
    }>;
    generateInvoice(id: string): Promise<{
        message: string;
        paymentId: string;
        receiptUrl: string;
    }>;
    getLogs(): Promise<any[]>;
}
