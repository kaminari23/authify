import { Test, TestingModule } from '@nestjs/testing';
import { ErrorService } from '../src/services/error.service';
import { LoggerService } from '../src/services/logger.service';

describe('ErrorService', () => {
    let errorService: ErrorService;
    let loggerService: LoggerService;

    beforeEach(async () => {
        loggerService = { writeLog: jest.fn() } as any; 
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoggerService,
                ErrorService,
                { provide: LoggerService, useValue: loggerService },
            ],
        }).compile();

        errorService = module.get<ErrorService>(ErrorService);
    });

    it('should be defined', () => {
        expect(errorService).toBeDefined();
    });

    it('should handle errors and log them', async () => {
        const error = new Error('Test error');
        await errorService.handle(error, 'testContext');
        expect(loggerService.writeLog).toHaveBeenCalledWith(String(error), 'ERROR', 'testContext');
    });
});