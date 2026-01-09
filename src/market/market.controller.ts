import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Market')
@Controller('market')
export class MarketController {
    constructor(private marketService: MarketService) { }

    @Get('search')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Search assets via TradingView' })
    async searchAssets(@Query('q') query: string) {
        return this.marketService.searchAssets(query);
    }

    @Get('price/:symbol')
    @ApiOperation({ summary: 'Get current price of an asset' })
    async getPrice(@Param('symbol') symbol: string) {
        return this.marketService.getPrice(symbol);
    }
}
