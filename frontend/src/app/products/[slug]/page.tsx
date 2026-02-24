import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { resolveTenantFromHost } from '@/lib/resolve-tenant';
import { publicPagesApi } from '@/lib/api';
import { Product, ProductVariant } from '@/types';
import BuyNowButton from '@/components/ecommerce/BuyNowButton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Share2, Heart, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantId = await resolveTenantFromHost(host);
  
  if (!tenantId) return { title: 'Product' };

  const product = await publicPagesApi.getPublicProduct(slug, tenantId);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.seo_meta?.title || product.name,
    description: product.seo_meta?.description || product.description,
    openGraph: {
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const tenantId = await resolveTenantFromHost(host);

  if (!tenantId) {
    return <div className="p-20 text-center">Invalid Store Configuration</div>;
  }

  const product: Product = await publicPagesApi.getPublicProduct(slug, tenantId);

  if (!product) {
    notFound();
  }

  const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/800?text=No+Image';
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left: Product Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted border border-border group relative">
              <img 
                src={mainImage} 
                alt={product.name} 
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {hasDiscount && (
                <div className="absolute top-6 left-6">
                  <Badge className="bg-primary text-foreground text-sm py-1.5 px-4 font-bold shadow-xl">SALE</Badge>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {product.images?.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl border border-border bg-muted overflow-hidden cursor-pointer hover:border-primary transition-colors">
                  <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] font-bold">
                  {product.tags?.[0] || 'Premium Quality'}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-foreground">${product.price.toFixed(2)}</span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">${product.compare_at_price?.toFixed(2)}</span>
                  )}
                </div>
                {hasDiscount && (
                   <span className="text-xs font-bold bg-green-500/10 text-success px-3 py-1 rounded-full border border-green-500/20">
                     Save ${ (product.compare_at_price! - product.price).toFixed(2) }
                   </span>
                )}
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>

              {/* Variant Selectors (Placeholder for actual interactive component) */}
              {product.product_variants && product.product_variants.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-foreground uppercase tracking-widest">Select Variation</p>
                  <div className="flex flex-wrap gap-3">
                    {product.product_variants.map((v) => (
                      <button 
                        key={v.id}
                        className="px-4 py-2 rounded-xl border border-border bg-muted hover:border-primary transition-all text-sm font-medium"
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <BuyNowButton 
                  product={product} 
                  className="flex-1 rounded-2xl h-14 text-lg font-bold gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform" 
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl border-border bg-muted hover:bg-accent">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl border-border bg-muted hover:bg-accent">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border mt-auto">
              {[
                { icon: ShieldCheck, title: 'Secure Payment', desc: 'Encrypted transactions' },
                { icon: Truck, title: 'Fast Delivery', desc: 'World-wide shipping' },
                { icon: RefreshCcw, title: 'Easy Returns', desc: '30-day money back' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
