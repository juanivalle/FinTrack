import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { Queue } from 'bullmq';
export declare class AlertsService implements OnModuleInit {
    private prisma;
    private alertsQueue;
    constructor(prisma: PrismaService, alertsQueue: Queue);
    onModuleInit(): Promise<void>;
    create(userId: string, createAlertDto: CreateAlertDto): Promise<{
        symbol: string;
        id: string;
        createdAt: Date;
        condition: import("@prisma/client").$Enums.AlertCondition;
        value: number;
        isActive: boolean;
        lastTriggeredAt: Date | null;
        userId: string;
    }>;
    findAll(userId: string): Promise<{
        symbol: string;
        id: string;
        createdAt: Date;
        condition: import("@prisma/client").$Enums.AlertCondition;
        value: number;
        isActive: boolean;
        lastTriggeredAt: Date | null;
        userId: string;
    }[]>;
    delete(userId: string, alertId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
