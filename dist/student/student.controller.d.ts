import { StudentService } from './student.service';
import { ContactForm } from './dto/contact-form.dto';
import { ScheduleRequestDto } from './dto/schedule-request.dto';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    getApprovedInstructors(state?: string, city?: string, neighborhoodTeach?: string, gender?: string, transmission?: string, engineType?: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        status: import("@prisma/client").$Enums.InstructorStatus;
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            instructorId: string;
            type: import("@prisma/client").$Enums.VehicleType;
            make: string | null;
            model: string | null;
            year: number | null;
            plate: string | null;
            transmission: import("@prisma/client").$Enums.Transmission;
            engineType: import("@prisma/client").$Enums.EngineType;
        } | null;
        cnh: string | null;
        hourlyRate: number;
        state: string | null | undefined;
        city: string | null | undefined;
        neighborhoodReside: string | null | undefined;
        neighborhoodTeach: string | null | undefined;
        gender: import("@prisma/client").$Enums.Gender | undefined;
        completedLessonsCount: number | undefined;
        rating: number | null | undefined;
        bio: string | null | undefined;
        createdAt: string;
    }[]>;
    getStudentLessons(req: any, studentId: string): Promise<{
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
    getUpcomingLessons(req: any, studentId: string): Promise<{
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
    getPastLessons(req: any, studentId: string): Promise<{
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
    getStudentPayments(req: any, studentId: string): Promise<{
        id: string;
        studentId: string;
        lessonId: string;
        amount: number;
        status: string;
        paymentDate: string | null;
        description: string;
        createdAt: string;
    }[]>;
    getPaymentSummary(req: any, studentId: string): Promise<{
        totalPaid: number;
        totalLessons: number;
        pendingPayments: number;
    }>;
    sendContactForm(req: any, contactForm: ContactForm): Promise<{
        message: string;
        emailSent: boolean;
    }>;
    createScheduleRequest(scheduleRequest: ScheduleRequestDto): Promise<{
        id: string;
        lessonIds: string[];
        preferenceId: string | undefined;
        initPoint: string | undefined;
        sandboxInitPoint: string | undefined;
        isSandbox: any;
        message: string;
    }>;
    updateProfile(req: any, updateData: {
        name: string;
        email: string;
        phone?: string;
    }): Promise<{
        message: string;
        user: {
            id: string;
            name: string | null;
            email: string;
            phone: string | null;
        };
    }>;
}
