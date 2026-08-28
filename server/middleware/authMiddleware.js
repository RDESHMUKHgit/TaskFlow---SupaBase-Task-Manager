import { supabase, createUserSupabaseClient } from '../config/supabase.js';

/**
 * Express Authentication Middleware
 * Validates Supabase JWT Access Tokens and creates a user-scoped Supabase client
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No authorization token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Malformed authorization header.',
      });
    }

    // Verify the JWT token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.',
        error: error?.message,
      });
    }

    // Attach authenticated user and user-scoped Supabase client to request
    req.user = user;
    req.token = token;
    req.supabase = createUserSupabaseClient(token);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Authentication verification failed.',
      error: err.message,
    });
  }
};
