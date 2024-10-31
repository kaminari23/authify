import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ErrorService } from '../services/error.service';
import { CatchError } from '../decorators/catchError.decorator';
@Injectable()
export class JwtService {
    private readonly secret: string;

    constructor(private readonly errorService: ErrorService) {
        this.secret = process.env.JWT_SECRET;
    }

    @CatchError('jwt.service createToken()')
    async createToken(payload: any, expiresIn: string | number = '15m'): Promise<string> {
        return await jwt.sign(payload, this.secret, { expiresIn, algorithm: 'HS256' });
    }

    @CatchError('jwt.service verifyToken()')
    async verifyToken(token: string): Promise<boolean> { return await jwt.verify(token, this.secret) }

    @CatchError('jwt.service decodeToken()')
    async decodeToken(token: string): Promise<number | void> {
        const decoded = await jwt.decode(token);
        return decoded && typeof decoded === 'object' ? (decoded['id'] || null) : null;
    }
}
