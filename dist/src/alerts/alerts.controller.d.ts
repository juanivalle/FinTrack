import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
export declare class AlertsController {
    private alertsService;
    constructor(alertsService: AlertsService);
    create(req: any, createAlertDto: CreateAlertDto): Promise<{
        symbol: string;
        id: string;
        createdAt: Date;
        condition: import("@prisma/client").$Enums.AlertCondition;
        value: number;
        isActive: boolean;
        lastTriggeredAt: Date | null;
        userId: string;
    }>;
    findAll(req: any): Promise<{
        symbol: string;
        id: string;
        createdAt: Date;
        condition: import("@prisma/client").$Enums.AlertCondition;
        value: number;
        isActive: boolean;
        lastTriggeredAt: Date | null;
        userId: string;
    }[]>;
    delete(req: any, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
