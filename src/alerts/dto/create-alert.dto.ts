import { IsString, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AlertCondition } from '@prisma/client';

export class CreateAlertDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    symbol: string;

    @ApiProperty({ enum: AlertCondition })
    @IsEnum(AlertCondition)
    condition: AlertCondition;

    @ApiProperty()
    @IsNumber()
    value: number;
}
