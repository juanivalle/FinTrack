import { Controller, Get, Post, Delete, Param, UseGuards, Request, Body } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
    constructor(private readonly watchlistService: WatchlistService) { }

    @Get()
    async getWatchlist(@Request() req: any) {
        return this.watchlistService.getUserWatchlist(req.user.userId);
    }

    @Post(':symbol')
    async addToWatchlist(@Request() req: any, @Param('symbol') symbol: string, @Body() body: { type: string, name: string }) {
        // Body is optional, but helps if asset doesn't exist to create it
        return this.watchlistService.addToWatchlist(req.user.userId, symbol, body.type, body.name);
    }

    @Delete(':symbol')
    async removeFromWatchlist(@Request() req: any, @Param('symbol') symbol: string) {
        return this.watchlistService.removeFromWatchlist(req.user.userId, symbol);
    }
}
