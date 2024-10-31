import { Test, TestingModule } from '@nestjs/testing';
import { DrizzleService } from '../src/services/drizzle.service';
import { Pool } from 'pg';
import { ErrorService } from '../src/services/error.service';
import { LoggerService } from '../src/services/logger.service';
describe('DrizzleService', () => {
    let drizzleService: DrizzleService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LoggerService, ErrorService, DrizzleService],
        }).compile();

        drizzleService = module.get<DrizzleService>(DrizzleService);
    });

    it('should be defined', () => {
        expect(drizzleService).toBeDefined();
    });

    it('should connect to the database', async () => {
        await drizzleService.connect();
        expect(drizzleService.pool).toBeDefined();
    });

    it('should clean up the pool on module destroy', async () => {
        const endSpy = jest.spyOn(Pool.prototype, 'end').mockImplementation(async () => { });
        await drizzleService.connect();
        await drizzleService.onModuleDestroy();
        expect(endSpy).toHaveBeenCalled();
    });
});