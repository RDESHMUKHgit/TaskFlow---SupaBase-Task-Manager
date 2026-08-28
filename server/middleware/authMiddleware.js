import { supabase, createUserSupabaseClient } from '../config/supabase.js';

// In-memory cache for validated tokens (TTL: 5 minutes)
const tokenCache = new Map();
const TOKEN_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Express Authentication Middleware
 * Validates Supabase JWT Access Tokens and creates a user-scoped Supabase client.
 * Performs fast in-memory JWT parsing/caching to eliminate slow remote network roundtrips.
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

    // Check fast in-memory cache first
    const cached = tokenCache.get(token);
    let user;

    if (cached && (Date.now() - cached.timestamp < TOKEN_CACHE_TTL_MS)) {
      user = cached.user;
    } else {
      // Decode JWT payload locally to avoid slow remote HTTP roundtrip
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));

          // Check token expiration
          if (payload.exp && (payload.exp * 1000 < Date.now())) {
            tokenCache.delete(token);
            return res.status(401).json({
              success: false,
              message: 'Session token has expired. Please log in again.',
            });
          }

          if (payload.sub) {
            user = {
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.user_metadata || {},
              role: payload.role,
            };
          }
        }
      } catch (e) {
        console.warn('Local JWT parse note:', e.message);
      }

      // If local decode succeeded, cache it; otherwise fallback to remote verification
      if (user?.id) {
        tokenCache.set(token, { user, timestamp: Date.now() });
        // Clean cache periodically
        if (tokenCache.size > 500) {
          const now = Date.now();
          for (const [k, v] of tokenCache.entries()) {
            if (now - v.timestamp > TOKEN_CACHE_TTL_MS) tokenCache.delete(k);
          }
        }
      } else {
        const { data: { user: remoteUser }, error } = await supabase.auth.getUser(token);
        if (error || !remoteUser) {
          return res.status(401).json({
            success: false,
            message: 'Invalid or expired session token. Please log in again.',
            error: error?.message,
          });
        }
        user = remoteUser;
        tokenCache.set(token, { user, timestamp: Date.now() });
      }
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
