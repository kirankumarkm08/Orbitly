'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Save, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Webhook, 
  Info,
  RefreshCw,
  Download,
  AlertTriangle
} from 'lucide-react';

import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'backup', name: 'Backup & API', icon: Database },
  ];

  return (

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your organization's platform settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl border border-border w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-primary text-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="max-w-4xl space-y-6">
          {activeTab === 'general' && (
            <Card variant="glass" className="border-border">
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Platform details and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary-foreground">Tenant Name</label>
                    <Input defaultValue="Rare Evo" className="bg-muted border-border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary-foreground">Platform Version</label>
                    <Input defaultValue="2.5.0" disabled className="bg-muted border-border opacity-50 cursor-not-allowed" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3 text-sm text-blue-400">
                  <Info className="h-5 w-5 shrink-0" />
                  <p>Updates are applied automatically. Your platform is currently running the latest stable release.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card variant="glass" className="border-border">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'New User Registration', desc: 'Notify when a new user signs up', default: true },
                  { name: 'Form Submissions', desc: 'Daily summary of form data', default: true },
                  { name: 'System Alerts', desc: 'Critical security and health notifications', default: true },
                  { name: 'Monthly Reports', desc: 'Comprehensive analytics overview', default: false },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'backup' && (
            <>
              <Card variant="glass" className="border-border">
                <CardHeader>
                  <CardTitle>Data & Backups</CardTitle>
                  <CardDescription>Manage your organization's data integrity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Daily Cloud Backups</p>
                        <p className="text-xs text-muted-foreground">Next backup in 12 hours</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="bg-muted border-border">Run Now</Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2 bg-muted border-border">
                      <Download className="h-4 w-4" /> Export All Content
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 bg-muted border-border">
                      <RefreshCw className="h-4 w-4" /> Restore Point
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" className="border-border">
                <CardHeader>
                  <CardTitle>API & Webhooks</CardTitle>
                  <CardDescription>Connect external services to your platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-secondary-foreground">API Key</label>
                    <div className="flex gap-2">
                      <Input value="re_live_51P2zXp9uJq6..." readOnly className="bg-muted border-border font-mono text-xs" />
                      <Button variant="outline" className="bg-muted border-border">Copy</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                    <div className="flex items-center gap-3">
                      <Webhook className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="font-medium text-foreground">Webhook Endpoint</p>
                        <p className="text-xs text-muted-foreground">0 events currently configured</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="bg-muted border-border">Configure</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'security' && (
            <Card variant="glass" className="border-border">
              <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
                <CardDescription>Maintain a secure environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border">
                  <div>
                    <p className="font-medium text-foreground">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Put your site offline for visitors</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-destructive">Delete Organization</p>
                    <p className="text-xs text-muted-foreground">Permanently delete all data, customers, and content. This action cannot be undone.</p>
                    <Button variant="outline" className="mt-3 border-red-500/50 text-red-500 hover:bg-destructive/10 h-8 text-xs">Delete Permanently</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" className="border-border bg-muted">Cancel</Button>
            <Button className="gap-2 px-8">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>

  );
}
