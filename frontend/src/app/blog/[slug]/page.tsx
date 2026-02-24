import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/server';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('meta_title, meta_description, og_title, og_description, og_image_url, title, excerpt, featured_image_url')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single();

    if (error || !post) {
      return {
        title: 'Post Not Found',
      };
    }

    return {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      openGraph: {
        title: post.og_title || post.meta_title || post.title,
        description: post.og_description || post.meta_description || post.excerpt,
        images: post.og_image_url ? [post.og_image_url] : post.featured_image_url ? [post.featured_image_url] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.og_title || post.meta_title || post.title,
        description: post.og_description || post.meta_description || post.excerpt,
        images: post.og_image_url ? [post.og_image_url] : post.featured_image_url ? [post.featured_image_url] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:users(id, email, name)
      `)
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single();

    if (error || !post) {
      notFound();
    }

    // Increment view count
    await supabase
      .from('blog_posts')
      .update({ view_count: post.view_count + 1 })
      .eq('id', post.id);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <article className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              {/* Category */}
              {post.category && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
                    {post.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {post.author?.name?.charAt(0) || post.author?.email?.charAt(0) || 'A'}
                  </div>
                  <span>{post.author?.name || post.author?.email || 'Anonymous'}</span>
                </div>

                {/* Date */}
                {post.published_at && (
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(post.published_at).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}

                {/* Read time */}
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{Math.ceil(post.content.split(' ').length / 200)} min read</span>
                </div>

                {/* Views */}
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.view_count.toLocaleString()} views</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="mb-12">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Excerpt */}
            {post.excerpt && (
              <div className="mb-12">
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg prose-foreground max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-12">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm text-muted-foreground bg-muted rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="border-t border-border pt-8 mb-12">
              <h3 className="text-lg font-bold text-foreground mb-4">Share this post</h3>
              <div className="flex gap-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL + '/blog/' + post.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL + '/blog/' + post.slug)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL + '/blog/' + post.slug)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}