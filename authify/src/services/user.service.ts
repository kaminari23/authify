import { Injectable } from '@nestjs/common';
import { SessionService } from './session.service';
import { DrizzleService } from './drizzle.service';
import { BcryptService } from './bcrypt.service';
import { users } from '../models/user.model';
import { eq } from 'drizzle-orm';
import { UserPublicInfo } from '../dto/user-public-info';
import { RedisService } from './redis.service';
import { JwtService } from './jwt.service';
import { ErrorService } from '../services/error.service';
import { CatchError } from '../decorators/catchError.decorator';
@Injectable()
export class UserService {
    constructor(
        private readonly session: SessionService,
        private readonly drizzle: DrizzleService,
        private readonly bcrypt: BcryptService,
        private readonly redis: RedisService,
        private readonly jwt: JwtService,
        private readonly errorService: ErrorService,
    ) { }

    async formatPhone(phone: string): Promise<string> {

        const startSymbols = {
            '+': () => { },
            '3': () => phone = '+' + phone,
            '8': () => phone = '+3' + phone,
            '0': () => phone = '+38' + phone,
        }
        if (startSymbols[phone[0]]) { startSymbols[phone[0]]() }
        else { phone = '+380' + phone }

        return phone;
    }

    @CatchError('user.service signUp()')
    async signUp(name: string, phone: string, favorite_number: number, password: string): Promise<boolean> {

        if (!name || !phone || !favorite_number || !password) { return false }

        const exist = await this.drizzle.database.select({ id: users.id }).from(users).where(eq(users.phone, phone)).execute();
        if (exist || exist[0].hasOwnProperty('id')) { throw new Error(`Auth error: Phone already registered`) }
        
        phone = await this.formatPhone(phone);

        const hashedPassword = await this.bcrypt.generateHash(password);
        
        let result = await this.drizzle.database.insert(users).values({ name, phone, favorite_number, password: hashedPassword }).execute();;
        
      
        return result.hasOwnProperty('rowCount');
    }

    @CatchError('user.service signIn()')
    async signIn(phone: string, password: string): Promise<string | null> {
        phone = await this.formatPhone(phone);
        const result = await this.drizzle.database.select({ id: users.id }).from(users).where(eq(users.phone, phone)).execute();
        if (!result || !result[0].hasOwnProperty('id')) { throw new Error(`Auth error: No such user`) }

        const id = result[0].id;

        const passwordQuery = await this.drizzle.database.select({ password: users.password }).from(users).where(eq(users.id, id)).execute();

        const hashedPassword = passwordQuery[0].password;

        const authResult = await this.bcrypt.compareHash(password, hashedPassword);

        if (!authResult) { throw new Error(`Auth error: Incorrect password`) }

        return await this.session.createSession(id);
    }

    @CatchError('user.service getUserData()')
    async getUserData(token: string): Promise<UserPublicInfo | null> {
        if (!await this.session.verifySession(token)) return null;

        const userId = await this.jwt.decodeToken(token);

        if (!userId) return null
        const cachedUserData = await this.redis.client.get(String(userId));

        if (cachedUserData) {
            let cached_obj = await JSON.parse(cachedUserData);
            return { name: cached_obj.name, phone: cached_obj.phone, favorite_number: cached_obj.favorite_number };

        } else {
            const dbUserData = await this.drizzle.database.select().from(users).where(eq(users.id, userId)).execute();
            const dbUserPublicData = { name: dbUserData[0].name, phone: dbUserData[0].phone, favorite_number: dbUserData[0].favorite_number };
            await this.redis.client.set(String(userId), JSON.stringify(dbUserPublicData));
            return dbUserPublicData;
        }
    }

}
