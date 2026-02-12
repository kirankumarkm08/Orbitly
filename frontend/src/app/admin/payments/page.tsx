'use client';

import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft,
  CreditCard, Wallet, ChevronRight, ExternalLink, Plus, Send,
  ShieldCheck, Key, Bell, Receipt, MoreHorizontal,
  Users, BarChart3, CircleDollarSign, Zap, Eye, EyeOff,
  ArrowRight, Clock, CheckCircle2, XCircle, Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const transactions = [
  { id: '1', name: 'Alice Freeman', avatar: 'AF', amount: 49.00, type: 'incoming' as const, status: 'succeeded' as const, method: 'Visa •••• 4242', time: '2 min ago' },
  { id: '2', name: 'Bob Wilson', avatar: 'BW', amount: 99.00, type: 'incoming' as const, status: 'succeeded' as const, method: 'PayPal', time: '15 min ago' },
  { id: '3', name: 'Charlie Dave', avatar: 'CD', amount: 25.00, type: 'outgoing' as const, status: 'pending' as const, method: 'Visa •••• 5555', time: '1 hr ago' },
  { id: '4', name: 'Diana Ross', avatar: 'DR', amount: 150.00, type: 'incoming' as const, status: 'failed' as const, method: 'Mastercard •••• 8888', time: '3 hrs ago' },
  { id: '5', name: 'Eve Martinez', avatar: 'EM', amount: 75.00, type: 'incoming' as const, status: 'succeeded' as const, method: 'Stripe', time: '5 hrs ago' },
];

const revenueData = [35, 55, 42, 68, 50, 75, 62, 85, 70, 90, 78, 95];

export default function PaymentsManagement() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [chartTab, setChartTab] = useState<'weekly' | 'monthly'>('monthly');
  const maxBarHeight = Math.max(...revenueData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-secondary-foreground mt-1">Manage revenue, payouts, and billing</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-darkbtn text-foreground px-4 py-2.5 text-sm font-medium hover:bg-darkbtn-hover transition-colors">
          <ExternalLink className="h-4 w-4" />
          Stripe Dashboard
        </button>
      </div>

      {/* ===== Main 3-Column Grid ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ===== LEFT COLUMN (4 cols) ===== */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Hero Balance Card */}
          <div className="rounded-2xl bg-primary relative overflow-hidden p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-400/30 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground">SA</span>
                  </div>
                  <span className="text-sm text-white/70">Hi, Admin</span>
                </div>
                <button 
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-white/50 hover:text-foreground transition-colors"
                >
                  {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-5xl font-bold text-foreground tracking-tight mt-4">
                {balanceVisible ? '$42,745' : '••••••'}
              </p>
              <p className="text-sm text-white/60 mt-2">
                <span className="text-primary-100">+ $13,432</span> total balance
              </p>
              <div className="flex gap-3 mt-6">
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-accent text-foreground py-2.5 text-sm font-medium hover:bg-white/20 transition-colors">
                  <Send className="h-4 w-4" /> Transfer
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white text-primary py-2.5 text-sm font-bold hover:bg-primary-100 transition-colors">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Revenue Metric Tiles */}
          <div className="grid grid-cols-2 gap-4">
            {/* Subscriptions Tile */}
            <div className="rounded-2xl bg-card border border-border p-4 hover:shadow-md transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center text-[8px] text-primary">$</div>
                  <div className="w-6 h-6 rounded-full bg-success/10 border-2 border-card flex items-center justify-center text-[8px] text-success">€</div>
                  <div className="w-6 h-6 rounded-full bg-warning/10 border-2 border-card flex items-center justify-center text-[8px] text-warning">£</div>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">+15</span>
              </div>
              <p className="text-xs text-secondary-foreground">Subscriptions</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xs text-success font-medium">▲ 12.05%</span>
              </div>
              <div className="flex items-end gap-0.5 h-8 mt-3">
                {[3,5,4,7,6,8,7,9,8,10,9,11].map((v, i) => (
                  <div key={i} className="flex-1 bg-primary/15 group-hover:bg-primary/25 rounded-sm transition-colors" style={{ height: `${(v/11)*100}%` }} />
                ))}
              </div>
            </div>

            {/* MRR Tile */}
            <div className="rounded-2xl bg-card border border-border p-4 hover:shadow-md transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">MRR</span>
              </div>
              <p className="text-lg font-bold text-foreground">$2,356</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xs text-success font-medium">▲ 0.08%</span>
              </div>
              <div className="flex items-end gap-0.5 h-8 mt-3">
                {[5,6,4,8,7,9,6,10,8,11,9,12].map((v, i) => (
                  <div key={i} className="flex-1 bg-primary-400/20 group-hover:bg-primary-400/30 rounded-sm transition-colors" style={{ height: `${(v/12)*100}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Top Customer Card */}
          <div className="rounded-2xl bg-card border border-border p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-foreground">JC</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Jameson Cole</p>
                <p className="text-xs text-muted-foreground">Top Subscriber</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl bg-success/5 border border-success/10 p-3 text-center">
                <CircleDollarSign className="h-4 w-4 text-success mx-auto mb-1" />
                <p className="text-xs text-secondary-foreground">Revenue</p>
                <p className="text-sm font-bold text-success">$3,845</p>
              </div>
              <div className="rounded-xl bg-muted border border-border p-3 flex items-center gap-2">
                <div className="px-2 py-1 rounded bg-darkbtn text-foreground text-[10px] font-bold">VISA</div>
                <div>
                  <p className="text-xs text-muted-foreground">•••• 9471</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== CENTER COLUMN (5 cols) ===== */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Revenue Chart Card */}
          <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Earnings over time</p>
              </div>
              <div className="flex rounded-lg bg-muted p-0.5">
                <button
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    chartTab === 'weekly' ? "bg-primary text-foreground shadow-sm" : "text-secondary-foreground hover:text-foreground"
                  )}
                  onClick={() => setChartTab('weekly')}
                >
                  Weekly
                </button>
                <button
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    chartTab === 'monthly' ? "bg-primary text-foreground shadow-sm" : "text-secondary-foreground hover:text-foreground"
                  )}
                  onClick={() => setChartTab('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end gap-2 h-44">
              {revenueData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={cn(
                      "w-full rounded-md transition-all duration-500 cursor-pointer",
                      i === revenueData.length - 1 
                        ? "bg-primary opacity-100 shadow-md" 
                        : "bg-primary/15 hover:bg-primary/30"
                    )}
                    style={{ height: `${(val / maxBarHeight) * 100}%` }}
                    title={`$${(val * 100).toLocaleString()}`}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
                <p className="text-xs text-muted-foreground">Real-time business activity</p>
              </div>
              <button className="text-xs text-primary font-medium hover:text-primary-500 flex items-center gap-1">
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold",
                        tx.type === 'incoming' 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      )}>
                        {tx.avatar}
                      </div>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center border-2 border-card",
                        tx.type === 'incoming' ? "bg-success" : "bg-warning"
                      )}>
                        {tx.type === 'incoming' 
                          ? <ArrowDownLeft className="h-2.5 w-2.5 text-foreground" />
                          : <ArrowUpRight className="h-2.5 w-2.5 text-foreground" />
                        }
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.name}</p>
                      <p className="text-[11px] text-muted-foreground">{tx.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-semibold",
                      tx.type === 'incoming' ? "text-success" : "text-foreground"
                    )}>
                      {tx.type === 'incoming' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {tx.status === 'succeeded' ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : tx.status === 'failed' ? (
                        <XCircle className="h-3 w-3 text-destructive" />
                      ) : (
                        <Timer className="h-3 w-3 text-warning" />
                      )}
                      <span className={cn(
                        "text-[10px]",
                        tx.status === 'succeeded' ? "text-success" :
                        tx.status === 'failed' ? "text-destructive" : "text-warning"
                      )}>
                        {tx.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN (3 cols) ===== */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Send Payout Card */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Send Payout</h3>
              <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1.5">
                <DollarSign className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-medium text-foreground">USD</span>
              </div>
            </div>
            
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-5 mb-4">
              <p className="text-[10px] text-primary uppercase tracking-wider mb-1">You send</p>
              <div className="flex items-baseline gap-1">
                <input
                  type="text"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  className="bg-transparent text-3xl font-bold text-foreground outline-none w-full placeholder:text-muted-foreground/40"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">Balance: $42,745</p>
              </div>
            </div>

            {/* Preset Amounts */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {['50', '100', '500', 'Max'].map((val) => (
                <button
                  key={val}
                  className={cn(
                    "py-2 rounded-lg text-xs font-medium border transition-all",
                    payoutAmount === (val === 'Max' ? '42745' : val)
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted border-border text-secondary-foreground hover:border-primary/20 hover:text-foreground"
                  )}
                  onClick={() => setPayoutAmount(val === 'Max' ? '42745' : val)}
                >
                  {val === 'Max' ? 'Max' : `$${val}`}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground mb-4 leading-relaxed">
              Without any service fee. Minimum payout amount is $50. 
              Please check details carefully—payouts cannot be reversed.
            </p>

            <button 
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors",
                !payoutAmount || parseFloat(payoutAmount) < 50
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-darkbtn text-foreground hover:bg-darkbtn-hover"
              )}
              disabled={!payoutAmount || parseFloat(payoutAmount) < 50}
            >
              <Send className="h-4 w-4" />
              Send ${payoutAmount || '0.00'}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:shadow-sm transition-all">
              <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-sm font-bold text-foreground">98.2%</p>
              </div>
              <span className="text-[10px] text-success font-medium">+2.1%</span>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:shadow-sm transition-all">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Active Subs</p>
                <p className="text-sm font-bold text-foreground">1,240</p>
              </div>
              <span className="text-[10px] text-primary font-medium">+46</span>
            </div>
            <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 hover:shadow-sm transition-all">
              <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Avg. Order</p>
                <p className="text-sm font-bold text-foreground">$67.50</p>
              </div>
              <span className="text-[10px] text-warning font-medium">$+5.20</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Payment Settings Row ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Payment Settings</h2>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: CreditCard, label: 'Stripe', sublabel: 'Connected', color: 'text-primary', bg: 'bg-primary/10', active: true },
            { icon: Wallet, label: 'PayPal', sublabel: 'Not configured', color: 'text-warning', bg: 'bg-warning/10', active: false },
            { icon: Receipt, label: 'Tax Settings', sublabel: 'FR-92-827', color: 'text-warning', bg: 'bg-warning/10', active: false },
            { icon: Bell, label: 'Alerts', sublabel: '3 Active', color: 'text-success', bg: 'bg-success/10', active: false },
            { icon: Key, label: 'API Keys', sublabel: '2 Keys', color: 'text-primary-400', bg: 'bg-primary-400/10', active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={cn(
                "rounded-2xl border p-5 text-center transition-all hover:shadow-md active:scale-[0.98]",
                item.active 
                  ? "bg-primary/5 border-primary/20 shadow-sm"
                  : "bg-card border-border hover:border-primary/10"
              )}
            >
              <div className={cn("h-10 w-10 rounded-xl mx-auto flex items-center justify-center mb-3", item.bg)}>
                <item.icon className={cn("h-5 w-5", item.color)} />
              </div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className={cn(
                "text-[11px] mt-0.5",
                item.active ? "text-success" : "text-muted-foreground"
              )}>
                {item.sublabel}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
