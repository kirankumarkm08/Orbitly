'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  DollarSign, 
  Building2, 
  Activity, 
  TrendingUp,
  TrendingDown,
  UserPlus,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';

export default function AdminDashboard() {
  const { tenants, fetchTenants, isLoading } = useAdminData();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchTenants();
    const interval = setInterval(() => {
      fetchTenants();
      setLastRefresh(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchTenants]);

  const activityFeed = [
    { type: 'tenant', message: 'Workspace "LaunchPad" created', time: '2m ago' },
    { type: 'upgrade', message: 'Tenant "Acme" upgraded to Pro', time: '5m ago' },
    { type: 'alert', message: '3 failed payments detected', time: '12m ago' },
    { type: 'signup', message: 'New signup: user@beta.com', time: '18m ago' },
    { type: 'tenant', message: 'Workspace "EventHorizon" created', time: '23m ago' },
  ];

  const funnelData = {
    started: 142,
    completed: 89,
    rate: 62
  };

  const geoData = [
    { region: 'North America', count: 523, percent: 42 },
    { region: 'Europe', count: 398, percent: 32 },
    { region: 'Asia Pacific', count: 234, percent: 19 },
    { region: 'Other', count: 92, percent: 7 },
  ];

  const stats = [
    { 
      name: 'Total MRR', 
      value: '$47,230', 
      change: '+12%', 
      trend: 'up',
      subtext: 'vs last month',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    },
    { 
      name: 'Active Tenants', 
      value: tenants?.length?.toString() || '0', 
      change: '+23', 
      trend: 'up',
      subtext: 'this week',
      icon: Building2,
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      name: 'Health Score', 
      value: '98%', 
      change: 'Excellent',
      trend: 'up',
      subtext: '●●●●●○',
      icon: Activity,
      color: 'from-purple-500 to-violet-600'
    },
    { 
      name: 'Signups Today', 
      value: '47', 
      change: '+15%', 
      trend: 'up',
      subtext: 'vs yesterday',
      icon: UserPlus,
      color: 'from-orange-500 to-amber-600'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 mt-1">Platform pulse • Updated {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          Auto-refresh: 60s
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} variant="glass" className="hover:border-white/20 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-400" />
                    )}
                    <span className={`text-xs ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500">{stat.subtext}</span>
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Feed - Spans 2 columns */}
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Real-Time Activity</CardTitle>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-400">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {activityFeed.map((activity, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                    activity.type === 'upgrade' ? 'bg-green-500/20 text-green-400' :
                    activity.type === 'signup' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {activity.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                    {activity.type === 'upgrade' && <TrendingUp className="h-4 w-4" />}
                    {activity.type === 'signup' && <UserPlus className="h-4 w-4" />}
                    {activity.type === 'tenant' && <Building2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{activity.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Funnel */}
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Onboarding Funnel</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Started</span>
                  <span className="text-white font-medium">{funnelData.started}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Niche Selected</span>
                  <span className="text-white font-medium">{Math.round(funnelData.started * 0.8)}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-white font-medium">{funnelData.completed}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Conversion</span>
                  <span className="text-lg font-bold text-green-400">{funnelData.rate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geography Distribution */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Geographic Distribution
            </CardTitle>
            <span className="text-xs text-gray-400">For data residency planning</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {geoData.map((region) => (
              <div key={region.region} className="p-4 rounded-lg bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">{region.region}</span>
                  <span className="text-xs text-gray-500">{region.percent}%</span>
                </div>
                <div className="text-2xl font-bold text-white">{region.count}</div>
                <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                    style={{ width: `${region.percent}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <Building2 className="h-5 w-5 text-blue-400 mb-2" />
          <p className="text-sm font-medium text-white">Create Tenant</p>
          <p className="text-xs text-gray-500 mt-1">Add new workspace</p>
        </button>
        <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <UserPlus className="h-5 w-5 text-green-400 mb-2" />
          <p className="text-sm font-medium text-white">Invite Admin</p>
          <p className="text-xs text-gray-500 mt-1">Add team member</p>
        </button>
        <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <Activity className="h-5 w-5 text-purple-400 mb-2" />
          <p className="text-sm font-medium text-white">View Logs</p>
          <p className="text-xs text-gray-500 mt-1">System activity</p>
        </button>
        <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <ArrowUpRight className="h-5 w-5 text-orange-400 mb-2" />
          <p className="text-sm font-medium text-white">Export Data</p>
          <p className="text-xs text-gray-500 mt-1">Download report</p>
        </button>
      </div>
    </div>
  );
}
