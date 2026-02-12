import type { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    statusCode?: number;
    details?: any;
}
export declare const errorHandler: (err: ApiError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const createError: (message: string, statusCode: number, details?: any) => ApiError;
//# sourceMappingURL=error.middleware.d.ts.map