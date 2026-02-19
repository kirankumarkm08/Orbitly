'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Settings, 
  Shield, 
  Mail, 
  Webhook, 
  CreditCard,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Search
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  ip: string;
  timestamp: Date;
}

const auditLogs: AuditLog[] = [
  { id: '1', action: 'tenant.created', actor: 'admin@example.com', target: 'Acme Corp', ip: '192.168.1.1', timestamp: new Date(Date.now() - 5*60*1000) },
  { id: '2', action: 'user.role_updated', actor: 'admin@example.com', target: 'user@acme.com', ip: '192.168.1.1', timestamp: new Date(Date.now() - 12*60*1000) },
  { id: '3', action: 'tenant.suspended', actor: 'support@example.com', target: 'BadActor Inc', ip: '192.168.1.2', timestamp: new Date(Date.now() - 25*60*1000) },
  { id: '4', action: 'maintenance.enabled', actor: 'admin@example.com', target: 'Platform', ip: '192.168.1.1', timestamp: new Date(Date.now() - 45*60*1000) },
  { id: '5', action: 'settings.updated', actor: 'admin@example.com', target: 'Email Provider', ip: '192.168.1.1', timestamp: new Date(Date.now() - 60*60*1000) },
];

export default function SystemPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [signupRestricted, setSignupRestricted] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState('company.com\nenterprise.org');
  const [defaultPlan, setDefaultPlan] = useState('free');
  const [defaultNiche, setDefaultNiche] = useState('static');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = () => {
    console.log('Saving settings...');
  };

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('enabled')) return 'text-green-400';
    if (action.includes('deleted') || action.includes('suspended')) return 'text-red-400';
    if (action.includes('updated')) return 'text-blue-400';
    return 'text-gray-400';
  };

  const formatAction = (action: string) => {
    return action.split('.').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">System Configuration</h1>
        <p className="text-gray-400 mt-1">Platform-level settings and audit logs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Access Control */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-400" />
                Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <div className="text-sm font-medium text-white">Maintenance Mode</div>
                  <div className="text-xs text-gray-500 mt-1">Block all non-admin access</div>
                </div>
                <button
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    maintenanceMode ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      maintenanceMode ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-medium text-white">Restrict Signups</div>
                    <div className="text-xs text-gray-500 mt-1">Only allow specific email domains</div>
                  </div>
                  <button
                    onClick={() => setSignupRestricted(!signupRestricted)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      signupRestricted ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        signupRestricted ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
                {signupRestricted && (
                  <textarea
                    value={allowedDomains}
                    onChange={(e) => setAllowedDomains(e.target.value)}
                    placeholder="Enter allowed domains, one per line"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Defaults */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-400" />
                Default Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Default Plan</label>
                  <select
                    value={defaultPlan}
                    onChange={(e) => setDefaultPlan(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="free" className="bg-gray-800">Free</option>
                    <option value="pro" className="bg-gray-800">Pro</option>
                    <option value="enterprise" className="bg-gray-800">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Default Niche</label>
                  <select
                    value={defaultNiche}
                    onChange={(e) => setDefaultNiche(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="static" className="bg-gray-800">Static Website</option>
                    <option value="ecommerce" className="bg-gray-800">E-commerce</option>
                    <option value="events" className="bg-gray-800">Events</option>
                    <option value="launchpad" className="bg-gray-800">Launchpad</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card variant="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-400" />
                Integrations Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-purple-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Stripe Connect</div>
                      <div className="text-xs text-gray-500">Payment processing</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-400">Connected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="text-sm font-medium text-white">SendGrid</div>
                      <div className="text-xs text-gray-500">Email delivery</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs text-green-400">Connected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Webhook className="h-5 w-5 text-orange-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Webhook Endpoints</div>
                      <div className="text-xs text-gray-500">3 endpoints configured</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>

        {/* Audit Log */}
        <Card variant="glass" className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              Audit Log
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id}
                  className="p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className={`text-xs font-medium ${getActionColor(log.action)}`}>
                    {formatAction(log.action)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    <span className="text-gray-400">{log.actor}</span> → {log.target}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                    <span>{log.ip}</span>
                    <span>{Math.round((Date.now() - log.timestamp.getTime()) / 60000)}m ago</span>
                  </div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-xs">
                  No logs found
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs">
              View Full Audit Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
