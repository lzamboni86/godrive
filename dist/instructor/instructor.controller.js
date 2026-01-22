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
exports.InstructorController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const instructor_service_1 = require("./instructor.service");
const contact_form_dto_1 = require("../student/dto/contact-form.dto");
let InstructorController = class InstructorController {
    instructorService;
    constructor(instructorService) {
        this.instructorService = instructorService;
    }
    async getLessonRequests(instructorId) {
        return this.instructorService.getLessonRequests(instructorId);
    }
    async approveRequest(requestId) {
        return this.instructorService.approveRequest(requestId);
    }
    async rejectRequest(requestId) {
        return this.instructorService.rejectRequest(requestId);
    }
    async getPayments(instructorId) {
        return this.instructorService.getPayments(instructorId);
    }
    async getPaymentsSummary(instructorId) {
        return this.instructorService.getPaymentsSummary(instructorId);
    }
    async getProfile(userId) {
        return this.instructorService.getProfile(userId);
    }
    async getSchedule(instructorId) {
        return this.instructorService.getSchedule(instructorId);
    }
    async updateProfile(instructorId, data) {
        return this.instructorService.updateProfile(instructorId, data);
    }
    async sendContactForm(req, contactForm) {
        const enrichedContactForm = {
            ...contactForm,
            userId: req.user.sub || req.user.id,
            userType: 'INSTRUCTOR'
        };
        return this.instructorService.sendContactForm(enrichedContactForm);
    }
};
exports.InstructorController = InstructorController;
__decorate([
    (0, common_1.Get)(':id/requests'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getLessonRequests", null);
__decorate([
    (0, common_1.Patch)('requests/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "approveRequest", null);
__decorate([
    (0, common_1.Patch)('requests/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "rejectRequest", null);
__decorate([
    (0, common_1.Get)(':id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)(':id/payments/summary'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getPaymentsSummary", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id/schedule'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Patch)(':id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('contact'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, contact_form_dto_1.ContactForm]),
    __metadata("design:returntype", Promise)
], InstructorController.prototype, "sendContactForm", null);
exports.InstructorController = InstructorController = __decorate([
    (0, common_1.Controller)('instructor'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [instructor_service_1.InstructorService])
], InstructorController);
//# sourceMappingURL=instructor.controller.js.map