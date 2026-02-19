'use client';

import React from 'react';
import { X, ExternalLink, Edit, User, Mail, HardDrive, Users, Calendar, AlertTriangle, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  niche?: string;
  status?: string;
  created_at: string;
  settings?: {
    modules?: string[];
  };
}

interface TenantDrawerProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  onImpersonate?: (tenantId: string) => void;
  onSuspend?: (tenantId: string) => void;
  onDelete?: (tenantId: string) => void;
}

export function TenantDrawer({ tenant, isOpen, onClose, onImpersonate, onSuspend, onDelete }: TenantDrawerProps) {
  if (!isOpen || !tenant) return null;

  const modules = tenant.settings?.modules || [];
  const isActive = tenant.status !== 'suspended';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-white/10 z-50 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{tenant.name}</h2>
              <button className="p-1 hover:bg-white/10 rounded">
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 font-mono">{tenant.slug}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-white/10">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onImpersonate?.(tenant.id)}
            >
              <User className="h-4 w-4 mr-1" />
              Impersonate
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-xs font-medium text-gray-400 uppercase mb-3">Status</h3>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-white">
              {isActive ? 'Active' : 'Suspended'}
            </span>
            <span className="text-xs text-gray-500">
              since {new Date(tenant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          {tenant.niche && (
            <div className="mt-2">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 capitalize">
                {tenant.niche}
              </span>
            </div>
          )}
        </div>

        {/* Owner */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-xs font-medium text-gray-400 uppercase mb-3">Owner</h3>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-white">admin@{tenant.slug}.com</p>
              <button className="text-xs text-blue-400 hover:underline">Reset password</button>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="p-4 border-b border-white/10">
          <h3 className="text-xs font-medium text-gray-400 uppercase mb-3">Usage</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Seats
                </span>
                <span className="text-white">3 / 10</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <HardDrive className="h-3 w-3" /> Storage
                </span>
                <span className="text-white">2.4GB / 10GB</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Events this month</span>
              <span className="text-white">47,231</span>
            </div>
          </div>
        </div>

        {/* Modules */}
        {modules.length > 0 && (
          <div className="p-4 border-b border-white/10">
            <h3 className="text-xs font-medium text-gray-400 uppercase mb-3">Enabled Modules</h3>
            <div className="flex flex-wrap gap-2">
              {modules.map((module) => (
                <span 
                  key={module}
                  className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 capitalize"
                >
                  {module}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="p-4">
          <h3 className="text-xs font-medium text-gray-400 uppercase mb-3">Danger Zone</h3>
          <div className="space-y-2">
            <button 
              onClick={() => onSuspend?.(tenant.id)}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all text-sm"
            >
              <AlertTriangle className="h-4 w-4" />
              {isActive ? 'Suspend workspace' : 'Unsuspend workspace'}
            </button>
            <button 
              onClick={() => onDelete?.(tenant.id)}
              className="w-full flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete workspace...
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
