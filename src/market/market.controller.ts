import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Market')
@Controller('market')
export class MarketController {
    constructor(private marketService: MarketService) { }

    @Get('price/:symbol')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current price of an asset' })
    async getPrice(@Param('symbol') symbol: string) {
        return this.marketService.getPrice(symbol);
    }
}
