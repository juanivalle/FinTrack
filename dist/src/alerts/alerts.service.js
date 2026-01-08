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
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@nestjs/bullmq");
const client_1 = require("@prisma/client");
let AlertsService = class AlertsService {
    prisma;
    alertsQueue;
    constructor(prisma, alertsQueue) {
        this.prisma = prisma;
        this.alertsQueue = alertsQueue;
    }
    async onModuleInit() {
        const repeatableJobs = await this.alertsQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await this.alertsQueue.removeRepeatableByKey(job.key);
        }
        await this.alertsQueue.add('check-alerts', {}, {
            repeat: {
                every: 60000,
            },
            removeOnComplete: true,
            removeOnFail: true,
        });
        console.log('Alerts Scheduler Initialized');
    }
    async create(userId, createAlertDto) {
        const { symbol, condition, value } = createAlertDto;
        console.log(`[AlertsService] Creating alert for user ${userId}:`, createAlertDto);
        try {
            const alert = await this.prisma.alert.create({
                data: {
                    condition,
                    value,
                    user: {
                        connect: { id: userId }
                    },
                    asset: {
                        connectOrCreate: {
                            where: { symbol },
                            create: {
                                symbol,
                                name: symbol,
                                type: client_1.AssetType.CRYPTO
                            }
                        }
                    }
                },
            });
            console.log(`[AlertsService] Alert created successfully:`, alert.id);
            return alert;
        }
        catch (error) {
            console.error(`[AlertsService] Create Validation Error:`, error);
            throw error;
        }
    }
    async findAll(userId) {
        return this.prisma.alert.findMany({ where: { userId } });
    }
    async delete(userId, alertId) {
        return this.prisma.alert.deleteMany({ where: { id: alertId, userId } });
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_2.InjectQueue)('alerts')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_1.Queue])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map