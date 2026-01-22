import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    deleteAccount(req: any): Promise<{
        message: string;
    }>;
    requestDataExport(req: any): Promise<{
        message: string;
        requestId: string;
    }>;
}
