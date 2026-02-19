'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tenantApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, Lock, Mail, Globe, Briefcase, User, ArrowRight, Check } from 'lucide-react';

const NICHES = [
  { value: 'static', label: 'Static Website', desc: 'Pages, Blog, Media, Forms' },
  { value: 'ecommerce', label: 'E-commerce', desc: 'Products, Orders, Customers' },
  { value: 'events', label: 'Events', desc: 'Events, Tickets, Attendees' },
  { value: 'launchpad', label: 'Launchpad', desc: 'Pages, Waitlist, Campaigns' },
];

function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [niche, setNiche] = useState('static');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);

  const checkDomain = (value: string) => {
    const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setDomain(normalized);
    setDomainAvailable(null);
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!fullName.trim()) return setError('Full name is required');
      if (!domain.trim()) return setError('Domain is required');
      const domainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
      if (!domainRegex.test(domain)) return setError('Invalid domain format');
      setStep(2);
    } else if (step === 2) {
      if (!email.trim()) return setError('Email is required');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return setError('Invalid email format');
      if (password.length < 8) return setError('Password must be at least 8 characters');
      if (password !== confirmPassword) return setError('Passwords do not match');
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await tenantApi.onboarding({
        email,
        password,
        full_name: fullName,
        niche,
        domain,
      });
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create Your Workspace</h1>
          <p className="text-muted-foreground mt-2">Set up your new workspace in minutes</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-xl p-8">
          {step < 3 && (
            <div className="flex items-center justify-center mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s ? <Check className="h-4 w-4" /> : s}
                  </div>
                  {s < 2 && <div className={`w-16 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Jane Doe"
                    className="pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Workspace Domain</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="my-workspace"
                    className="pl-10"
                    value={domain}
                    onChange={(e) => checkDomain(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Alphanumeric and hyphens only, lowercase</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Workspace Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {NICHES.map((n) => (
                    <button
                      key={n.value}
                      type="button"
                      onClick={() => setNiche(n.value)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        niche === n.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm text-foreground">{n.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{n.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm font-medium text-foreground mb-2">Workspace Summary</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Domain: <span className="text-foreground">{domain}</span></p>
                  <p>Type: <span className="text-foreground">{NICHES.find(n => n.value === niche)?.label}</span></p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Workspace Created!</h2>
              <p className="text-muted-foreground mb-6">
                Check your email at <span className="text-foreground">{email}</span> to verify your account.
              </p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          )}

          {step < 3 && (
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Back
                </Button>
              )}
              <Button onClick={handleNext} loading={loading} className="flex-1">
                {step === 2 ? 'Create Workspace' : 'Continue'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  );
}
