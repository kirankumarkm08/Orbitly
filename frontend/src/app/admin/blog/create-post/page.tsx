'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, MoreVertical, CheckCircle2, Clock, Eye, FileText, User, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal, ModalContent, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { getSupabaseClient } from '@/lib/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  excerpt: string;
  featured_image_url: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  og_image_url: string;
  og_title: string;
  og_description: string;
  twitter_card_type: string;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  published_by: string | null;
  author: {
    id: string;
    email: string;
    name: string;
  };
}

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  og_image_url: string;
  og_title: string;
  og_description: string;
  twitter_card_type: string;
  is_featured: boolean;
  category: string;
  tags: string[];
}

const blogPostStatusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Review', value: 'review' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' }
];

const twitterCardOptions = [
  { label: 'Summary', value: 'summary' },
  { label: 'Summary with Large Image', value: 'summary_large_image' },
  { label: 'Player', value: 'player' },
  { label: 'App', value: 'app' }
];

export default function BlogManagement() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [previewContent, setPreviewContent] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      setAccessToken(session?.access_token || null);
    };
    getSession();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<FormData>();

  const editor = useEditor({
    extensions: [StarterKit],
    content: `<p>Write your blog post content here...</p>`,
    onUpdate: ({ editor }) => {
      setPreviewContent(editor.getHTML());
    }
  });

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/blog-posts?page=${page}`, {
        headers: {
          'Content-Type': 'application/json',
          ...accessToken && { Authorization: `Bearer ${accessToken}` }
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }

      const data = await response.json();
      setBlogPosts(data.posts);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.total_pages);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (data: FormData) => {
    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...accessToken && { Authorization: `Bearer ${accessToken}` }
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      await fetchBlogPosts();
      setShowModal(false);
      setModalMode('create');
      reset();
      editor.commands.setContent('<p>Write your blog post content here...</p>');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUpdatePost = async (data: FormData) => {
    try {
      if (!selectedPost?.id) return;

      const response = await fetch(`/api/blog-posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...accessToken && { Authorization: `Bearer ${accessToken}` }
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      await fetchBlogPosts();
      setShowModal(false);
      setModalMode('create');
      reset();
      editor.commands.setContent('<p>Write your blog post content here...</p>');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      if (!confirm('Are you sure you want to archive this post?')) return;

      const response = await fetch(`/api/blog-posts/${postId}`, {
        method: 'DELETE',
        headers: {
          ...accessToken && { Authorization: `Bearer ${accessToken}` }
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }

      await fetchBlogPosts();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handlePublishPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/blog-posts/${postId}/publish`, {
        method: 'POST',
        headers: {
          ...accessToken && { Authorization: `Bearer ${accessToken}` }
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish post');
      }

      await fetchBlogPosts();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUnpublishPost = async (postId: string) => {
    try {
      const response = await fetch(`/api/blog-posts/${postId}/unpublish`, {
        method: 'POST',
        headers: {
          ...accessToken && { Authorization: `Bearer ${accessToken}` }
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unpublish post');
      }

      await fetchBlogPosts();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setModalMode('edit');
    setShowModal(true);

    reset({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      featured_image_url: post.featured_image_url,
      status: post.status,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      meta_keywords: post.meta_keywords || [],
      og_image_url: post.og_image_url,
      og_title: post.og_title,
      og_description: post.og_description,
      twitter_card_type: post.twitter_card_type,
      is_featured: post.is_featured,
      category: post.category,
      tags: post.tags || []
    });

    editor.commands.setContent(post.content);
    setPreviewContent(post.content);
  };

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(post =>
    !statusFilter || post.status === statusFilter
  ).filter(post =>
    !categoryFilter || post.category === categoryFilter
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success text-success-foreground';
      case 'review':
        return 'bg-blue-500 bg-blue-500/10 text-blue-400';
      case 'draft':
        return 'bg-warning bg-warning/10 text-warning';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'review':
        return 'Review';
      case 'draft':
        return 'Draft';
      case 'archived':
        return 'Archived';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage blog posts for your audience</p>
        </div>
        <Button className="gap-2" onClick={() => {
          setSelectedPost(null);
          setModalMode('create');
          setShowModal(true);
          reset();
          editor.commands.setContent('<p>Write your blog post content here...</p>');
          setPreviewContent('');
        }}
        >
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search posts by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-muted border-border h-12"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as string)}
        >
          <SelectTrigger className="bg-muted border-border h-12">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as string)}
        >
          <SelectTrigger className="bg-muted border-border h-12">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {Array.from(new Set(blogPosts.map(post => post.category).filter(Boolean))).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-destructive px-6 py-4 text-destructive-foreground">
            {error}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-2xl font-bold mb-2">No posts found</div>
            <div className="text-muted-foreground">
              {searchQuery || statusFilter || categoryFilter 
                ? 'No posts match your filters'
                : 'Create your first blog post'
              }
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} variant="glass" className="border-border">
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
                          {post.author?.email || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3 text-secondary" />
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 px-6 border-l border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Views</p>
                      <p className="text-xl font-bold text-foreground mt-1">{post.view_count.toLocaleString()}</p>
                    </div>
                    <div className="text-center min-w-[100px]">
                      <Badge variant={post.status === 'published' ? 'default' : post.status === 'review' ? 'secondary' : 'warning'}>
                        {getStatusBadgeText(post.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-primary"
                      onClick={() => handleEditPost(post)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showModal} onOpenChange={setShowModal}>
        <ModalContent className="max-w-2xl">
          <form onSubmit={handleSubmit(modalMode === 'create' ? handleCreatePost : handleUpdatePost)}>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? 'Create New Post' : 'Edit Post'}
              </ModalTitle>
              <ModalDescription>
                {modalMode === 'create' ? 'Create a new blog post' : 'Edit your blog post'}
              </ModalDescription>
            </ModalHeader>

            {/* Post Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Enter post title..."
                    defaultValue={selectedPost?.title || ''}
                    {...register('title', { required: 'Title is required' })}
                    className="bg-muted border-border h-12"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    placeholder="Enter post slug..."
                    defaultValue={selectedPost?.slug || ''}
                    {...register('slug', { required: 'Slug is required' })}
                    className="bg-muted border-border h-12"
                  />
                  {errors.slug && (
                    <p className="text-xs text-destructive mt-1">{errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Input
                  placeholder="Enter excerpt..."
                  defaultValue={selectedPost?.excerpt || ''}
                  {...register('excerpt')}
                  className="bg-muted border-border h-12"
                />
              </div>

              <div>
                <Input
                  placeholder="Enter featured image URL..."
                  defaultValue={selectedPost?.featured_image_url || ''}
                  {...register('featured_image_url')}
                  className="bg-muted border-border h-12"
                />
              </div>

              <div>
                <Input
                  placeholder="Enter category..."
                  defaultValue={selectedPost?.category || ''}
                  {...register('category')}
                  className="bg-muted border-border h-12"
                />
              </div>

              <div>
                <Input
                  placeholder="Enter tags (comma separated)..."
                  defaultValue={selectedPost?.tags?.join(', ') || ''}
                  {...register('tags')}
                  className="bg-muted border-border h-12"
                />
              </div>

              <div>
                <Select
                  value={selectedPost?.status || 'draft'}
                  onValueChange={(value) => {
                    setValue('status', value as FormData['status']);
                  }}
                >
                  <SelectTrigger className="bg-muted border-border h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {blogPostStatusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={selectedPost?.twitter_card_type || 'summary_large_image'}
                  onValueChange={(value) => {
                    setValue('twitter_card_type', value);
                  }}
                >
                  <SelectTrigger className="bg-muted border-border h-12">
                    <SelectValue placeholder="Select Twitter card type" />
                  </SelectTrigger>
                  <SelectContent>
                    {twitterCardOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  placeholder="Enter meta title..."
                  defaultValue={selectedPost?.meta_title || ''}
                  {...register('meta_title')}
                  className="bg-muted border-border h-12"
                />
              </div>

              <div>
                <Textarea
                  placeholder="Enter meta description..."
                  defaultValue={selectedPost?.meta_description || ''}
                  {...register('meta_description')}
                  className="bg-muted border-border h-20"
                />
              </div>

              <div>
                <Input
                  placeholder="Enter meta keywords (comma separated)..."
                  defaultValue={selectedPost?.meta_keywords?.join(', ') || ''}
                  {...register('meta_keywords')}
                  className="bg-muted border-border h-12"
                />
              </div>

              <div>
                <Input
                  placeholder="Enter Open Graph image URL..."
                  defaultValue={selectedPost?.og_image_url || ''}
                  {...register('og_image_url')}
                  className="bg-muted border-border h-12"
                />
              </div>

              <div>
                <Input
                  placeholder="Enter Open Graph title..."
                  defaultValue={selectedPost?.og_title || ''}
                  {...register('og_title')}
                  className="bg-muted border-border h-12"
                />
              </div>

              <div>
                <Textarea
                  placeholder="Enter Open Graph description..."
                  defaultValue={selectedPost?.og_description || ''}
                  {...register('og_description')}
                  className="bg-muted border-border h-20"
                />
              </div>

              <div>
                <Input
                  type="checkbox"
                  id="is_featured"
                  defaultChecked={selectedPost?.is_featured || false}
                  {...register('is_featured')}
                />
                <label htmlFor="is_featured" className="ml-2 text-sm text-muted-foreground">
                  Featured post
                </label>
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-foreground">Content</div>
                  <div className="text-sm text-muted-foreground">
                    {editor.getText().length} characters
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted">
                  <EditorContent editor={editor} />
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-foreground">Preview</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const html = editor.getHTML();
                      setPreviewContent(html);
                    }}
                  >
                    Update Preview
                  </Button>
                </div>
                <div
                  className="rounded-xl border border-border bg-muted p-4"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              </div>
            </div>

            <ModalContent className="flex items-center justify-end gap-2 pt-4">
              <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (modalMode === 'create' ? 'Create Post' : 'Update Post')}
              </Button>
            </ModalContent>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}