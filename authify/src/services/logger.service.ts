import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { promises as fsp } from 'fs';
@Injectable()
export class LoggerService {
    async formatDate(format: string): Promise<string> {
        const myDate = new Date();
        const Day = String(myDate.getDate()).padStart(2, '0');
        const Month = String(myDate.getMonth() + 1).padStart(2, '0');
        const Year = myDate.getFullYear();
        const Hours = String(myDate.getHours()).padStart(2, '0');
        const Minutes = String(myDate.getMinutes()).padStart(2, '0');
        const Seconds = String(myDate.getSeconds()).padStart(2, '0');
        const miliSeconds = String(myDate.getMilliseconds()).padStart(3, '0');

        if (format == 'full') { return `${Day}.${Month}.${Year}, ${Hours}:${Minutes}:${Seconds}:${miliSeconds}` }
        if (format == 'date') { return `${Year}.${Month}.${Day}` }
        if (format == 'day') { return `${Day}.${Month}.${Year}` }
        if (format == 'hour') { return `${Hours}` }
    }

    async writeLog(text: string, type: string, context?: string) {
        const now = await this.formatDate('full');
        const day = await this.formatDate('day');
        const hour = await this.formatDate('hour');
        const logDir = path.join('src', 'logs', day);

        const endHour = Number(hour) + 1;
        const filePath = path.join(logDir, `${hour}.00-${endHour == 24 ? '00' : endHour}.00.csv`);

        const log = `${type.toUpperCase()}:|${context}|${now},${text}\n`;

        try {
            await fsp.mkdir(logDir, { recursive: true })
            await fsp.appendFile(filePath, log);
        } catch (error) {
            console.error(`Logger write error: ${error}`);
        }

    }
}
