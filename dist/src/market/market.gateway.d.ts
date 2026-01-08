import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MarketService } from './market.service';
export declare class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    private marketService;
    server: Server;
    private intervals;
    private activeAssets;
    constructor(marketService: MarketService);
    onModuleInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(symbol: string, client: Socket): Promise<void>;
    handleUnsubscribe(symbol: string, client: Socket): void;
    private broadcastUpdates;
}
