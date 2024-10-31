import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '../src/services/jwt.service';
import { LoggerService } from '../src/services/logger.service';
import { ErrorService } from '../src/services/error.service';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();
describe('JwtService', () => {
    let jwtService: JwtService;
    let mockErrorService: Partial<ErrorService>;

    beforeEach(async () => {
        mockErrorService = {
            handle: jest.fn(), 
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoggerService,
                JwtService,
                { provide: ErrorService, useValue: mockErrorService }, 
            ],
        }).compile();

        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(jwtService).toBeDefined();
    });

    it('should create a token', async () => {
        const payload = { id: 1 };
        const token = await jwtService.createToken(payload);
        expect(token).toBeDefined();
    });

    it('should verify a token', async () => {
        const payload = { id: 1 };
        const token = await jwt.sign(payload, process.env.JWT_SECRET);

        const verified = await jwtService.verifyToken(token);
        expect(verified).toBeTruthy();
    });

    it('should decode a token', async () => {
        const payload = { id: 1 };
        const token = await jwt.sign(payload, process.env.JWT_SECRET);

        const decodedId = await jwtService.decodeToken(token);
        expect(decodedId).toEqual(1);
    });
});