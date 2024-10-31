import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ErrorService } from '../services/error.service';
import { CatchError } from '../decorators/catchError.decorator';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {

    constructor(private readonly errorService: ErrorService) { }

    client: RedisClient;

    @CatchError('redis.service connect()')
    async connect(): Promise<void> { this.client = new Redis(process.env.REDIS_URL) }

    @CatchError('redis.service getClient()')
    async getClient(): Promise<Redis> { return this.client }

    async onModuleInit() { await this.connect() }

    async onModuleDestroy() { await this.client.quit() }
}
