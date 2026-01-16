import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private readonly _prisma;
    constructor();
    get payment(): import("@prisma/client").Prisma.PaymentDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get lesson(): import("@prisma/client").Prisma.LessonDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get user(): import("@prisma/client").Prisma.UserDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get instructor(): import("@prisma/client").Prisma.InstructorDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get vehicle(): import("@prisma/client").Prisma.VehicleDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get $executeRaw(): any;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
