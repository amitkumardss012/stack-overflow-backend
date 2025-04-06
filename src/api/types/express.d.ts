import { Request } from 'express';
import { AdminType } from '../validators/admin.validator';

export declare global {
    namespace Express {
        interface Request {
            User?: {
                id: string,
                username: string, 
                email: string,
            }
        }
    }
} 

