import { Controller, Post, Body, Get, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
    constructor(private alertsService: AlertsService) { }

    @Post()
    create(@Request() req: any, @Body() createAlertDto: CreateAlertDto) {
        return this.alertsService.create(req.user.userId, createAlertDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.alertsService.findAll(req.user.userId);
    }

    @Delete(':id')
    delete(@Request() req: any, @Param('id') id: string) {
        return this.alertsService.delete(req.user.userId, id);
    }
}
