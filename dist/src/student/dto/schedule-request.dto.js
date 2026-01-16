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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleRequestDto = exports.ScheduleStatus = void 0;
const class_validator_1 = require("class-validator");
var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    ScheduleStatus["WAITING_APPROVAL"] = "WAITING_APPROVAL";
    ScheduleStatus["APPROVED"] = "APPROVED";
    ScheduleStatus["REJECTED"] = "REJECTED";
    ScheduleStatus["CANCELLED"] = "CANCELLED";
    ScheduleStatus["REQUESTED"] = "REQUESTED";
})(ScheduleStatus || (exports.ScheduleStatus = ScheduleStatus = {}));
class ScheduleRequestDto {
    studentId;
    instructorId;
    lessons;
    totalAmount;
    status;
}
exports.ScheduleRequestDto = ScheduleRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleRequestDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScheduleRequestDto.prototype, "instructorId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ScheduleRequestDto.prototype, "lessons", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ScheduleRequestDto.prototype, "totalAmount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ScheduleStatus),
    __metadata("design:type", String)
], ScheduleRequestDto.prototype, "status", void 0);
//# sourceMappingURL=schedule-request.dto.js.map