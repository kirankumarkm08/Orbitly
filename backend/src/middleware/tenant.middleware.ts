import { Request, Response, NextFunction } from 'express';

// Ensures tenant_id is present for protected routes
export const tenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.tenantId) {
    return res.status(403).json({ 
      error: 'No tenant associated with this user',
      code: 'NO_TENANT'
    });
  }
  next();
};

// Check user role permissions
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};
