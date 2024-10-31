import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ErrorService } from '../services/error.service';
import { CatchError } from '../decorators/catchError.decorator';

@Injectable()
export class DrizzleService implements OnModuleDestroy, OnModuleInit {
    pool: Pool;
    options: object;
    public database: ReturnType<typeof drizzle>;
    constructor(private readonly errorService: ErrorService) {
        this.options = {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASS ,
            port: Number(process.env.DB_PORT) || 5432,
        }
    }

    @CatchError('drizzle.service connect()')
    async connect(): Promise<void> {
        this.pool = new Pool(this.options);
        this.database = drizzle(this.pool);
    }

    async onModuleInit() {
        await this.connect();
        await this.createTables();
    }

    async onModuleDestroy() {
        await this.pool.end();
    }
    private async createTables() {
        
        await this.database.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(15) NOT NULL,
                favorite_number INTEGER NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);
    }
}
