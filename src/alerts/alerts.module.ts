import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertsProcessor } from './alerts.processor';
import { MarketModule } from '../market/market.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'alerts',
        }),
        MarketModule
    ],
    providers: [AlertsService, AlertsProcessor],
    controllers: [AlertsController],
})
export class AlertsModule { }
