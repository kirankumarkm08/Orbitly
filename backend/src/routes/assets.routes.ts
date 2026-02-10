import express from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { tenantMiddleware } from '../middleware/tenant.middleware.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Apply auth and tenant middleware
router.use(authMiddleware, tenantMiddleware);

// GET /api/assets - List all assets for tenant
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('tenant_id', req.tenantId)
    .order('created_at', { ascending: false });

  if (error) throw createError(error.message, 500);
  res.json(data);
}));

// POST /api/assets/upload - Upload file
router.post('/upload', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw createError('No file provided', 400);
  }

  const file = req.file;
  const fileName = `${req.tenantId}/${Date.now()}-${file.originalname}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('assets')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) throw createError('Failed to upload file', 500);

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('assets')
    .getPublicUrl(fileName);

  // Save asset record to database
  const { data, error } = await supabaseAdmin
    .from('assets')
    .insert({
      tenant_id: req.tenantId,
      name: req.body.name || file.originalname,
      file_name: file.originalname,
      url: urlData.publicUrl,
      storage_path: fileName,
      mime_type: file.mimetype,
      size_bytes: file.size,
      uploaded_by: req.user?.id,
    })
    .select()
    .single();

  if (error) throw createError('Failed to save asset record', 500);
  res.status(201).json(data);
}));

// DELETE /api/assets/:id - Delete asset
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Get asset to find storage path
  const { data: asset, error: findError } = await supabaseAdmin
    .from('assets')
    .select('storage_path')
    .eq('id', id)
    .eq('tenant_id', req.tenantId)
    .single();

  if (findError || !asset) throw createError('Asset not found', 404);

  // Delete from storage
  if (asset.storage_path) {
    await supabaseAdmin.storage.from('assets').remove([asset.storage_path]);
  }

  // Delete from database
  const { error } = await supabaseAdmin
    .from('assets')
    .delete()
    .eq('id', id)
    .eq('tenant_id', req.tenantId);

  if (error) throw createError('Failed to delete asset', 500);
  res.status(204).send();
}));

export default router;
