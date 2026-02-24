'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Shield, User, UserCog, Plus, MoreVertical, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usersApi } from '@/lib/api';

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'reviewer' | 'viewer';
  created: string;
  status: 'active' | 'pending';
  full_name?: string;
}

const roleColors: Record<string, string> = {
  owner: 'from-teal-500 to-cyan-600',
  admin: 'from-blue-500 to-cyan-600',
  editor: 'from-orange-500 to-amber-600',
  reviewer: 'from-purple-500 to-pink-600',
  viewer: 'from-gray-500 to-slate-600',
};

const roleIcons: Record<string, any> = {
  owner: Shield,
  admin: Shield,
  editor: UserCog,
  reviewer: User,
  viewer: User,
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (searchQuery) params.search = searchQuery;
      
      const result = await usersApi.list(params);
      const mappedUsers: TeamUser[] = (result.data || []).map((u: any) => ({
        id: u.id,
        name: u.full_name || u.email.split('@')[0],
        email: u.email,
        role: u.role || 'viewer',
        created: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '-',
        status: 'active', // Could add pending status based on invite
        full_name: u.full_name,
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setInviting(true);
      await usersApi.invite({
        email: inviteEmail,
        full_name: inviteName,
        role: inviteRole,
      });
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('viewer');
      loadUsers();
    } catch (error) {
      console.error('Failed to invite user:', error);
      alert('Failed to invite user. They may already be in the workspace.');
    } finally {
      setInviting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
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
          <Button onClick={() => setInviteModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {/* Invite Modal */}
        {inviteModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="reviewer">Reviewer</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setInviteModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={inviting}>
                      {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Invite'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

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
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="reviewer">Reviewer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredUsers.map((user) => {
              const RoleIcon = roleIcons[user.role] || User;
              return (
                <Card key={user.id} variant="glass" className="group border-border hover:border-primary/30 transition-all overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center shadow-lg shadow-black/20`}>
                        <span className="text-lg font-bold text-foreground">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</h3>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
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

                    {user.role !== 'owner' && (
                      <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" className="flex-1 bg-muted border-border hover:bg-primary/10 h-9 text-xs">
                          Edit
                        </Button>
                        <Button variant="outline" className="flex-1 bg-muted border-border hover:bg-destructive/10 hover:text-destructive h-9 text-xs">
                          Remove
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            No team members found. Click "Invite Member" to add someone.
          </div>
        )}
      </div>
  );
}
