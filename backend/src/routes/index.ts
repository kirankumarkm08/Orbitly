import { Router } from 'express';
import authRoutes from './auth.routes.js';
import pagesRoutes from './pages.routes.js';
import assetsRoutes from './assets.routes.js';
import eventsRoutes from './events.routes.js';
import speakersRoutes from './speakers.routes.js';
import registrationsRoutes from './registrations.routes.js';
import templatesRoutes from './templates.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/pages', pagesRoutes);
router.use('/assets', assetsRoutes);
router.use('/events', eventsRoutes);
router.use('/speakers', speakersRoutes);
router.use('/registrations', registrationsRoutes);
router.use('/templates', templatesRoutes);
router.use('/admin', adminRoutes);

export default router;
