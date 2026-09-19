// Centralised service base URLs — import from here, NOT from main.tsx
// Production (Render) URLs — swap back in for deployed builds:
// export const authService       = "https://swiftbite-auth-service-latest.onrender.com";
// export const restaurantService = "https://restaurant-service-latest-fbk5.onrender.com";
// export const utilsService      = "https://swiftbite-utils-service-latest.onrender.com";
// export const realtimeService   = "https://realtime-service-latest-7a1q.onrender.com";
// export const riderService      = "https://rider-service-latest-0pvs.onrender.com";
// export const aminService       = "https://admin-service-latest-vvam.onrender.com";

// Local dev URLs (match the PORT values in services/*/.env)
export const authService       = "http://localhost:7010";
export const restaurantService = "http://localhost:7011";
export const utilsService      = "http://localhost:7012";
export const realtimeService   = "http://localhost:7014";
export const riderService      = "http://localhost:7015";
export const aminService       = "http://localhost:7016";
