import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ErrorService } from '../services/error.service';
@Injectable()
export class BcryptService {
    private readonly saltRounds = 10;

    constructor(private readonly errorService: ErrorService) { }

    async generateHash(password: string): Promise<string | null> {
        if (password.length === 0) { return null }
        return await bcrypt.hash(password, this.saltRounds);
    }

    async compareHash(password: string, hashed: string): Promise<boolean> {
        if (password.length === 0 || hashed.length === 0) { return false }
        return await bcrypt.compare(password, hashed);
    }
}
