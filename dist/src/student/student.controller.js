"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const student_service_1 = require("./student.service");
const contact_form_dto_1 = require("./dto/contact-form.dto");
const schedule_request_dto_1 = require("./dto/schedule-request.dto");
let StudentController = class StudentController {
    studentService;
    constructor(studentService) {
        this.studentService = studentService;
    }
    async getApprovedInstructors(state, city, neighborhoodTeach, gender, transmission, engineType) {
        return this.studentService.getApprovedInstructors({
            state,
            city,
            neighborhoodTeach,
            gender: gender,
            transmission: transmission,
            engineType: engineType,
        });
    }
    async getStudentLessons(studentId) {
        return this.studentService.getStudentLessons(studentId);
    }
    async getUpcomingLessons(studentId) {
        return this.studentService.getUpcomingLessons(studentId);
    }
    async getPastLessons(studentId) {
        return this.studentService.getPastLessons(studentId);
    }
    async getStudentPayments(studentId) {
        return this.studentService.getStudentPayments(studentId);
    }
    async getPaymentSummary(studentId) {
        return this.studentService.getPaymentSummary(studentId);
    }
    async sendContactForm(contactForm) {
        return this.studentService.sendContactForm(contactForm);
    }
    async createScheduleRequest(scheduleRequest) {
        return this.studentService.createScheduleRequest(scheduleRequest);
    }
};
exports.StudentController = StudentController;
__decorate([
    (0, common_1.Get)('instructors/approved'),
    __param(0, (0, common_1.Query)('state')),
    __param(1, (0, common_1.Query)('city')),
    __param(2, (0, common_1.Query)('neighborhoodTeach')),
    __param(3, (0, common_1.Query)('gender')),
    __param(4, (0, common_1.Query)('transmission')),
    __param(5, (0, common_1.Query)('engineType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getApprovedInstructors", null);
__decorate([
    (0, common_1.Get)('lessons/student/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentLessons", null);
__decorate([
    (0, common_1.Get)('lessons/student/:id/upcoming'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getUpcomingLessons", null);
__decorate([
    (0, common_1.Get)('lessons/student/:id/past'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getPastLessons", null);
__decorate([
    (0, common_1.Get)('payments/student/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getStudentPayments", null);
__decorate([
    (0, common_1.Get)('payments/student/:id/summary'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getPaymentSummary", null);
__decorate([
    (0, common_1.Post)('contact'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_form_dto_1.ContactForm]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "sendContactForm", null);
__decorate([
    (0, common_1.Post)('schedule'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schedule_request_dto_1.ScheduleRequestDto]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "createScheduleRequest", null);
exports.StudentController = StudentController = __decorate([
    (0, common_1.Controller)('student'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [student_service_1.StudentService])
], StudentController);
//# sourceMappingURL=student.controller.js.map