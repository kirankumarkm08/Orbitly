'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, MoreVertical, User, Ban, Eye, ShoppingCart, Rocket, Calendar, FileText } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { CreateTenantDialog } from '@/components/admin/CreateTenantDialog';
import { TenantDrawer } from '@/components/admin/TenantDrawer';

const nicheIcons: Record<string, any> = {
  ecommerce: ShoppingCart,
  events: Calendar,
  launchpad: Rocket,
  static: FileText,
};

const nicheColors: Record<string, string> = {
  ecommerce: 'text-green-400 bg-green-500/20',
  events: 'text-purple-400 bg-purple-500/20',
  launchpad: 'text-orange-400 bg-orange-500/20',
  static: 'text-blue-400 bg-blue-500/20',
};

export default function TenantsPage() {
  const { tenants, isLoading, fetchTenants, createTenant, deleteTenant } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const filteredTenants = tenants.filter((tenant: any) => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant.slug && tenant.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesNiche = nicheFilter === 'all' || tenant.niche === nicheFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && tenant.status !== 'suspended') ||
      (statusFilter === 'suspended' && tenant.status === 'suspended');
    return matchesSearch && matchesNiche && matchesStatus;
  });
  
  const handleCreateTenant = async (data: any) => {
    await createTenant(data);
  };

  const handleTenantClick = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsDrawerOpen(true);
  };

  const handleImpersonate = (tenantId: string) => {
    console.log('Impersonating tenant:', tenantId);
    // Implement impersonation logic
  };

  const handleSuspend = (tenantId: string) => {
    console.log('Suspending tenant:', tenantId);
    // Implement suspend logic
  };

  const handleDelete = async (tenantId: string) => {
    if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      await deleteTenant(tenantId);
      setIsDrawerOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tenants</h1>
          <p className="text-gray-400 mt-1">Manage all workspaces in the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            Import
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Tenant
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search tenants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10"
                />
              </div>
            </div>
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-gray-800">All Niches</option>
              <option value="ecommerce" className="bg-gray-800">E-commerce</option>
              <option value="events" className="bg-gray-800">Events</option>
              <option value="launchpad" className="bg-gray-800">Launchpad</option>
              <option value="static" className="bg-gray-800">Static</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-gray-800">All Status</option>
              <option value="active" className="bg-gray-800">Active</option>
              <option value="suspended" className="bg-gray-800">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>All Tenants ({filteredTenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Workspace</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Niche</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Plan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Modules</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Last Active</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Loading tenants...
                      </div>
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="text-gray-400">No tenants found</div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setIsCreateOpen(true)}
                      >
                        Create your first tenant
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant: any) => {
                    const NicheIcon = nicheIcons[tenant.niche || 'static'] || FileText;
                    const nicheColor = nicheColors[tenant.niche || 'static'] || nicheColors.static;
                    const isActive = tenant.status !== 'suspended';
                    
                    return (
                      <tr
                        key={tenant.id}
                        onClick={() => handleTenantClick(tenant)}
                        className="border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {tenant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-white">{tenant.name}</span>
                              <p className="text-xs text-gray-500 font-mono">{tenant.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${nicheColor}`}>
                            <NicheIcon className="h-3 w-3" />
                            {tenant.niche || 'static'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tenant.plan === 'enterprise' ? 'bg-amber-500/20 text-amber-300' :
                            tenant.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-300' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {tenant.plan || 'Free'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-gray-300">{isActive ? 'Active' : 'Suspended'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {(tenant.settings?.modules || []).slice(0, 2).map((module: string) => (
                              <span key={module} className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                                {module}
                              </span>
                            ))}
                            {(tenant.settings?.modules?.length || 0) > 2 && (
                              <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                                +{tenant.settings?.modules?.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-400">
                          {new Date(tenant.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTenantClick(tenant);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImpersonate(tenant.id);
                              }}
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredTenants.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <span className="text-sm text-gray-400">
                Showing {filteredTenants.length} of {tenants.length} tenants
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>&lt;</Button>
                <Button variant="outline" size="sm" className="bg-white/10">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">&gt;</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <CreateTenantDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSubmit={handleCreateTenant}
      />

      <TenantDrawer
        tenant={selectedTenant}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onImpersonate={handleImpersonate}
        onSuspend={handleSuspend}
        onDelete={handleDelete}
      />
    </div>
  );
}
