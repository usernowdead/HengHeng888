// Centralized secret management
// Validates secrets and throws error in production if missing
// Senior Security Engineer Level Implementation

function getSecret(key: string, defaultValue?: string, validator?: (value: string) => void, allowDefaultInProd = false): string {
  const value = process.env[key];
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!value) {
    // In production, never allow default values for sensitive keys (JWT/API keys)
    if (isProduction && !allowDefaultInProd) {
      throw new Error(
        `❌ CRITICAL: ${key} environment variable is required in production and cannot use default values. ` +
        `Please set it in your environment variables or .env file. ` +
        `Application cannot start without this value.`
      );
    }
    
    if (defaultValue) {
      console.warn(`⚠️  WARNING: ${key} not set, using default value. This is ONLY for development!`);
      return defaultValue;
    }
    
    throw new Error(`${key} environment variable is required.`);
  }
  
  // In production, validate that value is not a default value for sensitive keys
  if (isProduction && !allowDefaultInProd && defaultValue) {
    if (value === defaultValue) {
      throw new Error(
        `❌ CRITICAL: ${key} cannot use default value in production. ` +
        `Please set a secure, unique value in your environment variables.`
      );
    }
  }
  
  // Run custom validator if provided
  if (validator) {
    try {
      validator(value);
    } catch (error: any) {
      throw new Error(`Invalid ${key}: ${error.message}`);
    }
  }
  
  return value;
}

// Validators
function validateJWTSecret(value: string): void {
  if (value.length < 32) {
    throw new Error(`JWT_SECRET must be at least 32 characters long for security. Current length: ${value.length}`);
  }
  if (value.length < 64 && process.env.NODE_ENV === 'production') {
    console.warn(`⚠️  WARNING: JWT_SECRET is less than 64 characters. Consider using a longer secret for production.`);
  }
  // Check for common weak secrets
  const weakSecrets = ['secret', 'password', '123456', 'webshop', 'default'];
  if (weakSecrets.some(weak => value.toLowerCase().includes(weak))) {
    throw new Error('JWT_SECRET contains common weak patterns. Use a cryptographically secure random string.');
  }
}

function validateAPIKey(value: string): void {
  if (value.length < 16) {
    throw new Error(`API_KEY must be at least 16 characters long. Current length: ${value.length}`);
  }
}

function validateDatabaseURL(value: string): void {
  if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }
  // Warn if using default credentials
  if (value.includes('postgres:postgres@') || value.includes('admin:admin@')) {
    console.warn('⚠️  WARNING: DATABASE_URL appears to use default credentials. Change this in production!');
  }
}

export const secrets = {
  // JWT: NO defaults allowed in production
  JWT_SECRET: getSecret('JWT_SECRET', 'webshop_by_proleak_default_secret_change_in_production', validateJWTSecret, false),
  // API keys: Allow defaults in production for optional services (will warn but not fail)
  API_KEY_MIDDLE: getSecret('API_KEY_MIDDLE', 'apikey_middle_placeholder_temp', validateAPIKey, true),
  API_KEY_ADS4U: getSecret('API_KEY_ADS4U', 'apikey_ads4u_placeholder_temp', validateAPIKey, true),
  API_KEY_GAFIW: getSecret('API_KEY_GAFIW', 'apikey_gafiw_placeholder_temp', validateAPIKey, true),
  API_KEY_PEAMSUB: getSecret('API_KEY_PEAMSUB', 'apikey_peamsub_placeholder_temp', validateAPIKey, true),
  API_KEY_EASYSLIP: getSecret('API_KEY_EASYSLIP', 'apikey_easyslip_placeholder_temp', validateAPIKey, true),
  PAYMENT_GATEWAY_API_KEY: getSecret('PAYMENT_GATEWAY_API_KEY', 'payment_gateway_api_key_placeholder_temp', validateAPIKey, true),
  // Turnstile keys: allow defaults (test keys are acceptable)
  TURNSTILE_SECRET_KEY: getSecret('TURNSTILE_SECRET_KEY', '1x00000000000000000000AA', undefined, true), // Cloudflare test key
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: getSecret('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '1x00000000000000000000AA', undefined, true), // Cloudflare test key
  // Database URL: no default, must be provided
  DATABASE_URL: getSecret('DATABASE_URL', undefined, validateDatabaseURL, false),
};

// Validate all secrets on module load (only in production)
if (process.env.NODE_ENV === 'production') {
    const requiredSecrets = ['JWT_SECRET', 'DATABASE_URL'];
    const missing = requiredSecrets.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(
            `❌ CRITICAL: Missing required environment variables in production: ${missing.join(', ')}\n` +
            `Please set these variables before deploying.`
        );
    }
    
    // Optional secrets (warn if missing but don't fail)
    const optionalSecrets = ['API_KEY_MIDDLE', 'API_KEY_ADS4U', 'API_KEY_PEAMSUB', 'API_KEY_GAFIW', 'API_KEY_EASYSLIP'];
    const missingOptional = optionalSecrets.filter(key => !process.env[key]);
    if (missingOptional.length > 0) {
        console.warn(`⚠️  WARNING: Optional API keys not set: ${missingOptional.join(', ')}. Some features may not work.`);
    }
    
    console.log('✅ All required secrets validated');
}

