export declare enum ScheduleStatus {
    PENDING_PAYMENT = "PENDING_PAYMENT",
    WAITING_APPROVAL = "WAITING_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    REQUESTED = "REQUESTED"
}
export declare class ScheduleRequestDto {
    studentId: string;
    instructorId: string;
    lessons: {
        date: string;
        time: string;
        duration: number;
        price: number;
    }[];
    totalAmount: number;
    status: ScheduleStatus;
}
