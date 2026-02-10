'use client';

import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Building2, FileText, TrendingUp } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';

const iconMap: any = {
  Users,
  Building2,
  FileText,
  TrendingUp
};

export default function AdminDashboard() {
  const { stats, fetchStats } = useAdminData();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const recentActivity = [
    { user: 'john@acme.com', action: 'Created new tenant', tenant: 'Acme Corp', time: '2 min ago' },
    { user: 'sarah@tech.com', action: 'Published page', tenant: 'Tech Startup', time: '5 min ago' },
    { user: 'mike@design.com', action: 'Uploaded assets', tenant: 'Design Studio', time: '12 min ago' },
    { user: 'lisa@shop.com', action: 'Updated product', tenant: 'E-Shop', time: '23 min ago' },
  ];

  if (!stats) return <div className="p-6 text-white">Loading stats...</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">System overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any) => {
          const Icon = iconMap[stat.icon] || TrendingUp;
          return (
            <Card key={stat.name} variant="glass" className="hover:scale-105 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.name}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    <p className="text-xs text-green-400 mt-1">{stat.change}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {activity.user.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{activity.user}</p>
                    <p className="text-xs text-gray-400">
                      {activity.action} • <span className="text-purple-400">{activity.tenant}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
