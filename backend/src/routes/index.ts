import { Router } from 'express';
import authRoutes from './auth.routes';
import pagesRoutes from './pages.routes';
import assetsRoutes from './assets.routes';
import eventsRoutes from './events.routes';
import speakersRoutes from './speakers.routes';
import registrationsRoutes from './registrations.routes';
import templatesRoutes from './templates.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/pages', pagesRoutes);
router.use('/assets', assetsRoutes);
router.use('/events', eventsRoutes);
router.use('/speakers', speakersRoutes);
router.use('/registrations', registrationsRoutes);
router.use('/templates', templatesRoutes);

export default router;
