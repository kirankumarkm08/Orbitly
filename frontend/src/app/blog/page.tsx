import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest articles and insights',
};

export default async function BlogPage() {
  try {
    const supabase = await createClient();
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image_url,
        published_at,
        view_count,
        category,
        tags,
        author:users(id, email, name)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20);

    const typedPosts = (posts as unknown as Array<{
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      featured_image_url: string;
      published_at: string;
      view_count: number;
      category: string;
      tags: string[];
      author: { id: string; email: string; name: string } | null;
    }> | null) || [];

    if (error) {
      console.error('Error fetching blog posts:', error);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Posts</h1>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Read our latest articles and insights
            </p>
          </div>

          {/* Posts Grid */}
          {typedPosts && typedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {typedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <article className="h-full bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all">
                    {/* Featured Image */}
                    {post.featured_image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Category */}
                      {post.category && (
                        <div className="mb-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded">
                            {post.category}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                            {post.author?.name?.charAt(0) || post.author?.email?.charAt(0) || 'A'}
                          </div>
                          <span>{post.author?.name || post.author?.email || 'Anonymous'}</span>
                        </div>

                        {/* Date */}
                        {post.published_at && (
                          <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </time>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-2xl font-bold mb-2">No posts yet</div>
              <div className="text-muted-foreground">
                Check back soon for new content
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in blog page:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Blog</h1>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }
}