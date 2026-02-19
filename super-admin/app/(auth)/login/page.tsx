'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Shield, Lock, Mail, AlertCircle, Globe, Briefcase, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/context/AuthContext';
import { api } from '@/lib/api';

const NICHES = [
  { value: 'static', label: 'Static Website' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'events', label: 'Events' },
  { value: 'launchpad', label: 'Launchpad' },
];

// Login Content Component
function LoginContent() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [niche, setNiche] = useState('static');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        if (!domain.trim()) {
          throw new Error('Domain is required');
        }
        const domainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
        if (!domainRegex.test(domain.toLowerCase().trim())) {
          throw new Error('Domain must be alphanumeric with hyphens, lowercase');
        }
        await api.onboarding({
          email,
          password,
          full_name: fullName,
          niche,
          domain: domain.toLowerCase().trim(),
        });
        setSuccess('Account created! Check your email to verify.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>

      <Card className="w-full max-w-md relative z-10 glass-card border-white/10">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20 mb-4 glow">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Super Admin' : 'Create Workspace'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {mode === 'login'
              ? 'Enter your credentials to access the control panel'
              : 'Set up your new workspace'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-400 animate-enter">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                {success}
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Full Name"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Workspace Domain (e.g. my-workspace)"
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">Alphanumeric and hyphens only, lowercase</p>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full h-10 pl-10 pr-3 rounded-md bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50"
                    >
                      {NICHES.map((n) => (
                        <option key={n.value} value={n.value} className="bg-gray-800">{n.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {mode === 'signup' && <p className="text-xs text-gray-500">At least 8 characters</p>}
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25"
              loading={isSubmitting}
            >
              {mode === 'login' ? 'Sign In' : 'Create Workspace'}
            </Button>

            <p className="text-center text-sm text-gray-400">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                    className="text-purple-400 hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="text-purple-400 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-white/5 pt-6">
          <p className="text-xs text-center text-gray-500">
            Authorized access only. All activities are monitored.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Wrap with AuthProvider for the login hook to work
export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}
