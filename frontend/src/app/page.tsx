import Link from "next/link";
import PageRenderer from "@/components/PageRenderer";
import { ArrowRight, Zap, Shield, Sparkles } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '';

async function getHomepage() {
  try {
    const res = await fetch(
      `${API_URL}/public/pages/homepage?tenant_id=${TENANT_ID}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const homepage = await getHomepage();

  // If a homepage is published, render it
  if (homepage?.html) {
    return (
      <PageRenderer
        html={homepage.html}
        css={homepage.css || ''}
        meta_title={homepage.meta_title}
        meta_description={homepage.meta_description}
      />
    );
  }

  // Fallback: static landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700/30 via-transparent to-transparent animate-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-teal-700/30 via-transparent to-transparent animate-pulse delay-1000" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-32">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Badge */}
            <div className="glass px-4 py-2 rounded-full border border-white/10">
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Build stunning pages in minutes
              </p>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold max-w-4xl">
              <span className="bg-gradient-to-r from-white via-teal-200 to-cyan-200 bg-clip-text text-transparent">
                Create Beautiful Pages
              </span>
              <br />
              <span className="text-white">Without Writing Code</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-300 max-w-2xl">
              The most powerful page builder for modern teams. Design, build, and launch stunning websites with our intuitive drag-and-drop interface.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/login" className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-base group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/admin/studio" className="inline-flex items-center justify-center px-8 py-3 rounded-lg glass text-white font-medium hover:bg-white/10 transition-colors text-base">
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Build and deploy pages in minutes, not hours. Our optimized platform ensures blazing-fast performance.</p>
            </div>

            <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure by Default</h3>
              <p className="text-gray-400">Enterprise-grade security with automatic backups and version control. Your data is always safe.</p>
            </div>

            <div className="glass rounded-xl p-6 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Beautiful Design</h3>
              <p className="text-gray-400">Premium templates and components designed by professionals. Make every page look stunning.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
