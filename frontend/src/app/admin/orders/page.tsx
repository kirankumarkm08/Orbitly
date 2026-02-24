'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical, 
  ChevronRight,
  RefreshCcw,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ordersApi } from '@/lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await ordersApi.list(params);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'shipped':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled':
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5" />;
      case 'shipped':
        return <Package className="h-3.5 w-3.5" />;
      case 'cancelled':
      case 'failed':
        return <AlertCircle className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and fulfill your customer orders</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchOrders}>
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card variant="glass" className="border-border">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-muted/30">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders..." 
                className="pl-9 bg-background border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
                    statusFilter === status 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                      : "bg-background text-muted-foreground border-border hover:border-primary/30"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Total</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                        <p className="text-muted-foreground font-medium">No orders found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-primary">#{order.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">{order.users?.full_name || order.customer_email || 'Guest'}</span>
                          <span className="text-xs text-muted-foreground">{order.customer_email || order.users?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm">
                        ${Number(order.amount_total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn("gap-1.5 px-3 py-1", getStatusStyle(order.status))}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
