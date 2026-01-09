import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetType } from '@prisma/client';

@Injectable()
export class WatchlistService {
    private readonly logger = new Logger(WatchlistService.name);

    constructor(private prisma: PrismaService) { }

    async getUserWatchlist(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { watchlist: true }
        });
        return user?.watchlist || [];
    }

    async addToWatchlist(userId: string, symbol: string, type: string = 'CRYPTO', name: string = '') {
        // Map to Prisma Enum safely
        let assetType: AssetType = AssetType.CRYPTO;
        if (type.toUpperCase() === 'STOCKS' || type.toUpperCase() === 'STOCK') {
            assetType = AssetType.STOCK;
        }

        this.logger.log(`Adding to watchlist: ${symbol} (${assetType}) for user ${userId}`);

        try {
            // 1. Upsert Asset
            await this.prisma.asset.upsert({
                where: { symbol },
                update: {},
                create: {
                    symbol,
                    name: name || symbol,
                    type: assetType
                }
            });

            // 2. Connect
            return await this.prisma.user.update({
                where: { id: userId },
                data: {
                    watchlist: {
                        connect: { symbol }
                    }
                },
                include: { watchlist: true }
            });
        } catch (e) {
            this.logger.error(`Failed to add to watchlist: ${e.message}`, e.stack);
            throw new BadRequestException(`Could not add asset: ${e.message}`);
        }
    }



    async removeFromWatchlist(userId: string, symbol: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                watchlist: {
                    disconnect: { symbol }
                }
            },
            include: { watchlist: true }
        });
    }
}
