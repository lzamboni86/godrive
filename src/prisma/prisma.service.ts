import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Mantemos o Prisma como uma propriedade privada
  private readonly _prisma: PrismaClient;

  constructor() {
    this._prisma = new PrismaClient();
  }

  // Getters para que os serviços (como o PaymentsService) funcionem sem mudar o código
  get payment() { return this._prisma.payment; }
  get lesson() { return this._prisma.lesson; }
  get user() { return this._prisma.user; }
  get instructor() { return this._prisma.instructor; }
  get vehicle() { return this._prisma.vehicle; }
  get $executeRaw() { return this._prisma.$executeRaw.bind(this._prisma); }

  async onModuleInit() {
    await this._prisma.$connect();
  }

  async onModuleDestroy() {
    await this._prisma.$disconnect();
  }
}