'use client';

import React, { useState } from 'react';
import AIBlockGenerator from '@/components/page-builder/AIBlockGenerator';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Plus, 
  Box, 
  Package, 
  Layers,
  Settings,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Grid,
  Image,
  Text,
  FormInput,
  Mail,
  ShoppingCart,
  Calendar,
  MessageSquare,
  FileText,
  BarChart2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleBlock {
  id: string;
  name: string;
  description: string;
  category: 'layout' | 'content' | 'form' | 'ecommerce' | 'media' | 'utility';
  status: 'active' | 'inactive' | 'beta';
  icon: string;
  lastUpdated: string;
}

const mockModules: ModuleBlock[] = [
  { id: '1', name: 'Hero Section', description: 'Full-width hero banner with CTA', category: 'layout', status: 'active', icon: 'Layout', lastUpdated: 'Feb 15, 2026' },
  { id: '2', name: 'Text Block', description: 'Rich text content block', category: 'content', status: 'active', icon: 'Text', lastUpdated: 'Feb 14, 2026' },
  { id: '3', name: 'Image Gallery', description: 'Grid-based image gallery', category: 'media', status: 'active', icon: 'Image', lastUpdated: 'Feb 12, 2026' },
  { id: '4', name: 'Contact Form', description: 'Lead capture contact form', category: 'form', status: 'active', icon: 'FormInput', lastUpdated: 'Feb 10, 2026' },
  { id: '5', name: 'Product Grid', description: 'E-commerce product display', category: 'ecommerce', status: 'active', icon: 'Grid', lastUpdated: 'Feb 08, 2026' },
  { id: '6', name: 'Newsletter Signup', description: 'Email subscription block', category: 'form', status: 'beta', icon: 'Mail', lastUpdated: 'Feb 18, 2026' },
  { id: '7', name: 'Event Calendar', description: 'Events listing and calendar', category: 'utility', status: 'active', icon: 'Calendar', lastUpdated: 'Feb 05, 2026' },
  { id: '8', name: 'Testimonials', description: 'Customer reviews carousel', category: 'content', status: 'inactive', icon: 'MessageSquare', lastUpdated: 'Jan 20, 2026' },
  { id: '9', name: 'FAQ Section', description: 'Accordion FAQ blocks', category: 'content', status: 'active', icon: 'FileText', lastUpdated: 'Feb 01, 2026' },
  { id: '10', name: 'Stats Counter', description: 'Animated number counters', category: 'utility', status: 'beta', icon: 'BarChart2', lastUpdated: 'Feb 17, 2026' },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: Layers,
  content: Text,
  form: FormInput,
  ecommerce: ShoppingCart,
  media: Image,
  utility: Sparkles,
};

const categoryColors: Record<string, string> = {
  layout: 'bg-blue-500/10 text-blue-400',
  content: 'bg-green-500/10 text-green-400',
  form: 'bg-purple-500/10 text-purple-400',
  ecommerce: 'bg-orange-500/10 text-orange-400',
  media: 'bg-pink-500/10 text-pink-400',
  utility: 'bg-cyan-500/10 text-cyan-400',
};

export default function ModulesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modules, setModules] = useState<ModuleBlock[]>(mockModules);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || module.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleModuleStatus = (id: string) => {
    setModules(modules.map(m => 
      m.id === id 
        ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
        : m
    ));
  };

  const activeModules = modules.filter(m => m.status === 'active').length;
  const betaModules = modules.filter(m => m.status === 'beta').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Modules</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your content blocks and modules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAIGenerator(true)}
            className="gap-2 bg-gradient-to-r from-purple-500/10 to-primary/10 border-purple-500/30 hover:from-purple-500/20 hover:to-primary/20"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-purple-600 dark:text-purple-400">Generate with AI</span>
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass" className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Modules</p>
                <p className="text-2xl font-bold text-foreground mt-1">{modules.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground mt-1">{activeModules}</p>
                <p className="text-xs text-success mt-1">Available to use</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Beta</p>
                <p className="text-2xl font-bold text-foreground mt-1">{betaModules}</p>
                <p className="text-xs text-blue-400 mt-1">Testing phase</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="glass" className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-foreground mt-1">{modules.length - activeModules - betaModules}</p>
                <p className="text-xs text-muted-foreground mt-1">Disabled</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <ToggleLeft className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            categoryFilter === 'all' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          All
        </button>
        {Object.keys(categoryIcons).map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all flex items-center gap-2",
              categoryFilter === category 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {React.createElement(categoryIcons[category], { className: "h-4 w-4" })}
            {category}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search modules by name or description..." 
          className="pl-10 bg-muted border-border h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((module) => {
          const IconComponent = categoryIcons[module.category] || Box;
          return (
            <Card key={module.id} variant="glass" className="border-border group hover:bg-muted transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", categoryColors[module.category])}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <button
                    onClick={() => toggleModuleStatus(module.id)}
                    className="text-muted-foreground hover:text-foreground transition-all"
                  >
                    {module.status === 'active' ? (
                      <ToggleRight className="h-6 w-6 text-success" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-foreground">{module.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{module.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    module.status === 'active' ? "bg-success/10 text-success" :
                    module.status === 'beta' ? "bg-blue-500/10 text-blue-400" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {module.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{module.lastUpdated}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 gap-2 text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No modules found matching your criteria</p>
        </div>
      )}

      {/* AI Block Generator Modal */}
      <AIBlockGenerator
        isOpen={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onInsert={(block) => {
          const newModule: ModuleBlock = {
            id: Date.now().toString(),
            name: 'AI Block',
            description: 'AI-generated block',
            category: 'content',
            status: 'active',
            icon: 'Sparkles',
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
          setModules(prev => [newModule, ...prev]);
        }}
      />
    </div>
  );
}
