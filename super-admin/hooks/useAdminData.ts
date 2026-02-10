import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useAdminData() {
  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      // Logic to fetch stats - if api.getStats is not ready, use mock
      // const data = await api.getStats();
      // setStats(data);
      
      // MOCK DATA
      setStats([
        { name: 'Total Tenants', value: '12', change: '+2 this month', icon: 'Building2', color: 'from-purple-500 to-violet-600' },
        { name: 'Total Users', value: '248', change: '+18 this week', icon: 'Users', color: 'from-blue-500 to-cyan-600' },
        { name: 'Total Pages', value: '1,429', change: '+124 today', icon: 'FileText', color: 'from-green-500 to-emerald-600' },
        { name: 'System Health', value: '99.9%', change: 'Uptime', icon: 'TrendingUp', color: 'from-orange-500 to-red-600' },
      ]);
    } catch (err) {
      setError('Failed to fetch stats');
    }
  }, []);

  const fetchTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getTenants();
      setTenants(data);
    } catch (err) {
       console.error(err);
       setError('Failed to fetch tenants');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTenant = useCallback(async (data: any) => {
    try {
      await api.createTenant(data);
      await fetchTenants(); // Refresh list
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [fetchTenants]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      // const data = await api.getUsers();
      // setUsers(data);
      
      // MOCK DATA
      setTimeout(() => {
        setUsers([
          { id: '1', name: 'John Doe', email: 'john@acme.com', role: 'admin', tenant: 'Acme Corp', created: '2024-01-15' },
          { id: '2', name: 'Sarah Smith', email: 'sarah@tech.com', role: 'user', tenant: 'Tech Startup', created: '2024-02-01' },
          { id: '3', name: 'Mike Johnson', email: 'mike@design.com', role: 'user', tenant: 'Design Studio', created: '2024-02-10' },
          { id: '4', name: 'Lisa Brown', email: 'lisa@shop.com', role: 'admin', tenant: 'E-Shop', created: '2024-01-20' },
          { id: '5', name: 'Admin User', email: 'admin@example.com', role: 'super_admin', tenant: 'System', created: '2024-01-01' },
        ]);
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to fetch users');
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    tenants,
    users,
    isLoading,
    error,
    fetchStats,
    fetchTenants,
    fetchUsers,
    createTenant,
  };
}
