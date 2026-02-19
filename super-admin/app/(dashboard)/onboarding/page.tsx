'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  UserPlus, 
  ArrowRight,
  Mail,
  Download
} from 'lucide-react';

interface OnboardingUser {
  id: string;
  email: string;
  stage: 'auth' | 'workspace' | 'niche' | 'config' | 'template' | 'done';
  startedAt: Date;
  lastActivity: Date;
  niche?: string;
  workspaceName?: string;
}

const stages = [
  { id: 'auth', label: 'Auth', count: 45 },
  { id: 'workspace', label: 'Workspace', count: 32 },
  { id: 'niche', label: 'Niche', count: 28 },
  { id: 'config', label: 'Config', count: 19 },
  { id: 'template', label: 'Template', count: 16 },
  { id: 'done', label: 'Done', count: 89 },
];

const stuckUsers: OnboardingUser[] = [
  { id: '1', email: 'user_482@example.com', stage: 'niche', startedAt: new Date(Date.now() - 72*60*60*1000), lastActivity: new Date(Date.now() - 48*60*60*1000) },
  { id: '2', email: 'dev_991@example.com', stage: 'config', startedAt: new Date(Date.now() - 96*60*60*1000), lastActivity: new Date(Date.now() - 72*60*60*1000) },
  { id: '3', email: 'test_user@example.com', stage: 'workspace', startedAt: new Date(Date.now() - 84*60*60*1000), lastActivity: new Date(Date.now() - 60*60*60*1000) },
];

const readyToActivate: OnboardingUser[] = [
  { id: '4', email: 'launch@company.com', stage: 'template', startedAt: new Date(Date.now() - 2*60*60*1000), lastActivity: new Date(Date.now() - 30*60*1000), workspaceName: 'LaunchCo', niche: 'launchpad' },
  { id: '5', email: 'events@pro.com', stage: 'template', startedAt: new Date(Date.now() - 4*60*60*1000), lastActivity: new Date(Date.now() - 1*60*60*1000), workspaceName: 'EventPro', niche: 'events' },
  { id: '6', email: 'shop@new.com', stage: 'template', startedAt: new Date(Date.now() - 6*60*60*1000), lastActivity: new Date(Date.now() - 2*60*60*1000), workspaceName: 'ShopNew', niche: 'ecommerce' },
];

const completedToday: OnboardingUser[] = [
  { id: '7', email: 'acme@corp.com', stage: 'done', startedAt: new Date(Date.now() - 24*60*60*1000), lastActivity: new Date(Date.now() - 14*60*1000), workspaceName: 'Acme Corp', niche: 'ecommerce' },
  { id: '8', email: 'beta@startup.io', stage: 'done', startedAt: new Date(Date.now() - 12*60*60*1000), lastActivity: new Date(Date.now() - 2*60*60*1000), workspaceName: 'BetaStartup', niche: 'launchpad' },
  { id: '9', email: 'conf@tech.com', stage: 'done', startedAt: new Date(Date.now() - 8*60*60*1000), lastActivity: new Date(Date.now() - 1*60*60*1000), workspaceName: 'TechConf', niche: 'events' },
];

export default function OnboardingPage() {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const getProgressPercentage = () => {
    const total = stages.reduce((sum, s) => sum + s.count, 0);
    const completed = stages.find(s => s.id === 'done')?.count || 0;
    const inProgress = total - completed - (stages.find(s => s.id === 'auth')?.count || 0);
    return Math.round((inProgress / (total - (stages.find(s => s.id === 'done')?.count || 0))) * 100);
  };

  const formatTimeAgo = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTimeSinceStart = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Onboarding Queue</h1>
          <p className="text-gray-400 mt-1">Monitor and intervene in tenant creation flow</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Pipeline Progress */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Pipeline Progress</span>
            <span className="text-sm text-white">{getProgressPercentage()}% in progress</span>
          </div>
          <div className="flex items-center gap-1">
            {stages.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <div 
                  className={`flex-1 h-2 rounded-full ${
                    stage.id === 'done' ? 'bg-green-500' : 
                    idx < 3 ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
                {idx < stages.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-gray-500" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            {stages.map((stage) => (
              <div key={stage.id} className="text-center">
                <div className="font-medium text-gray-300">{stage.label}</div>
                <div>{stage.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stuck Users */}
        <Card variant="glass" className="border-red-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                Stuck {'>'}72hrs
              </CardTitle>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                {stuckUsers.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {stuckUsers.map((user) => (
              <div 
                key={user.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-medium text-white truncate">{user.email}</div>
                  <span className="text-xs text-red-400">{getTimeSinceStart(user.startedAt)}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Stuck at: <span className="text-gray-300 capitalize">{user.stage}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                  <Send className="h-3 w-3 mr-1" />
                  Nudge
                </Button>
              </div>
            ))}
            {stuckUsers.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No stuck users
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ready to Activate */}
        <Card variant="glass" className="border-green-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                Ready to Activate
              </CardTitle>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                {readyToActivate.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {readyToActivate.map((user) => (
              <div 
                key={user.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-green-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="text-sm font-medium text-white">{user.workspaceName}</div>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 capitalize">
                    {user.niche}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{user.email}</div>
                <Button size="sm" className="w-full h-7 text-xs bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approve
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Completed Today */}
        <Card variant="glass" className="border-purple-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-purple-400">
                <Clock className="h-4 w-4" />
                Completed Today
              </CardTitle>
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                {completedToday.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {completedToday.map((user) => (
              <div 
                key={user.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="text-sm font-medium text-white">{user.workspaceName}</div>
                  <span className="text-xs text-gray-500">{formatTimeAgo(user.lastActivity)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 capitalize">
                    {user.niche}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Analysis */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base">Drop-off Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {stages.slice(0, -1).map((stage, idx) => {
              const dropOffRate = idx === 0 ? 12 : idx === 1 ? 8 : idx === 2 ? 15 : idx === 3 ? 5 : 3;
              return (
                <div key={stage.id} className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{dropOffRate}%</div>
                  <div className="text-xs text-gray-400 capitalize">{stage.label}</div>
                  <div className="text-xs text-red-400 mt-1">-{Math.round(stage.count * dropOffRate / 100)} users</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Send Reminder to Stuck Users
        </Button>
        <Button variant="outline" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Approve All Ready ({readyToActivate.length})
        </Button>
      </div>
    </div>
  );
}
