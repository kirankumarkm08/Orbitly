'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Activity, 
  Users, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Database,
  Globe,
  Shield
} from 'lucide-react';

interface ImpersonationSession {
  id: string;
  admin: string;
  tenant: string;
  tenantId: string;
  startedAt: Date;
}

interface Task {
  id: string;
  type: 'export' | 'bulk_suspend' | 'webhook_retry' | 'cleanup';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  source: string;
}

const impersonationSessions: ImpersonationSession[] = [
  { id: '1', admin: 'admin@example.com', tenant: 'Acme Corp', tenantId: 't1', startedAt: new Date(Date.now() - 15*60*1000) },
  { id: '2', admin: 'support@example.com', tenant: 'EventPro', tenantId: 't2', startedAt: new Date(Date.now() - 8*60*1000) },
  { id: '3', admin: 'admin@example.com', tenant: 'LaunchCo', tenantId: 't3', startedAt: new Date(Date.now() - 3*60*1000) },
];

const taskQueue: Task[] = [
  { id: '1', type: 'export', description: 'Export tenant data for Acme Corp', status: 'running', progress: 67 },
  { id: '2', type: 'bulk_suspend', description: 'Suspend 50 inactive tenants', status: 'pending' },
  { id: '3', type: 'webhook_retry', description: 'Retry 12 failed webhooks', status: 'pending' },
  { id: '4', type: 'cleanup', description: 'Clean up orphaned assets', status: 'completed' },
];

const alerts: Alert[] = [
  { id: '1', type: 'error', message: 'Payment failure spike detected - 15 failures in last hour', timestamp: new Date(Date.now() - 12*60*1000), source: 'Payments' },
  { id: '2', type: 'warning', message: 'API error rate >5% on /api/events endpoint', timestamp: new Date(Date.now() - 25*60*1000), source: 'API' },
  { id: '3', type: 'warning', message: 'Storage limit warning for 3 tenants', timestamp: new Date(Date.now() - 45*60*1000), source: 'Storage' },
  { id: '4', type: 'info', message: 'Database backup completed successfully', timestamp: new Date(Date.now() - 60*60*1000), source: 'System' },
];

const systemMetrics = [
  { name: 'API Latency', value: '45ms', status: 'good', icon: Zap },
  { name: 'Database Connections', value: '23/100', status: 'good', icon: Database },
  { name: 'Error Rate', value: '0.3%', status: 'good', icon: Activity },
  { name: 'Active Users', value: '1,247', status: 'info', icon: Users },
];

export default function OperationsPage() {
  const [sessions, setSessions] = useState(impersonationSessions);
  const [tasks, setTasks] = useState(taskQueue);

  const handleRevokeSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const handleRetryTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: 'running' as const } : t
    ));
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'warning': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getTaskTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'export': return '📦';
      case 'bulk_suspend': return '⏸️';
      case 'webhook_retry': return '🔄';
      case 'cleanup': return '🧹';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Operations Center</h1>
        <p className="text-gray-400 mt-1">Active monitoring and intervention tools</p>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => (
          <Card key={metric.name} variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">{metric.name}</p>
                  <p className="text-xl font-bold text-white mt-1">{metric.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  metric.status === 'good' ? 'bg-green-500/20' :
                  metric.status === 'warning' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                }`}>
                  <metric.icon className={`h-5 w-5 ${
                    metric.status === 'good' ? 'text-green-400' :
                    metric.status === 'warning' ? 'text-orange-400' : 'text-blue-400'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Impersonation Sessions */}
        <Card variant="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                Live Impersonation Sessions
              </CardTitle>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                {sessions.length} active
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No active sessions
                </div>
              ) : (
                sessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{session.admin}</span>
                        <span className="text-xs text-gray-500">→</span>
                        <span className="text-sm text-purple-400">{session.tenant}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Started {Math.round((Date.now() - session.startedAt.getTime()) / 60000)} min ago
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      Revoke
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Queue */}
        <Card variant="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-400" />
                Task Queue
              </CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="text-lg">{getTaskTypeIcon(task.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{task.description}</div>
                    {task.status === 'running' && task.progress && (
                      <div className="mt-1">
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all" 
                            style={{ width: `${task.progress}%` }} 
                          />
                        </div>
                        <span className="text-xs text-gray-500">{task.progress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'pending' && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">Pending</span>
                    )}
                    {task.status === 'running' && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">Running</span>
                    )}
                    {task.status === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    {task.status === 'failed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRetryTask(task.id)}
                        className="h-6 text-xs"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Anomalies */}
      <Card variant="glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              Alerts & Anomalies
            </CardTitle>
            <span className="text-xs text-gray-400">Last 24 hours</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                {alert.type === 'error' && <XCircle className="h-4 w-4 mt-0.5" />}
                {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 mt-0.5" />}
                {alert.type === 'info' && <CheckCircle className="h-4 w-4 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{alert.message}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
                    <span>{alert.source}</span>
                    <span>•</span>
                    <span>{Math.round((Date.now() - alert.timestamp.getTime()) / 60000)} min ago</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-white/5">
                  Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <RefreshCw className="h-5 w-5 text-blue-400 mb-2" />
          <p className="text-sm font-medium text-white">Clear Cache</p>
          <p className="text-xs text-gray-500 mt-1">Invalidate CDN</p>
        </button>
        <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <Database className="h-5 w-5 text-green-400 mb-2" />
          <p className="text-sm font-medium text-white">DB Backup</p>
          <p className="text-xs text-gray-500 mt-1">Manual backup</p>
        </button>
        <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <Globe className="h-5 w-5 text-purple-400 mb-2" />
          <p className="text-sm font-medium text-white">Maintenance</p>
          <p className="text-xs text-gray-500 mt-1">Toggle mode</p>
        </button>
        <button className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left">
          <Shield className="h-5 w-5 text-orange-400 mb-2" />
          <p className="text-sm font-medium text-white">Security Scan</p>
          <p className="text-xs text-gray-500 mt-1">Run audit</p>
        </button>
      </div>
    </div>
  );
}
