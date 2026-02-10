import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    let finalProfile = userProfile;

    if (profileError || !userProfile) {
      console.warn('AuthMiddleware: Profile not found for userId:', user.id, '. Checking for super admin fallback.');
      
      // Fallback: If it's the known super admin email, create a virtual profile
      if (user.email === 'admin@example.com' || user.email === 'admin@minimal-saas.com') {
        finalProfile = {
          id: user.id,
          email: user.email,
          role: 'super_admin',
          tenant_id: null,
          full_name: 'Super Admin Fallback'
        };
      } else {
        return res.status(401).json({ error: 'User profile not found' });
      }
    }

    // Attach user and tenant to request
    req.user = finalProfile;
    
    // Support switching tenant context for super admins via header
    const headerTenantId = req.headers['x-tenant-id'];
    if (finalProfile?.role === 'super_admin' && headerTenantId) {
      req.tenantId = headerTenantId as string;
    } else {
      req.tenantId = finalProfile?.tenant_id;
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional auth - allows public access but adds user if authenticated
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);

      if (user) {
        const { data: userProfile } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userProfile) {
          req.user = userProfile;
          req.tenantId = userProfile.tenant_id;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};
