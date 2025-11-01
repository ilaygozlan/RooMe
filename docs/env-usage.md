# Environment Variables Setup

This document explains how to use environment variables in the RooMe2.0 Expo app.

## Overview

The app uses a two-tier environment variable system:
1. **Build-time variables** (via `app.config.ts`): Loaded from `.env` files and EAS Secrets, exposed via `Constants.expoConfig.extra`
2. **Runtime access** (via `src/config/env.ts`): Type-safe, validated access to environment variables

## Supported Variables

- `API_BASE_URL`: Base URL for the backend API
- `GOOGLE_MAPS_KEY`: Google Maps API key for map functionality
- `SENTRY_DSN`: Sentry DSN for error tracking (optional)

## Local Development

### Setup

1. Copy `.env.example` to `.env.development`:
   ```bash
   cp .env.example .env.development
   ```

2. Edit `.env.development` with your local values:
   ```
   API_BASE_URL=https://your-local-api.com
   GOOGLE_MAPS_KEY=your_google_maps_key
   SENTRY_DSN=
   ```

3. For local development, create a `.env` file (or symlink to `.env.development`):
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.development .env
   
   # Or create symlink
   New-Item -ItemType SymbolicLink -Path .env -Target .env.development
   ```

**Note**: The app will load `.env` by default. For production builds, use EAS Secrets (see below).

### Using Environment Variables in Code

#### Preferred Method: Using `ENV` from `src/config/env.ts`

This method provides type safety and runtime validation:

```typescript
import { ENV } from "../src/config/env";

// Access variables
const apiUrl = ENV.apiBaseUrl;
const mapsKey = ENV.googleMapsKey;

// Example: Making an API call
const response = await fetch(`${ENV.apiBaseUrl}/api/users`);
```

#### Alternative Method: Using `@env` imports (for inline string literals)

Some libraries require string literals at module load time. For these cases, use the `@env` import:

```typescript
import { GOOGLE_MAPS_KEY } from "@env";

// Use directly where a string literal is required
const mapComponent = <MapView apiKey={GOOGLE_MAPS_KEY} />;
```

**Note**: Prefer the `ENV` method for most cases. Only use `@env` when a library specifically requires a compile-time string literal.

## EAS Build Configuration

For production builds via EAS, set environment variables as Secrets. Secrets are automatically injected as `process.env.*` during the build.

### Setting EAS Secrets

```bash
# Set API base URL
eas secret:create --name API_BASE_URL --value https://api.production.com --scope project

# Set Google Maps key
eas secret:create --name GOOGLE_MAPS_KEY --value your_production_key --scope project

# Set Sentry DSN (optional)
eas secret:create --name SENTRY_DSN --value https://your-sentry-dsn@sentry.io/project-id --scope project
```

### Viewing Secrets

```bash
eas secret:list
```

### Updating Secrets

```bash
eas secret:delete --name API_BASE_URL
eas secret:create --name API_BASE_URL --value new_value --scope project
```

### Environment-Specific Secrets

You can set secrets per build profile in `eas.json`. For example:

```json
{
  "build": {
    "production": {
      "env": {
        "API_BASE_URL": "https://api.production.com"
      }
    },
    "development": {
      "env": {
        "API_BASE_URL": "https://api.staging.com"
      }
    }
  }
}
```

However, using EAS Secrets (with `--scope project`) is the recommended approach for sensitive values.

## How It Works

### Build Time (`app.config.ts`)

1. `dotenv/config` loads `.env` file
2. `process.env.*` values are read
3. Values are exposed via `extra` in the Expo config
4. During EAS builds, EAS Secrets are injected as `process.env.*`

### Runtime (`src/config/env.ts`)

1. Values are read from `Constants.expoConfig.extra`
2. Zod schema validates required fields
3. Type-safe `ENV` object is exported
4. Missing or invalid values throw descriptive errors

## Security Notes

⚠️ **Important**: Values in `app.config.ts -> extra` are **bundled into the client app**. This means:

- ✅ Safe to expose: Public API URLs, public API keys (like Google Maps)
- ❌ Never expose: Private API keys, database credentials, JWT secrets

If you need to keep something secret, use it only on your backend server, never in the mobile app.

## Troubleshooting

### "Validation failed" error on app start

Check that all required environment variables are set:
- `API_BASE_URL` must be a valid URL
- `GOOGLE_MAPS_KEY` must be a non-empty string
- `SENTRY_DSN` is optional

### Variables not updating

1. **Local development**: 
   - Ensure `.env` file exists and has correct values
   - Restart Expo dev server: `npm start` (or `expo start --clear`)

2. **EAS builds**:
   - Verify secrets are set: `eas secret:list`
   - Rebuild the app: `eas build`

### TypeScript errors with `@env`

Ensure `types/env.d.ts` is included in your `tsconfig.json`. It should be automatically included if it's in the root `types/` directory.

## Examples

See `src/example/EnvUsageExample.tsx` for a complete example component.

