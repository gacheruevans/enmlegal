import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { resolve } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
    const filePath = rawUrl.replace(/^file:/, '').replace(/["']/g, '').trim();
    let dbPath = resolve(process.cwd(), 'backend', filePath);
    if (!existsSync(dbPath)) {
      dbPath = resolve(process.cwd(), filePath);
    }
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}


