'use client';

import React, { useState } from 'react';

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
  Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  joinedDate: string;
  ltv: number; // Lifetime Value
}

const mockCustomers: Customer[] = [
  { id: '1', name: 'Alice Freeman', email: 'alice@example.com', phone: '+1 234 567 890', status: 'active', joinedDate: '2023-12-15', ltv: 1250 },
  { id: '2', name: 'Bob Wilson', email: 'bob@techcorp.com', phone: '+1 987 654 321', status: 'active', joinedDate: '2024-01-05', ltv: 850 },
  { id: '3', name: 'Charlie Dave', email: 'charlie@web.com', phone: '+1 555 123 456', status: 'lead', joinedDate: '2024-02-08', ltv: 0 },
  { id: '4', name: 'Diana Ross', email: 'diana@music.com', phone: '+1 444 777 888', status: 'inactive', joinedDate: '2023-11-20', ltv: 3200 },
];

export default function CustomersManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = mockCustomers.filter(customer => 
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
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Customer
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
            <Button variant="outline" className="gap-2 border-border bg-muted px-6">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card variant="glass" className="overflow-hidden border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
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
                          {customer.phone}
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
          </div>
        </Card>
      </div>

  );
}
