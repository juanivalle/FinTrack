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
exports.AlertsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const market_service_1 = require("../market/market.service");
const client_1 = require("@prisma/client");
let AlertsProcessor = class AlertsProcessor extends bullmq_1.WorkerHost {
    prisma;
    marketService;
    constructor(prisma, marketService) {
        super();
        this.prisma = prisma;
        this.marketService = marketService;
    }
    async process(job) {
        if (job.name === 'check-alerts') {
            await this.checkAllAlerts();
        }
    }
    async checkAllAlerts() {
        const activeAlerts = await this.prisma.alert.findMany({ where: { isActive: true } });
        for (const alert of activeAlerts) {
            try {
                const priceData = await this.marketService.getPrice(alert.symbol);
                const currentPrice = priceData.price;
                let triggered = false;
                switch (alert.condition) {
                    case client_1.AlertCondition.PRICE_ABOVE:
                        if (currentPrice > alert.value)
                            triggered = true;
                        break;
                    case client_1.AlertCondition.PRICE_BELOW:
                        if (currentPrice < alert.value)
                            triggered = true;
                        break;
                }
                if (triggered) {
                    console.log(`ALERT TRIGGERED: ${alert.symbol} is ${currentPrice} (Condition: ${alert.condition} ${alert.value})`);
                    await this.prisma.notificationLog.create({
                        data: {
                            userId: alert.userId,
                            message: `Alert: ${alert.symbol} reached ${currentPrice}`,
                            channel: 'LOG',
                            status: 'SENT'
                        }
                    });
                }
            }
            catch (e) {
                console.error(`Error checking alert ${alert.id}:`, e);
            }
        }
    }
};
exports.AlertsProcessor = AlertsProcessor;
exports.AlertsProcessor = AlertsProcessor = __decorate([
    (0, bullmq_1.Processor)('alerts'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        market_service_1.MarketService])
], AlertsProcessor);
//# sourceMappingURL=alerts.processor.js.map