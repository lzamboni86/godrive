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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const release_payment_dto_1 = require("./dto/release-payment.dto");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async release(releasePaymentDto) {
        try {
            const result = await this.paymentsService.releasePayment(releasePaymentDto.lessonId);
            return { message: 'Pagamento liberado com sucesso.', data: result };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getReleasedBalance(instructorId) {
        try {
            const balance = await this.paymentsService.getInstructorReleasedBalance(instructorId);
            return { balance };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getPendingBalance(instructorId) {
        try {
            const balance = await this.paymentsService.getInstructorPendingBalance(instructorId);
            return { balance };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getInstructorPayments(instructorId) {
        try {
            const payments = await this.paymentsService.getInstructorPayments(instructorId);
            return payments;
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Patch)('release'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [release_payment_dto_1.ReleasePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "release", null);
__decorate([
    (0, common_1.Get)('instructor/:instructorId/released-balance'),
    __param(0, (0, common_1.Param)('instructorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getReleasedBalance", null);
__decorate([
    (0, common_1.Get)('instructor/:instructorId/pending-balance'),
    __param(0, (0, common_1.Param)('instructorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPendingBalance", null);
__decorate([
    (0, common_1.Get)('instructor/:instructorId'),
    __param(0, (0, common_1.Param)('instructorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getInstructorPayments", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map