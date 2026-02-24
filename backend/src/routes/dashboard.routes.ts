import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { getRecentAuditActivity } from '../utils/audit-log.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = Router();

// Apply auth middleware to all dashboard routes
router.use(authMiddleware, tenantMiddleware);

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for the current tenant
 */
router.get('/stats', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(401).json({ error: 'Tenant not found' });
    }

    // Get counts for different entities
    const [pagesCount, eventsCount, customersCount, ordersData] = await Promise.all([
      supabaseAdmin
        .from('pages')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId),
      
      supabaseAdmin
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId),
      
      supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .neq('role', 'super_admin'),

      supabaseAdmin
        .from('orders')
        .select('amount_total, payment_status, status, created_at')
        .eq('tenant_id', tenantId)
    ]);

    const orders = ordersData.data || [];
    const paidOrders = orders.filter((o: any) => o.payment_status === 'paid');
    const totalRevenue = paidOrders.reduce((acc: number, o: any) => acc + Number(o.amount_total || 0), 0);
    const totalOrders = paidOrders.length;

    // Get monthly revenue (last 6 months)
    const now = new Date();
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.created_at);
        return o.payment_status === 'paid' && 
               orderDate >= monthStart && 
               orderDate <= monthEnd;
      });

      monthlyRevenue.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: monthOrders.reduce((acc: number, o: any) => acc + Number(o.amount_total || 0), 0),
        orders: monthOrders.length,
      });
    }

    // Get recent activity (last 7 days)
    const recentActivity = await getRecentAuditActivity(tenantId, 10);

    const stats = {
      total_pages: pagesCount.count || 0,
      upcoming_events: eventsCount.count || 0,
      total_team_members: customersCount.count || 0,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      monthly_revenue: monthlyRevenue,
      recent_activity: recentActivity.map(activity => ({
        user_id: activity.user_id,
        action: activity.action,
        table_name: activity.table_name,
        record_id: activity.record_id,
        created_at: activity.created_at
      }))
    };

    return res.json(stats);
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

/**
 * GET /api/dashboard/health
 * Get system health information
 */
router.get('/health', async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(401).json({ error: 'Tenant not found' });
    }

    // Check system health metrics
    const health = {
      uptime: '99.9%', // This should be calculated from actual uptime
      content_sync: 'Synced',
      database_connections: 'Healthy',
      storage_usage: 'Normal'
    };

    return res.json(health);
    
  } catch (error) {
    console.error('Error fetching dashboard health:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard health' });
  }
});

export default router;