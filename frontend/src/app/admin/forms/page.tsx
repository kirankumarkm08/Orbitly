'use client';

import React, { useState, useEffect } from 'react';

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
  MoreVertical,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formsApi } from '@/lib/api';

interface Form {
  id: string;
  name: string;
  description: string;
  submissions: number;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  type: string;
  fields?: any[];
}

export default function FormsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadForms();
  }, [statusFilter, searchQuery]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      
      const result = await formsApi.list(params);
      const mappedForms: Form[] = (result.data || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        description: f.description || '',
        submissions: f.submissions_count || 0,
        status: f.status || 'draft',
        createdAt: f.created_at ? new Date(f.created_at).toISOString().split('T')[0] : '-',
        type: f.settings?.type || 'General',
        fields: f.fields || [],
      }));
      setForms(mappedForms);
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async () => {
    const name = prompt('Enter form name:');
    if (!name) return;
    
    try {
      await formsApi.create({ name, status: 'draft' });
      loadForms();
    } catch (error) {
      console.error('Failed to create form:', error);
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form? All submissions will be lost.')) return;
    
    try {
      await formsApi.delete(id);
      loadForms();
    } catch (error) {
      console.error('Failed to delete form:', error);
    }
  };

  const handleToggleStatus = async (form: Form) => {
    try {
      const newStatus = form.status === 'active' ? 'draft' : 'active';
      await formsApi.update(form.id, { status: newStatus });
      loadForms();
    } catch (error) {
      console.error('Failed to update form status:', error);
    }
  };

  const filteredForms = forms.filter(form => 
    form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSubmissions = forms.reduce((acc, f) => acc + f.submissions, 0);
  const activeForms = forms.filter(f => f.status === 'active').length;

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Forms</h1>
            <p className="text-muted-foreground mt-1">Create and manage data collection forms</p>
          </div>
          <Button onClick={handleCreateForm} className="gap-2">
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
                  <p className="text-2xl font-bold text-foreground">{totalSubmissions.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold text-foreground">{activeForms}</p>
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
                  <p className="text-sm text-muted-foreground">Total Forms</p>
                  <p className="text-2xl font-bold text-foreground">{forms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search forms by name or type..." 
              className="pl-10 bg-muted border-border h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-12"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Forms List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleToggleStatus(form)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteForm(form.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredForms.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            No forms found. Click "Create New Form" to get started.
          </div>
        )}
      </div>
  );
}
