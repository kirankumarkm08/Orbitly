import { supabaseAdmin } from '../config/supabase.js';
// Ensures tenant_id is present for protected routes
export const tenantMiddleware = async (req, res, next) => {
    // If tenantId is missing, check if we can provide a default for super admins
    if (!req.tenantId) {
        if (req.user?.role === 'super_admin') {
            console.warn('TenantMiddleware: Super admin accessing tenant route without tenantId. Finding default...');
            // Try to find the first tenant as a fallback
            const { data: tenants } = await supabaseAdmin.from('tenants').select('id').limit(1);
            if (tenants && tenants.length > 0 && tenants[0]) {
                req.tenantId = tenants[0].id;
                console.log('TenantMiddleware: Assigned default tenantId:', req.tenantId);
                return next();
            }
        }
        return res.status(403).json({
            error: 'No tenant associated with this user',
            code: 'NO_TENANT'
        });
    }
    next();
};
// Check user role permissions
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
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
//# sourceMappingURL=tenant.middleware.js.map