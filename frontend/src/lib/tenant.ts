/**
 * Tenant Utilities
 * 
 * This module re-exports the centralized tenant resolver.
 * For domain-based tenant resolution, use resolveTenantFromHost().
 * 
 * The deprecated getTenantIdFromHostname() with a hardcoded tenant map
 * has been replaced by the dynamic API-based resolver.
 */

export { resolveTenantFromHost } from './resolve-tenant';
