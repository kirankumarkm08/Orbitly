import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
const router = express.Router();
const VALID_NICHES = ['ecommerce', 'events', 'launchpad', 'static'];
const DEFAULT_MODULES = {
    ecommerce: ['products', 'orders', 'customers', 'inventory'],
    events: ['events', 'tickets', 'attendees', 'speakers'],
    launchpad: ['pages', 'waitlist', 'campaigns'],
    static: ['pages', 'blog', 'media', 'forms'],
};
// GET /api/public/resolve-tenant?domain=demo.yourapp.com
router.get('/resolve-tenant', asyncHandler(async (req, res) => {
    const { domain } = req.query;
    if (!domain) {
        throw createError('Domain is required', 400);
    }
    const { data, error } = await supabaseAdmin
        .from('tenant_domains')
        .select('tenant_id, tenant:tenant_id(*)')
        .eq('domain', domain)
        .eq('is_active', true)
        .single();
    if (error || !data) {
        throw createError('Tenant not found', 404);
    }
    res.json({
        tenant_id: data.tenant_id,
        tenant: data.tenant,
    });
}));
// POST /api/public/onboarding - Super tenant onboarding
router.post('/onboarding', asyncHandler(async (req, res) => {
    const { email, password, full_name, niche, domain } = req.body;
    if (!email || !password || !full_name || !niche || !domain) {
        throw createError('Email, password, full name, niche, and domain are required', 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw createError('Invalid email format', 400);
    }
    if (password.length < 8) {
        throw createError('Password must be at least 8 characters', 400);
    }
    if (!VALID_NICHES.includes(niche)) {
        throw createError('Invalid niche. Valid options: ecommerce, events, launchpad, static', 400);
    }
    const domainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    const normalizedDomain = domain.toLowerCase().trim();
    if (!domainRegex.test(normalizedDomain)) {
        throw createError('Domain must be alphanumeric with hyphens, lowercase, and not start/end with hyphen', 400);
    }
    const { data: existingDomain } = await supabaseAdmin
        .from('tenant_domains')
        .select('id')
        .eq('domain', normalizedDomain)
        .single();
    if (existingDomain) {
        throw createError('Domain already exists', 409);
    }
    const tenantModules = DEFAULT_MODULES[niche];
    const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert({
        name: full_name,
        slug: normalizedDomain,
        domain: normalizedDomain,
        niche,
        niches: [niche],
        settings: {
            modules: tenantModules,
            features: { enabledModules: tenantModules },
        },
    })
        .select()
        .single();
    if (tenantError) {
        throw createError('Failed to create tenant: ' + tenantError.message, 500);
    }
    const { error: domainError } = await supabaseAdmin
        .from('tenant_domains')
        .insert({
        tenant_id: tenant.id,
        domain: normalizedDomain,
        is_primary: true,
        is_active: true,
    });
    if (domainError) {
        await supabaseAdmin.from('tenants').delete().eq('id', tenant.id);
        throw createError('Failed to create domain: ' + domainError.message, 500);
    }
    const moduleInserts = tenantModules.map((moduleName) => ({
        tenant_id: tenant.id,
        module_name: moduleName,
        is_enabled: true,
        settings: {},
    }));
    await supabaseAdmin.from('tenant_modules').insert(moduleInserts);
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
                tenant_id: tenant.id,
            },
        },
    });
    if (authError) {
        await supabaseAdmin.from('tenant_domains').delete().eq('tenant_id', tenant.id);
        await supabaseAdmin.from('tenants').delete().eq('id', tenant.id);
        throw createError('Failed to create user: ' + authError.message, 500);
    }
    if (authData.user) {
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({
            tenant_id: tenant.id,
            role: 'owner',
            full_name,
        })
            .eq('id', authData.user.id);
        if (userError) {
            console.error('Failed to update user profile:', userError);
        }
    }
    res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            domain: tenant.domain,
            niche: tenant.niche,
        },
        user: {
            id: authData.user?.id,
            email: authData.user?.email,
        },
    });
}));
export default router;
//# sourceMappingURL=tenant.routes.js.map