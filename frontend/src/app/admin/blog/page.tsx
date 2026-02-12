'use client';

import React, { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Plus, 
  FileText, 
  User, 
  Tag, 
  Clock,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  FileEdit,
  BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'published' | 'draft' | 'review';
  date: string;
  views: number;
}

const mockPosts: BlogPost[] = [
  { id: '1', title: 'The Future of SaaS in 2026', author: 'Jane Doe', category: 'General', status: 'published', date: 'Feb 10, 2026', views: 5420 },
  { id: '2', title: 'Scaling Your Page Builder Business', author: 'John Smith', category: 'Tutorial', status: 'published', date: 'Feb 05, 2026', views: 2310 },
  { id: '3', title: 'New Feature Announcement: AI Forms', author: 'Admin', category: 'Product', status: 'review', date: 'Feb 12, 2026', views: 0 },
  { id: '4', title: 'Top 10 Design Trends for 2026', author: 'Jane Doe', category: 'Design', status: 'draft', date: 'Feb 08, 2026', views: 0 },
];

export default function BlogManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = mockPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog</h1>
            <p className="text-muted-foreground mt-1">Write and publish articles to your audience</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold text-foreground mt-1">7,730</p>
                  <p className="text-xs text-success mt-1">+12% from last week</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <BarChart2 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass" className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published Posts</p>
                  <p className="text-2xl font-bold text-foreground mt-1">2</p>
                  <p className="text-xs text-blue-400 mt-1">1 in review</p>
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
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-foreground mt-1">1</p>
                  <p className="text-xs text-warning mt-1">Ready to edit</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                  <FileEdit className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Actions */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search articles by title or category..." 
            className="pl-10 bg-muted border-border h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Posts List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} variant="glass" className="border-border group hover:bg-muted transition-all">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground leading-tight underline-offset-4 decoration-primary/50 group-hover:underline">
                        {post.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3 text-secondary" />
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {post.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 px-6 border-l border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Views</p>
                      <p className="text-xl font-bold text-foreground mt-1">{post.views.toLocaleString()}</p>
                    </div>
                    <div className="text-center min-w-[100px]">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        post.status === 'published' ? "bg-success/10 text-success" :
                        post.status === 'review' ? "bg-blue-500/10 text-blue-400" :
                        "bg-warning/10 text-warning"
                      )}>
                        {post.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
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
