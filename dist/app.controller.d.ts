import { AppService } from './app.service';
import type { Response } from 'express';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    scheduleSuccess(query: any, res: Response): Response<any, Record<string, any>>;
    schedulePending(query: any, res: Response): Response<any, Record<string, any>>;
    scheduleFailure(query: any, res: Response): Response<any, Record<string, any>>;
    private renderScheduleReturnPage;
}
