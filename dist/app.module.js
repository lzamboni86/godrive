"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const payments_module_1 = require("./payments/payments.module");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const lessons_module_1 = require("./lessons/lessons.module");
const admin_module_1 = require("./admin/admin.module");
const student_module_1 = require("./student/student.module");
const payment_module_1 = require("./payment/payment.module");
const instructor_module_1 = require("./instructor/instructor.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const health_controller_1 = require("./health/health.controller");
const chat_module_1 = require("./chat/chat.module");
const review_module_1 = require("./reviews/review.module");
const finance_module_1 = require("./finance/finance.module");
const mail_module_1 = require("./mail/mail.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, payments_module_1.PaymentsModule, auth_module_1.AuthModule, lessons_module_1.LessonsModule, admin_module_1.AdminModule, student_module_1.StudentModule, payment_module_1.PaymentModule, instructor_module_1.InstructorModule, webhooks_module_1.WebhooksModule, chat_module_1.ChatModule, review_module_1.ReviewModule, finance_module_1.FinanceModule, mail_module_1.MailModule, users_module_1.UsersModule],
        controllers: [app_controller_1.AppController, health_controller_1.HealthController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map