'use client'; /* HMR Trigger */

import React from 'react';
import Link from 'next/link';
import { 
  Users, FileText, TrendingUp, Plus, Settings as SettingsIcon,
  Calendar, MessageSquare, Sparkles
} from 'lucide-react';

const stats = [
  { name: 'Total Forms', value: '5', change: 'Active forms', icon: MessageSquare, color: 'bg-primary' },
  { name: 'Total Pages', value: '25', change: '23 published', icon: FileText, color: 'bg-primary-500' },
  { name: 'Upcoming Events', value: '1', change: 'In 3 days', icon: Calendar, color: 'bg-success' },
  { name: 'Total Customers', value: '2,350', change: '+142 this month', icon: Users, color: 'bg-warning' },
];

const quickActions = [
  { name: 'Open Studio', icon: Sparkles, href: '/admin/studio' },
  { name: 'Create Event', icon: Plus, href: '/admin/events' },
  { name: 'Manage Pages', icon: FileText, href: '/admin/pages' },
  { name: 'Settings', icon: SettingsIcon, href: '/admin/settings' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-lg">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-primary-400/40 rounded-full blur-3xl" />
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
            {stats.map((stat) => (
              <div key={stat.name} className="rounded-xl bg-card border border-border p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                    <p className="text-xs text-primary mt-1">{stat.change}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} shadow-sm`}>
                    <stat.icon className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl bg-card border border-border shadow-sm">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { user: 'A', action: 'Published new page', item: 'Home Redesign', time: '2 min ago', color: 'bg-primary' },
                { user: 'E', action: 'Created form', item: 'Contact Us', time: '15 min ago', color: 'bg-primary-500' },
                { user: 'S', action: 'Successful backup', item: 'Daily Sync', time: '1 hour ago', color: 'bg-success' },
              ].map((activity, index) => (
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
              {quickActions.map((action) => (
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
                  <span className="text-success font-medium">99.9%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="w-[99.9%] h-full bg-success rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-foreground">Content Health</span>
                <span className="text-primary font-medium">Synced</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
