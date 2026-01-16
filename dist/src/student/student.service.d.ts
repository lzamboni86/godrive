import { PrismaService } from '../prisma/prisma.service';
import { ContactForm } from './dto/contact-form.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
import { MercadoPagoService } from '../payments/mercado-pago.service';
export declare class StudentService {
    private prisma;
    private mercadoPagoService;
    constructor(prisma: PrismaService, mercadoPagoService: MercadoPagoService);
    getApprovedInstructors(): Promise<{
        id: string;
        name: string;
        email: string;
        phone: null;
        status: import("@prisma/client").$Enums.InstructorStatus;
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            instructorId: string;
        } | null;
        cnh: string | null;
        hourlyRate: number;
        createdAt: string;
    }[]>;
    getStudentLessons(studentId: string): Promise<{
        id: string;
        instructorId: string;
        studentId: string;
        date: string;
        time: string;
        duration: number;
        status: import("@prisma/client").$Enums.LessonStatus;
        price: number;
        location: string;
        instructor: {
            name: string;
            email: string;
        } | null;
    }[]>;
    getUpcomingLessons(studentId: string): Promise<{
        id: string;
        instructorId: string;
        studentId: string;
        date: string;
        time: string;
        duration: number;
        status: import("@prisma/client").$Enums.LessonStatus;
        price: number;
        location: string;
        instructor: {
            name: string;
            email: string;
        } | null;
    }[]>;
    getPastLessons(studentId: string): Promise<{
        id: string;
        instructorId: string;
        studentId: string;
        date: string;
        time: string;
        duration: number;
        status: import("@prisma/client").$Enums.LessonStatus;
        price: number;
        location: string;
        instructor: {
            name: string;
            email: string;
        } | null;
    }[]>;
    getStudentPayments(studentId: string): Promise<{
        id: string;
        studentId: string;
        lessonId: string;
        amount: number;
        status: string;
        paymentDate: string | null;
        description: string;
        createdAt: string;
    }[]>;
    getPaymentSummary(studentId: string): Promise<{
        totalPaid: number;
        totalLessons: number;
        pendingPayments: number;
    }>;
    sendContactForm(contactForm: ContactForm): Promise<{
        message: string;
    }>;
    createScheduleRequest(scheduleRequest: ScheduleRequestDto): Promise<{
        id: string;
        preferenceId: string | undefined;
        initPoint: string | undefined;
        sandboxInitPoint: string | undefined;
        message: string;
    } | {
        id: string;
        preferenceId: string;
        message: string;
        initPoint?: undefined;
        sandboxInitPoint?: undefined;
    }>;
}
