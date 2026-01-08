import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
import { AlertCondition } from '@prisma/client';

@Processor('alerts')
export class AlertsProcessor extends WorkerHost {
    constructor(
        private prisma: PrismaService,
        private marketService: MarketService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        if (job.name === 'check-alerts') {
            await this.checkAllAlerts();
        }
    }

    private async checkAllAlerts() {
        // In a real app, this should be paginated or sharded by symbol to avoid massive loop
        const activeAlerts = await this.prisma.alert.findMany({ where: { isActive: true } });

        for (const alert of activeAlerts) {
            try {
                const priceData = await this.marketService.getPrice(alert.symbol);
                const currentPrice = priceData.price;

                let triggered = false;
                switch (alert.condition) {
                    case AlertCondition.PRICE_ABOVE:
                        if (currentPrice > alert.value) triggered = true;
                        break;
                    case AlertCondition.PRICE_BELOW:
                        if (currentPrice < alert.value) triggered = true;
                        break;
                    // Other conditions (SMA) would need historic data
                }

                if (triggered) {
                    console.log(`ALERT TRIGGERED: ${alert.symbol} is ${currentPrice} (Condition: ${alert.condition} ${alert.value})`);
                    // Create Notification Log
                    await this.prisma.notificationLog.create({
                        data: {
                            userId: alert.userId,
                            message: `Alert: ${alert.symbol} reached ${currentPrice}`,
                            channel: 'LOG', // or EMAIL/WHATSAPP if implemented
                            status: 'SENT'
                        }
                    });

                    // Deactivate if one-time (optional) or keep active
                    // await this.prisma.alert.update({ where: { id: alert.id }, data: { isActive: false } });
                }
            } catch (e) {
                console.error(`Error checking alert ${alert.id}:`, e);
            }
        }
    }
}
