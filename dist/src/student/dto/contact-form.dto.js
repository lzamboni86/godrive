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
exports.ContactForm = exports.ContactPreference = void 0;
const class_validator_1 = require("class-validator");
var ContactPreference;
(function (ContactPreference) {
    ContactPreference["WHATSAPP"] = "whatsapp";
    ContactPreference["EMAIL"] = "email";
})(ContactPreference || (exports.ContactPreference = ContactPreference = {}));
class ContactForm {
    name;
    email;
    message;
    contactPreference;
}
exports.ContactForm = ContactForm;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactForm.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ContactForm.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactForm.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ContactPreference),
    __metadata("design:type", String)
], ContactForm.prototype, "contactPreference", void 0);
//# sourceMappingURL=contact-form.dto.js.map