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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const finance_service_1 = require("./finance.service");
const update_payout_dto_1 = require("./dto/update-payout.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let FinanceController = class FinanceController {
    financeService;
    constructor(financeService) {
        this.financeService = financeService;
    }
    async getPendingPayouts() {
        return this.financeService.getPendingPayouts();
    }
    async getInstructorPendingPayouts(req) {
        return this.financeService.getInstructorPendingPayouts(req.user.id);
    }
    async getInstructorPaymentHistory(req) {
        return this.financeService.getInstructorPaymentHistory(req.user.id);
    }
    async getAllPaymentHistory() {
        return this.financeService.getAllPaymentHistory();
    }
    async getFinanceStats() {
        return this.financeService.getFinanceStats();
    }
    async markAsPaid(lessonId, updatePayoutDto) {
        return this.financeService.markAsPaid(lessonId, updatePayoutDto);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('pending'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getPendingPayouts", null);
__decorate([
    (0, common_1.Get)('pending/instructor'),
    (0, roles_decorator_1.Roles)('INSTRUCTOR'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getInstructorPendingPayouts", null);
__decorate([
    (0, common_1.Get)('history/instructor'),
    (0, roles_decorator_1.Roles)('INSTRUCTOR'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getInstructorPaymentHistory", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getAllPaymentHistory", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "getFinanceStats", null);
__decorate([
    (0, common_1.Post)(':lessonId/mark-paid'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('lessonId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payout_dto_1.UpdatePayoutDto]),
    __metadata("design:returntype", Promise)
], FinanceController.prototype, "markAsPaid", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)('finance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map