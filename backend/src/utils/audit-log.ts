import { supabaseAdmin } from '../config/supabase.ts';

export interface AuditLogData {
  tenant_id: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log an audit event to the audit_log table
 * @param data - Audit log data
 * @returns Promise that resolves when the log is complete
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    const { tenant_id, user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent } = data;
    
    // Validate required fields
    if (!tenant_id || !action) {
      throw new Error('tenant_id and action are required for audit logging');
    }

    // Get IP address and user agent from request context if available
    // This would typically be called with request context in middleware

    const auditData = {
      tenant_id,
      user_id,
      action,
      table_name,
      record_id,
      old_values: old_values ? JSON.stringify(old_values) : null,
      new_values: new_values ? JSON.stringify(new_values) : null,
      ip_address,
      user_agent
    };

    // Insert audit log entry
    const { error } = await supabaseAdmin
      .from('audit_log')
      .insert(auditData)
      .select()
      .single();

    if (error) {
      console.error('Error logging audit event:', error);
      throw error;
    }

    console.log('Audit event logged:', {
      tenant_id,
      user_id,
      action,
      table_name,
      record_id
    });

  } catch (error) {
    console.error('Failed to log audit event:', error);
    throw error;
  }
}

/**
 * Get recent audit activity for a tenant
 * @param tenant_id - The tenant ID
 * @param limit - Number of records to return (default: 10)
 * @returns Array of recent audit log entries
 */
export async function getRecentAuditActivity(tenant_id: string, limit = 10): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_log')
      .select('user_id, action, table_name, record_id, created_at')
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit activity:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get audit activity:', error);
    throw error;
  }
}

/**
 * Get system-wide audit activity for super admin
 * @param limit - Number of records to return (default: 10)
 * @returns Array of recent audit log entries across all tenants
 */
export async function getSystemAuditActivity(limit = 10): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_log')
      .select('tenant_id, user_id, action, table_name, record_id, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching system audit activity:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get system audit activity:', error);
    throw error;
  }
}

/**
 * Get tenant statistics for analytics
 * @param tenant_id - The tenant ID
 * @returns Object with tenant statistics
 */
export async function getTenantStatistics(tenant_id: string) {
  try {
    const [pagesCount, eventsCount, formsCount, customersCount] = await Promise.all([
      supabaseAdmin
        .from('pages')
        .count()
        .eq('tenant_id', tenant_id)
        .not('is_deleted', 'true'),
      
      supabaseAdmin
        .from('events')
        .count()
        .eq('tenant_id', tenant_id)
        .not('is_deleted', 'true'),
      
      supabaseAdmin
        .from('forms')
        .count()
        .eq('tenant_id', tenant_id)
        .not('is_deleted', 'true'),
      
      supabaseAdmin
        .from('users')
        .count()
        .eq('tenant_id', tenant_id)
        .not('is_deleted', 'true')
        .not('role', 'super_admin')
    ]);

    return {
      total_forms: formsCount[0].count || 0,
      total_pages: pagesCount[0].count || 0,
      total_events: eventsCount[0].count || 0,
      total_customers: customersCount[0].count || 0
    };
  } catch (error) {
    console.error('Failed to get tenant statistics:', error);
    throw error;
  }
}

/**
 * Get system-wide statistics for super admin
 * @returns Object with system-wide statistics
 */
export async function getSystemStatistics() {
  try {
    const { data: tenantsData, error: tenantsError } = await supabaseAdmin
      .from('tenants')
      .select('id, name, created_at');

    if (tenantsError) {
      console.error('Error fetching tenants for system stats:', tenantsError);
      throw tenantsError;
    }

    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, created_at');

    if (usersError) {
      console.error('Error fetching users for system stats:', usersError);
      throw usersError;
    }

    return {
      total_tenants: tenantsData.length,
      total_users: usersData.length,
      tenants: tenantsData.map(t => ({
        id: t.id,
        name: t.name,
        created_at: t.created_at
      })),
      users: usersData.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at
      }))
    };
  } catch (error) {
    console.error('Failed to get system statistics:', error);
    throw error;
  }
}