'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, FileText, Plus, Settings as SettingsIcon,
  Calendar, MessageSquare, Sparkles, LucideIcon, DollarSign, ShoppingCart
} from 'lucide-react';
import { useDashboardData, formatDashboardStats, formatRecentActivity } from '@/lib/dashboard-api';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  MessageSquare,
  FileText,
  Calendar,
  Users,
  Sparkles,
  Plus,
  SettingsIcon,
  DollarSign,
  ShoppingCart
};

export default function AdminDashboard() {
  const { stats, health, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-lg">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-primary-400/40 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-foreground">Loading...</h1>
            <p className="text-primary-100 mt-2">Fetching dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-red-500 p-8 shadow-lg">
          <div className="relative z-10 text-center">
            <h1 className="text-3xl font-bold text-foreground">Error Loading Dashboard</h1>
            <p className="text-red-100 mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const formattedStats = formatDashboardStats(stats);
  const recentActivity = formatRecentActivity(stats.recent_activity);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-lg">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-primary-400/40 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Admin!</h1>
          <p className="text-primary-100 mt-2">Managing <span className="text-foreground font-semibold">Rare Evo</span> • Free Plan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats and Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {formattedStats.map((stat) => {
              const IconComponent = iconMap[stat.icon];
              return (
                <div key={stat.name} className="rounded-xl bg-card border border-border p-6 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.name}</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                      <p className="text-xs text-primary mt-1">{stat.change}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} shadow-sm`}>
                      {IconComponent && <IconComponent className="h-6 w-6 text-foreground" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart */}
          {stats.monthly_revenue && stats.monthly_revenue.length > 0 && (
            <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Revenue Overview</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Monthly revenue from orders</p>
                </div>
              </div>
              <div className="flex items-end gap-3 h-40">
                {stats.monthly_revenue.map((month, i) => {
                  const maxRevenue = Math.max(...stats.monthly_revenue.map(m => m.revenue), 1);
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={cn(
                          "w-full rounded-md transition-all",
                          i === stats.monthly_revenue.length - 1 ? "bg-primary" : "bg-primary/30"
                        )}
                        style={{ height: `${Math.max((month.revenue / maxRevenue) * 100, 4)}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{month.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="rounded-xl bg-card border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-accent transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full ${activity.color} flex items-center justify-center text-foreground font-bold text-sm`}>
                      {activity.user}
                    </div>
                    <div>
                      <p className="text-sm text-foreground font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.item}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Quick Actions & Health */}
        <div className="space-y-6">
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Open Studio', icon: Sparkles, href: '/admin/studio' },
                { name: 'Create Event', icon: Plus, href: '/admin/events' },
                { name: 'Manage Pages', icon: FileText, href: '/admin/pages' },
                { name: 'Settings', icon: SettingsIcon, href: '/admin/settings' },
              ].map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="h-24 flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted hover:bg-primary/5 hover:border-primary/20 transition-all group"
                >
                  <action.icon className="h-6 w-6 text-secondary-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                  <span className="text-xs text-secondary-foreground group-hover:text-foreground">{action.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Platform Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-secondary-foreground">System Uptime</span>
                  <span className="text-success font-medium">{health.uptime}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="w-[99.9%] h-full bg-success rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-foreground">Content Health</span>
                <span className="text-primary font-medium">{health.content_sync}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
