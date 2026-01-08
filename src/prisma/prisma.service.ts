import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');
    console.log(`[PrismaService] DATABASE_URL is ${connectionString ? 'defined' : 'undefined'}`);
    if (connectionString) {
      console.log(`[PrismaService] Connecting to: ${connectionString.split('@')[1] || 'URL format error'}`);
    } else {
      console.error('[PrismaService] DATABASE_URL IS MISSING! Defaulting to localhost?');
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
