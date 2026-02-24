'use client';

import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar,
  MoreVertical,
  Filter,
  Download,
  ShieldCheck,
  Ban,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { customersApi } from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  joinedDate: string;
  ltv: number;
  total_orders?: number;
  first_order_date?: string;
  last_order_date?: string;
}

export default function CustomersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadCustomers();
  }, [statusFilter, searchQuery]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      
      const result = await customersApi.list(params);
      const mappedCustomers: Customer[] = (result.data || []).map((c: any) => ({
        id: c.id,
        name: c.full_name || c.email.split('@')[0],
        email: c.email,
        phone: c.phone || '',
        status: c.status || 'lead',
        joinedDate: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '-',
        ltv: Number(c.total_spent || 0),
        total_orders: c.total_orders || 0,
        first_order_date: c.first_order_date,
        last_order_date: c.last_order_date,
      }));
      setCustomers(mappedCustomers);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCustomers = async () => {
    try {
      await customersApi.sync();
      loadCustomers();
    } catch (error) {
      console.error('Failed to sync customers:', error);
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customers</h1>
            <p className="text-muted-foreground mt-1">Manage relationships and track engagement</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 border-border bg-muted">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleSyncCustomers} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Sync from Orders
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <Card variant="glass" className="border-border">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers by name, email..." 
                className="pl-10 bg-muted border-border h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-11"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="lead">Lead</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button variant="outline" className="gap-2 border-border bg-muted px-6">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card variant="glass" className="overflow-hidden border-border">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Orders</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">LTV</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-muted transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-border">
                            <span className="text-sm font-bold text-foreground">{customer.name[0]}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {customer.phone || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          customer.status === 'active' ? "bg-success/10 text-success" :
                          customer.status === 'lead' ? "bg-blue-500/10 text-blue-400" :
                          "bg-gray-500/10 text-muted-foreground"
                        )}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {customer.joinedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                        {customer.total_orders || 0}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-foreground">
                        ${customer.ltv.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive text-red-500/50">
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No customers found. Click "Sync from Orders" to import customers.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
  );
}
