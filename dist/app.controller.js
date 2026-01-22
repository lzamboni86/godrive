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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
    scheduleSuccess(query, res) {
        return this.renderScheduleReturnPage('success', query, res);
    }
    schedulePending(query, res) {
        return this.renderScheduleReturnPage('pending', query, res);
    }
    scheduleFailure(query, res) {
        return this.renderScheduleReturnPage('failure', query, res);
    }
    renderScheduleReturnPage(status, query, res) {
        const params = new URLSearchParams();
        if (query?.external_reference)
            params.set('external_reference', String(query.external_reference));
        if (query?.payment_id)
            params.set('payment_id', String(query.payment_id));
        if (query?.collection_id)
            params.set('collection_id', String(query.collection_id));
        if (query?.merchant_order_id)
            params.set('merchant_order_id', String(query.merchant_order_id));
        if (query?.preference_id)
            params.set('preference_id', String(query.preference_id));
        if (query?.collection_status)
            params.set('collection_status', String(query.collection_status));
        const deepLink = `godrive://schedule/${status}?${params.toString()}`;
        res.status(200);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>GoDrive</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; padding: 24px;">
    <h2>Voltando para o app...</h2>
    <p>Se não abrir automaticamente, toque no botão abaixo.</p>
    <p><a href="${deepLink}" style="display:inline-block;padding:12px 16px;background:#10B981;color:#fff;border-radius:10px;text-decoration:none;">Abrir GoDrive</a></p>
    <script>
      window.location.href = ${JSON.stringify(deepLink)};
    </script>
  </body>
</html>`);
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('schedule/success'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "scheduleSuccess", null);
__decorate([
    (0, common_1.Get)('schedule/pending'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "schedulePending", null);
__decorate([
    (0, common_1.Get)('schedule/failure'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AppController.prototype, "scheduleFailure", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService])
], AppController);
//# sourceMappingURL=app.controller.js.map