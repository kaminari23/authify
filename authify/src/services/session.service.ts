import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { JwtService } from './jwt.service';
import { ErrorService } from '../services/error.service';
import { CatchError } from '../decorators/catchError.decorator';

@Injectable()
export class SessionService {
    constructor(
        private readonly redis: RedisService,
        private readonly jwt: JwtService,
        private readonly errorService: ErrorService,
    ) { }

    @CatchError('session.service createSession()')
    async createSession(id: number): Promise<string> {
        const token = await this.jwt.createToken({ id });
        let value = await this.redis.client.exists(token) ? await this.redis.client.get(token) : null;
        await this.redis.client.set(token, value, 'EX', 900);
        return token;
    }

    @CatchError('session.service verifySession()')
    async verifySession(token: string): Promise<boolean> {
        // if redis not contains token, this session is not actual, so there is no need to verify token
        if (!await this.redis.client.exists(token)) { return false }
        return await this.jwt.verifyToken(token);
    }
    
    // for future logout or blacklist feature
    @CatchError('session.service deleteSession')
    async deleteSession(token: string): Promise<void> {
        if (!await this.redis.client.exists(token)) { return null }
        await this.redis.client.expire(token, 0);
    }

}
