import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WatchlistService {
    constructor(private prisma: PrismaService) { }

    async getUserWatchlist(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { watchlist: true }
        });
        return user?.watchlist || [];
    }

    async addToWatchlist(userId: string, symbol: string, type: string = 'CRYPTO', name: string = '') {
        // 1. Ensure Asset exists, if not create it (limited/simple version)
        // In a real app we might validate against external API first
        const assetType = type === 'Stocks' ? 'STOCK' : 'CRYPTO'; // specific enum map

        await this.prisma.asset.upsert({
            where: { symbol },
            update: {},
            create: {
                symbol,
                name: name || symbol,
                type: assetType as any // simplified casting for enum
            }
        });

        // 2. Connect to User
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                watchlist: {
                    connect: { symbol }
                }
            },
            include: { watchlist: true }
        });
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
