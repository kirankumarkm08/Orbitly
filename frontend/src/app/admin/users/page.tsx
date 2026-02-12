'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Shield, User, UserCog, Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@rareevo.com', role: 'admin', created: '2024-01-15', status: 'active' },
  { id: '2', name: 'Sarah Smith', email: 'sarah@rareevo.com', role: 'editor', created: '2024-02-01', status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'mike@rareevo.com', role: 'reviewer', created: '2024-02-10', status: 'pending' },
  { id: '4', name: 'Lisa Brown', email: 'lisa@rareevo.com', role: 'viewer', created: '2024-01-20', status: 'active' },
];

const roleColors: Record<string, string> = {
  admin: 'from-teal-500 to-cyan-600',
  editor: 'from-blue-500 to-cyan-600',
  reviewer: 'from-orange-500 to-amber-600',
  viewer: 'from-gray-500 to-slate-600',
};

const roleIcons: Record<string, any> = {
  admin: Shield,
  editor: UserCog,
  reviewer: User,
  viewer: User,
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
            <p className="text-muted-foreground mt-1">Manage your organization's administrators and editors</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {/* Filters */}
        <Card variant="glass" className="border-border">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  type="search"
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-accent border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-11"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="reviewer">Reviewer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredUsers.map((user) => {
            const RoleIcon = roleIcons[user.role] || User;
            return (
              <Card key={user.id} variant="glass" className="group border-border hover:border-primary/30 transition-all overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center shadow-lg shadow-black/20`}>
                      <span className="text-lg font-bold text-foreground">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RoleIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-secondary-foreground capitalize">{user.role}</span>
                      </div>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        user.status === 'active' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      )}>
                        {user.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                      Joined {user.created}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" className="flex-1 bg-muted border-border hover:bg-primary/10 h-9 text-xs">
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1 bg-muted border-border hover:bg-destructive/10 hover:text-destructive h-9 text-xs">
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
