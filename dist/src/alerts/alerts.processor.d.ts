import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
export declare class AlertsProcessor extends WorkerHost {
    private prisma;
    private marketService;
    constructor(prisma: PrismaService, marketService: MarketService);
    process(job: Job<any, any, string>): Promise<any>;
    private checkAllAlerts;
}
