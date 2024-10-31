import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Injectable()
export class ErrorService {

    constructor(private readonly logger: LoggerService) { }

    async handle(error: unknown, context?: string): Promise<void> {
        console.error(`(${context}): ${error}`);
        try {
            await this.logger.writeLog(`${error}`, 'ERROR', context || undefined);
        } catch (error) { console.error(`Logger write error: ${error}`) }
        return null;
    }
}
