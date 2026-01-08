import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { AssetType } from '@prisma/client';

@Injectable()
export class AlertsService implements OnModuleInit {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('alerts') private alertsQueue: Queue,
    ) { }

    async onModuleInit() {
        // Clean old repeatable jobs
        const repeatableJobs = await this.alertsQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await this.alertsQueue.removeRepeatableByKey(job.key);
        }

        // Add new repeatable job (every 1 minute for MVP)
        await this.alertsQueue.add('check-alerts', {}, {
            repeat: {
                every: 60000,
            },
            removeOnComplete: true,
            removeOnFail: true,
        });
        console.log('Alerts Scheduler Initialized');
    }

    async create(userId: string, createAlertDto: CreateAlertDto) {
        // Ensure asset exists, or create it blindly to prevent FK error
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
                                name: symbol, // Fallback name
                                type: AssetType.CRYPTO // Fallback type
                            }
                        }
                    }
                },
            });
            console.log(`[AlertsService] Alert created successfully:`, alert.id);
            return alert;
        } catch (error) {
            console.error(`[AlertsService] Create Validation Error:`, error);
            throw error;
        }
    }

    async findAll(userId: string) {
        return this.prisma.alert.findMany({ where: { userId } });
    }

    async delete(userId: string, alertId: string) {
        return this.prisma.alert.deleteMany({ where: { id: alertId, userId } });
    }
}
