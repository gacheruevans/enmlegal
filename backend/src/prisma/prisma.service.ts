import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private pool?: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;

      let dbInfo = 'Neon PostgreSQL';
      if (process.env.DATABASE_URL) {
        try {
          const parsed = new URL(process.env.DATABASE_URL);
          dbInfo = `${parsed.pathname.replace('/', '')} on ${parsed.hostname}`;
        } catch {
          // Safe fallback
        }
      }

      this.logger.log(`✅ Database connection established successfully: ${dbInfo}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to connect to the database: ${error?.message || error}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (this.pool) {
      await this.pool.end();
    }
    this.logger.log('Database disconnected successfully.');
  }
}


