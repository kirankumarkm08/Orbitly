import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
const router = express.Router();
// POST /api/auth/login - Login with email/password
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw createError('Email and password are required', 400);
    }
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
    });
    if (error)
        throw createError(error.message, 401);
    // Get user profile
    const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
    if (!userProfile) {
        console.error('Failed to fetch user profile for ID:', data.user.id);
    }
    res.json({
        user: userProfile,
        session: data.session,
    });
}));
// POST /api/auth/register - Register new user
router.post('/register', asyncHandler(async (req, res) => {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
        throw createError('Email and password are required', 400);
    }
    const { data, error } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
            data: { full_name },
        },
    });
    if (error)
        throw createError(error.message, 400);
    res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user: data.user,
    });
}));
// POST /api/auth/logout - Logout
router.post('/logout', asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        await supabaseAdmin.auth.signOut();
    }
    res.json({ message: 'Logged out successfully' });
}));
// POST /api/auth/refresh - Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        throw createError('Refresh token is required', 400);
    }
    const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token,
    });
    if (error)
        throw createError(error.message, 401);
    res.json({
        session: data.session,
    });
}));
// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw createError('Email is required', 400);
    }
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
    if (error)
        throw createError(error.message, 400);
    res.json({ message: 'Password reset email sent' });
}));
export default router;
//# sourceMappingURL=auth.routes.js.map