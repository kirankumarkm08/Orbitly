import { Router } from 'express';
import authRoutes from './auth.routes.js';
import pagesRoutes from './pages.routes.js';
import assetsRoutes from './assets.routes.js';
import eventsRoutes from './events.routes.js';
import speakersRoutes from './speakers.routes.js';
import registrationsRoutes from './registrations.routes.js';
import templatesRoutes from './templates.routes.js';
import adminRoutes from './admin.routes.js';
import publicRoutes from './public.routes.js';
import tenantRoutes from './tenant.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import blogRoutes from './blog.routes.js';
import productsRoutes from './products.routes.js';
import categoriesRoutes from './categories.routes.js';
import stripeRoutes from './stripe.routes.js';
import ordersRoutes from './orders.routes.js';
import customersRoutes from './customers.routes.js';
import usersRoutes from './users.routes.js';
import formsRoutes from './forms.routes.js';
import aiRoutes from './ai.routes.js';

const router = Router();

// Mount routes
router.use('/public', publicRoutes);
router.use('/public', tenantRoutes);
router.use('/auth', authRoutes);
router.use('/pages', pagesRoutes);
router.use('/assets', assetsRoutes);
router.use('/events', eventsRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/stripe', stripeRoutes);
router.use('/orders', ordersRoutes);
router.use('/customers', customersRoutes);
router.use('/users', usersRoutes);
router.use('/forms', formsRoutes);
router.use('/speakers', speakersRoutes);
router.use('/registrations', registrationsRoutes);
router.use('/templates', templatesRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/blog-posts', blogRoutes);
router.use('/ai', aiRoutes);

export default router;
