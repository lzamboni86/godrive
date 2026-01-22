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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_student_dto_1 = require("./dto/register-student.dto");
const register_instructor_dto_1 = require("./dto/register-instructor.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(dto) {
        return this.authService.login(dto);
    }
    async registerStudent(dto) {
        return this.authService.registerStudent(dto);
    }
    async registerInstructor(dto) {
        return this.authService.registerInstructor(dto);
    }
    async forgotPassword(body) {
        return this.authService.forgotPassword(body.email);
    }
    async resetPassword(body) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }
    async getInstructors() {
        console.log('🔍 [CONTROLLER] GET /admin/instructors');
        const result = await this.authService.getInstructors();
        console.log('🔍 [CONTROLLER] Result:', result);
        return result;
    }
    async getStudents() {
        console.log('🔍 [CONTROLLER] GET /admin/students');
        const result = await this.authService.getStudents();
        console.log('🔍 [CONTROLLER] Result:', result);
        return result;
    }
    async getDashboard() {
        console.log('🔍 [CONTROLLER] GET /admin/dashboard');
        const result = await this.authService.getDashboard();
        console.log('🔍 [CONTROLLER] Result:', result);
        return result;
    }
    async approveInstructor(id) {
        console.log('🔍 [CONTROLLER] POST /admin/instructors/', id, '/approve');
        const result = await this.authService.approveInstructor(id);
        console.log('🔍 [CONTROLLER] Approve result:', result);
        return result;
    }
    async rejectInstructor(id) {
        console.log('🔍 [CONTROLLER] POST /admin/instructors/', id, '/reject');
        const result = await this.authService.rejectInstructor(id);
        console.log('🔍 [CONTROLLER] Reject result:', result);
        return result;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register/student'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_student_dto_1.RegisterStudentDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerStudent", null);
__decorate([
    (0, common_1.Post)('register/instructor'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_instructor_dto_1.RegisterInstructorDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerInstructor", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('admin/instructors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getInstructors", null);
__decorate([
    (0, common_1.Get)('admin/students'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Get)('admin/dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Post)('admin/instructors/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "approveInstructor", null);
__decorate([
    (0, common_1.Post)('admin/instructors/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "rejectInstructor", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map