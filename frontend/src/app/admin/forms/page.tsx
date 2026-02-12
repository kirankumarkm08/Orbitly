'use client';

import React, { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  ClipboardList, 
  Edit2, 
  Trash2, 
  Download,
  Settings,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Form {
  id: string;
  name: string;
  submissions: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  type: string;
}

const mockForms: Form[] = [
  { id: '1', name: 'Contact Inquiry', submissions: 156, status: 'active', createdAt: '2024-01-20', type: 'Support' },
  { id: '2', name: 'Waitlist Registration', submissions: 2430, status: 'active', createdAt: '2024-01-15', type: 'Growth' },
  { id: '3', name: 'Customer Feedback', submissions: 42, status: 'active', createdAt: '2024-02-01', type: 'Survey' },
  { id: '4', name: 'Event Signup', submissions: 0, status: 'draft', createdAt: '2024-02-10', type: 'Event' },
  { id: '5', name: 'Old Survey', submissions: 89, status: 'archived', createdAt: '2023-11-20', type: 'Survey' },
];

export default function FormsManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredForms = mockForms.filter(form => 
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Forms</h1>
            <p className="text-muted-foreground mt-1">Create and manage data collection forms</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Form
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="border-border bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold text-foreground">2,717</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" className="border-border bg-green-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center text-success">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Forms</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
           <Card variant="glass" className="border-border bg-blue-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold text-foreground">+12%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search forms by name or type..." 
            className="pl-10 bg-muted border-border h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Forms List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredForms.map((form) => (
            <Card key={form.id} variant="glass" className="border-border group hover:border-primary/30 transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center text-foreground glow",
                      form.status === 'active' ? "bg-gradient-to-br from-green-500 to-emerald-600" :
                      form.status === 'draft' ? "bg-gradient-to-br from-yellow-500 to-orange-600" :
                      "bg-gradient-to-br from-gray-500 to-gray-600"
                    )}>
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {form.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-secondary font-medium uppercase tracking-wider">{form.type}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs text-muted-foreground">Created {form.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 px-6 border-l border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Submissions</p>
                      <p className="text-xl font-bold text-foreground mt-1">{form.submissions.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Status</p>
                      <span className={cn(
                        "inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        form.status === 'active' ? "bg-success/10 text-success" :
                        form.status === 'draft' ? "bg-warning/10 text-warning" :
                        "bg-destructive/10 text-destructive"
                      )}>
                        {form.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  );
}
