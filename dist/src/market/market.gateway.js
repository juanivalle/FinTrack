"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const market_service_1 = require("./market.service");
let MarketGateway = class MarketGateway {
    marketService;
    server;
    intervals = new Map();
    activeAssets = new Set();
    constructor(marketService) {
        this.marketService = marketService;
    }
    onModuleInit() {
        setInterval(() => {
            this.broadcastUpdates();
        }, 1000);
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    async handleSubscribe(symbol, client) {
        client.join(symbol);
        this.activeAssets.add(symbol);
        console.log(`Client ${client.id} subscribed to ${symbol}`);
        const price = await this.marketService.getPrice(symbol);
        client.emit('priceUpdate', { symbol, price: price.price });
    }
    handleUnsubscribe(symbol, client) {
        client.leave(symbol);
        console.log(`Client ${client.id} unsubscribed from ${symbol}`);
    }
    async broadcastUpdates() {
        if (this.activeAssets.size === 0)
            return;
        for (const symbol of this.activeAssets) {
            const priceData = await this.marketService.getPrice(symbol);
            const pData = priceData;
            const change24h = pData.change24h || "0.00";
            this.server.to(symbol).emit('priceUpdate', {
                symbol,
                price: priceData.price,
                change24h: change24h,
                timestamp: new Date().toISOString()
            });
        }
    }
};
exports.MarketGateway = MarketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MarketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribeToAsset'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], MarketGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribeFromAsset'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], MarketGateway.prototype, "handleUnsubscribe", null);
exports.MarketGateway = MarketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [market_service_1.MarketService])
], MarketGateway);
//# sourceMappingURL=market.gateway.js.map