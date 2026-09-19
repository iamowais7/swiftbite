// Centralised service base URLs — import from here, NOT from main.tsx
// Reads from Vite env vars (set these in Vercel project settings for deployed
// builds) and falls back to localhost ports for local dev when unset.
export const authService       = import.meta.env.VITE_AUTH_SERVICE       || "http://localhost:7010";
export const restaurantService = import.meta.env.VITE_RESTAURANT_SERVICE || "http://localhost:7011";
export const utilsService      = import.meta.env.VITE_UTILS_SERVICE      || "http://localhost:7012";
export const realtimeService   = import.meta.env.VITE_REALTIME_SERVICE   || "http://localhost:7014";
export const riderService      = import.meta.env.VITE_RIDER_SERVICE      || "http://localhost:7015";
export const aminService       = import.meta.env.VITE_ADMIN_SERVICE      || "http://localhost:7016";
