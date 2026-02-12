'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Edit2,
  Trash2,
  MoreVertical,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  type: 'Physical' | 'Virtual' | 'Hybrid';
  status: 'active' | 'upcoming' | 'draft' | 'completed';
  date: string;
  location: string;
  attendees: number;
}

const mockEvents: Event[] = [
  { id: '1', title: 'Tech Innovation Summit 2026', type: 'Physical', status: 'upcoming', date: 'Feb 15, 2026', location: 'Convention Center, NY', attendees: 1250 },
  { id: '2', title: 'Web3 Future Webinar', type: 'Virtual', status: 'upcoming', date: 'Feb 22, 2026', location: 'Zoom / YouTube Live', attendees: 4500 },
  { id: '3', title: 'Community Meetup', type: 'Hybrid', status: 'draft', date: 'Mar 05, 2026', location: 'London Office + Online', attendees: 0 },
  { id: '4', title: 'Rare Evo Launch Event', type: 'Physical', status: 'completed', date: 'Jan 10, 2026', location: 'Miami Beach', attendees: 840 },
];

export default function EventsManagement() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = mockEvents.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground mt-1">Plan and manage your organization's events</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Active', value: '0', color: 'text-success' },
            { label: 'Upcoming', value: '2', color: 'text-blue-400' },
            { label: 'Draft', value: '1', color: 'text-warning' },
            { label: 'Total', value: '4', color: 'text-muted-foreground' },
          ].map((stat) => (
            <Card key={stat.label} variant="glass" className="border-border">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{stat.label}</p>
                <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events by title or location..." 
            className="pl-10 bg-muted border-border h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} variant="glass" className="group border-border hover:border-primary/30 transition-all overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        event.status === 'upcoming' ? "bg-blue-500/10 text-blue-400" :
                        event.status === 'completed' ? "bg-success/10 text-success" :
                        "bg-warning/10 text-warning"
                      )}>
                        {event.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">•</span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        {event.type === 'Virtual' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                        {event.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {event.title}
                    </h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-secondary" />
                    {event.attendees.toLocaleString()} Registered
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex gap-2">
                  <Button variant="outline" className="flex-1 bg-muted border-border hover:bg-primary/10 hover:border-primary/30 h-10">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" className="px-3 bg-muted border-border hover:bg-destructive/10 hover:border-red-500/30 hover:text-destructive h-10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
