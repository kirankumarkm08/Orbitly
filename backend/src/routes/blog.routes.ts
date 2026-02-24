import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { logAuditEvent } from '../utils/audit-log.js';

const router = Router();

/**
 * GET /api/blog-posts
 * Get list of blog posts for the current tenant
 */
router.get('', async (req, res) => {
  try {
    const { tenant_id } = req;
    const { search, status, category, tag, page = 1, limit = 10 } = req.query;
    
    if (!tenant_id) {
      return res.status(401).json({ error: 'Tenant not found' });
    }

    let query = supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, author_id:users(id, email), excerpt, featured_image_url, status, published_at, view_count, like_count, comment_count, category, tags, created_at, updated_at')
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%, content.ilike.%${search}%, excerpt.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (tag) {
      query = query.contains('tags', tag);
    }

    // Pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    query = query.limit(parseInt(limit as string)).offset(offset);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching blog posts:', error);
      return res.status(500).json({ error: 'Failed to fetch blog posts' });
    }

    // Get total count for pagination
    const totalCount = await supabaseAdmin
      .from('blog_posts')
      .count()
      .eq('tenant_id', tenant_id);

    return res.json({
      posts: data || [],
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount[0].count || 0,
        total_pages: Math.ceil((totalCount[0].count || 0) / parseInt(limit as string))
      }
    });
    
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

/**
 * GET /api/blog-posts/:id
 * Get a single blog post by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { tenant_id } = req;
    const { id } = req.params;
    
    if (!tenant_id) {
      return res.status(401).json({ error: 'Tenant not found' });
    }

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*, author_id:users(id, email, name)')
      .eq('tenant_id', tenant_id)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      return res.status(500).json({ error: 'Failed to fetch blog post' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    return res.json(data);
    
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

/**
 * POST /api/blog-posts
 * Create a new blog post
 */
router.post('', async (req, res) => {
  try {
    const { tenant_id, user_id } = req;
    const postData = req.body;
    
    if (!tenant_id || !user_id) {
      return res.status(401).json({ error: 'Tenant or user not found' });
    }

    // Validate required fields
    if (!postData.title || !postData.content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newPost = {
      ...postData,
      tenant_id,
      author_id: user_id,
      created_at: new Date(),
      updated_at: new Date()
    };

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(newPost)
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return res.status(500).json({ error: 'Failed to create blog post' });
    }

    // Log audit event
    await logAuditEvent({
      tenant_id,
      user_id,
      action: 'create',
      table_name: 'blog_posts',
      record_id: data.id,
      new_values: postData,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    return res.status(201).json(data);
    
  } catch (error) {
    console.error('Error creating blog post:', error);
    return res.status(500).json({ error: 'Failed to create blog post' });
  }
});

/**
 * PUT /api/blog-posts/:id
 * Update an existing blog post
 */
router.put('/:id', async (req, res) => {
  try {
    const { tenant_id, user_id } = req;
    const { id } = req.params;
    const postData = req.body;
    
    if (!tenant_id || !user_id) {
      return res.status(401).json({ error: 'Tenant or user not found' });
    }

    // Get existing post to compare changes
    const { data: existingData, error: existingError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('id', id)
      .single();

    if (existingError) {
      console.error('Error fetching existing blog post:', existingError);
      return res.status(500).json({ error: 'Failed to fetch existing blog post' });
    }

    if (!existingData) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Check permissions
    if (existingData.author_id !== user_id && req.role !== 'tenant_admin') {
      return res.status(403).json({ error: 'You can only edit your own blog posts' });
    }

    // Update the post
    const updateData = {
      ...postData,
      updated_at: new Date()
    };

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('tenant_id', tenant_id)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      return res.status(500).json({ error: 'Failed to update blog post' });
    }

    // Log audit event
    await logAuditEvent({
      tenant_id,
      user_id,
      action: 'update',
      table_name: 'blog_posts',
      record_id: data.id,
      old_values: existingData,
      new_values: updateData,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    return res.json(data);
    
  } catch (error) {
    console.error('Error updating blog post:', error);
    return res.status(500).json({ error: 'Failed to update blog post' });
  }
});

/**
 * DELETE /api/blog-posts/:id
 * Delete a blog post
 */
router.delete('/:id', async (req, res) => {
  try {
    const { tenant_id, user_id } = req;
    const { id } = req.params;
    
    if (!tenant_id || !user_id) {
      return res.status(401).json({ error: 'Tenant or user not found' });
    }

    // Get existing post to log audit
    const { data: existingData, error: existingError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('id', id)
      .single();

    if (existingError) {
      console.error('Error fetching existing blog post:', existingError);
      return res.status(500).json({ error: 'Failed to fetch existing blog post' });
    }

    if (!existingData) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Check permissions
    if (existingData.author_id !== user_id && req.role !== 'tenant_admin') {
      return res.status(403).json({ error: 'You can only delete your own blog posts' });
    }

    // Soft delete by setting status to archived
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .update({ status: 'archived', updated_at: new Date() })
      .eq('tenant_id', tenant_id)
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return res.status(500).json({ error: 'Failed to delete blog post' });
    }

    // Log audit event
    await logAuditEvent({
      tenant_id,
      user_id,
      action: 'delete',
      table_name: 'blog_posts',
      record_id: id,
      old_values: existingData,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    return res.json({ message: 'Blog post archived successfully' });
    
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

/**
 * POST /api/blog-posts/:id/publish
 * Publish a blog post
 */
router.post('/:id/publish', async (req, res) => {
  try {
    const { tenant_id, user_id } = req;
    const { id } = req.params;
    
    if (!tenant_id || !user_id) {
      return res.status(401).json({ error: 'Tenant or user not found' });
    }

    // Get existing post
    const { data: existingData, error: existingError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('id', id)
      .single();

    if (existingError) {
      console.error('Error fetching existing blog post:', existingError);
      return res.status(500).json({ error: 'Failed to fetch existing blog post' });
    }

    if (!existingData) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Check permissions
    if (req.role !== 'tenant_admin') {
      return res.status(403).json({ error: 'Only tenant admins can publish blog posts' });
    }

    // Publish the post
    const publishData = {
      status: 'published',
      published_at: new Date(),
      published_by: user_id,
      updated_at: new Date()
    };

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(publishData)
      .eq('tenant_id', tenant_id)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error publishing blog post:', error);
      return res.status(500).json({ error: 'Failed to publish blog post' });
    }

    // Log audit event
    await logAuditEvent({
      tenant_id,
      user_id,
      action: 'publish',
      table_name: 'blog_posts',
      record_id: data.id,
      old_values: existingData,
      new_values: publishData,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    return res.json(data);
    
  } catch (error) {
    console.error('Error publishing blog post:', error);
    return res.status(500).json({ error: 'Failed to publish blog post' });
  }
});

/**
 * POST /api/blog-posts/:id/unpublish
 * Unpublish a blog post
 */
router.post('/:id/unpublish', async (req, res) => {
  try {
    const { tenant_id, user_id } = req;
    const { id } = req.params;
    
    if (!tenant_id || !user_id) {
      return res.status(401).json({ error: 'Tenant or user not found' });
    }

    // Get existing post
    const { data: existingData, error: existingError } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('id', id)
      .single();

    if (existingError) {
      console.error('Error fetching existing blog post:', existingError);
      return res.status(500).json({ error: 'Failed to fetch existing blog post' });
    }

    if (!existingData) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Check permissions
    if (req.role !== 'tenant_admin') {
      return res.status(403).json({ error: 'Only tenant admins can unpublish blog posts' });
    }

    // Unpublish the post
    const unpublishData = {
      status: 'draft',
      published_at: null,
      published_by: null,
      updated_at: new Date()
    };

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(unpublishData)
      .eq('tenant_id', tenant_id)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error unpublishing blog post:', error);
      return res.status(500).json({ error: 'Failed to unpublish blog post' });
    }

    // Log audit event
    await logAuditEvent({
      tenant_id,
      user_id,
      action: 'unpublish',
      table_name: 'blog_posts',
      record_id: data.id,
      old_values: existingData,
      new_values: unpublishData,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    return res.json(data);
    
  } catch (error) {
    console.error('Error unpublishing blog post:', error);
    return res.status(500).json({ error: 'Failed to unpublish blog post' });
  }
});

export default router;
