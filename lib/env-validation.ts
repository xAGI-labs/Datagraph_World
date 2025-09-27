/**
 * Environment variable validation for World Mini App
 * Based on World.org documentation requirements
 */

export function validateServerEnv() {
  const required = {
    WORLD_APP_ID: process.env.WORLD_APP_ID,
    WORLD_DEV_PORTAL_API_KEY: process.env.WORLD_DEV_PORTAL_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  };

  const missing: string[] = [];

  Object.entries(required).forEach(([key, value]) => {
    if (!value || value.includes("your_") || value.includes("_here")) {
      missing.push(key);
    }
  });

  // Validate World App ID format
  if (required.WORLD_APP_ID && !required.WORLD_APP_ID.startsWith("app_")) {
    console.error('❌ WORLD_APP_ID must start with "app_"');
    process.exit(1);
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error(
      "\nPlease check your .env file and ensure all values are properly configured."
    );
    process.exit(1);
  }

  console.log("✅ All required environment variables are configured");
}

export function validateClientEnv() {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID;

  if (!appId || appId.includes("your_") || appId.includes("_here")) {
    console.error("❌ NEXT_PUBLIC_WORLD_APP_ID is not configured properly");
    return false;
  }

  if (!appId.startsWith("app_")) {
    console.error('❌ NEXT_PUBLIC_WORLD_APP_ID must start with "app_"');
    return false;
  }

  return true;
}
