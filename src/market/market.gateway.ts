import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MarketService } from './market.service';

@WebSocketGateway({ cors: true })
export class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    server: Server;

    private intervals: Map<string, NodeJS.Timeout> = new Map();
    private activeAssets: Set<string> = new Set();

    constructor(private marketService: MarketService) { }

    onModuleInit() {
        // Start a global ticker for demo purposes
        setInterval(() => {
            this.broadcastUpdates();
        }, 60000); // 60 second interval (User requested for performance)
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        // Remove from active tracking? In this simple demo, we keep the asset active if anyone subscribed recently
        // Ideally we check if room is empty
    }

    @SubscribeMessage('subscribeToAsset')
    async handleSubscribe(@MessageBody() symbol: string, @ConnectedSocket() client: Socket) {
        client.join(symbol);
        this.activeAssets.add(symbol);
        console.log(`Client ${client.id} subscribed to ${symbol}`);

        // Send immediate update
        const price = await this.marketService.getPrice(symbol);
        client.emit('priceUpdate', { symbol, price: price.price });
    }

    @SubscribeMessage('unsubscribeFromAsset')
    handleUnsubscribe(@MessageBody() symbol: string, @ConnectedSocket() client: Socket) {
        client.leave(symbol);
        console.log(`Client ${client.id} unsubscribed from ${symbol}`);
    }

    // Simulate price updates for active assets
    private async broadcastUpdates() {
        if (this.activeAssets.size === 0) return;

        for (const symbol of this.activeAssets) {
            // In a real app, this would come from an external source or aggregation service
            const priceData = await this.marketService.getPrice(symbol);

            // Use real data from provider
            // The provider handles caching, so getPrice return is decently fresh

            // Allow casting to any to access change24h if interface hasn't propagated in TS check yet
            const pData = priceData as any;
            const change24h = pData.change24h || "0.00";

            this.server.to(symbol).emit('priceUpdate', {
                symbol,
                price: priceData.price,
                change24h: change24h,
                timestamp: new Date().toISOString()
            });
        }
    }
}
