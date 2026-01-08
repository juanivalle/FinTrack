import { AlertCondition } from '@prisma/client';
export declare class CreateAlertDto {
    symbol: string;
    condition: AlertCondition;
    value: number;
}
