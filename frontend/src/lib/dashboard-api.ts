import { useState, useEffect } from 'react';

export interface DashboardStats {
  total_forms: number;
  total_pages: number;
  upcoming_events: number;
  total_team_members: number;
  total_orders: number;
  total_revenue: number;
  monthly_revenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  recent_activity: Array<{
    user_id: string;
    action: string;
    table_name: string;
    record_id: string;
    created_at: string;
  }>;
}

export interface DashboardHealth {
  uptime: string;
  content_sync: string;
  database_connections: string;
  storage_usage: string;
}

export interface DashboardData {
  stats: DashboardStats;
  health: DashboardHealth;
  loading: boolean;
  error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardStats>({
    total_forms: 0,
    total_pages: 0,
    upcoming_events: 0,
    total_team_members: 0,
    total_orders: 0,
    total_revenue: 0,
    monthly_revenue: [],
    recent_activity: []
  });
  const [health, setHealth] = useState<DashboardHealth>({
    uptime: '99.9%',
    content_sync: 'Synced',
    database_connections: 'Healthy',
    storage_usage: 'Normal'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        const stats = await response.json();
        
        const healthResponse = await fetch(`${API_URL}/dashboard/health`, {
          credentials: 'include',
        });
        if (!healthResponse.ok) {
          throw new Error('Failed to fetch dashboard health');
        }
        const healthData = await healthResponse.json();
        
        setData(stats);
        setHealth(healthData);
        setLoading(false);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    stats: data,
    health,
    loading,
    error
  };
}

export function formatDashboardStats(stats: DashboardStats) {
  return [
    {
      name: 'Total Revenue',
      value: `$${stats.total_revenue.toLocaleString()}`,
      change: `${stats.total_orders} orders`,
      icon: 'DollarSign' as const,
      color: 'bg-success'
    },
    {
      name: 'Total Orders',
      value: stats.total_orders.toString(),
      change: 'Completed',
      icon: 'ShoppingCart' as const,
      color: 'bg-primary'
    },
    {
      name: 'Total Pages',
      value: stats.total_pages.toString(),
      change: 'Published',
      icon: 'FileText' as const,
      color: 'bg-primary-500'
    },
    {
      name: 'Team Members',
      value: stats.total_team_members.toString(),
      change: 'Active',
      icon: 'Users' as const,
      color: 'bg-warning'
    }
  ];
}

export function formatRecentActivity(activity: DashboardStats["recent_activity"]) {
  return activity.map(item => ({
    user: item.user_id.charAt(0).toUpperCase(),
    action: item.action,
    item: item.table_name,
    time: 'Just now',
    color: 'bg-primary'
  }));
}