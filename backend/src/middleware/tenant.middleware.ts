import type { Request, Response, NextFunction } from 'express';

// Ensures tenant_id is present for protected routes
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If tenantId is missing, require super admins to specify one explicitly
  if (!req.tenantId) {
    if (req.user?.role === 'super_admin') {
      return res.status(400).json({
        error: 'Super admin must specify a tenant via x-tenant-id header',
        code: 'TENANT_REQUIRED'
      });
    }

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
