import { Module } from '@nestjs/common';

import { DrizzleService } from './services/drizzle.service';
import { RedisService } from './services/redis.service';
import { ErrorService } from './services/error.service';
import { LoggerService } from './services/logger.service';
import { SessionService } from './services/session.service';
import { JwtService } from './services/jwt.service';
import { UserService } from './services/user.service';
import { BcryptService } from './services/bcrypt.service';

import { UserController } from './controllers/user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [DrizzleService, RedisService, ErrorService, LoggerService, SessionService, JwtService, UserService, BcryptService],
})
export class AppModule { }
