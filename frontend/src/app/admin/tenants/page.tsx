'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, MoreVertical, Edit, Trash2 } from 'lucide-react';


// Mock data
const mockTenants = [
  { id: '1', name: 'Acme Corp', domain: 'acme', users: 24, pages: 156, created: '2024-01-15' },
  { id: '2', name: 'Tech Startup', domain: 'techstart', users: 12, pages: 89, created: '2024-02-01' },
  { id: '3', name: 'Design Studio', domain: 'designco', users: 8, pages: 45, created: '2024-02-10' },
  { id: '4', name: 'E-Shop', domain: 'eshop', users: 32, pages: 234, created: '2024-01-20' },
];

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTenants = mockTenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tenants</h1>
            <p className="text-muted-foreground mt-1">Manage all tenants in the system</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Tenant
          </Button>
        </div>

        {/* Search */}
        <Card variant="glass">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border"
              />
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
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Domain</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Users</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pages</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="border-b border-border hover:bg-muted transition-all"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-foreground">
                              {tenant.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{tenant.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{tenant.domain}</td>
                      <td className="py-4 px-4 text-muted-foreground">{tenant.users}</td>
                      <td className="py-4 px-4 text-muted-foreground">{tenant.pages}</td>
                      <td className="py-4 px-4 text-muted-foreground">{tenant.created}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

  );
}
