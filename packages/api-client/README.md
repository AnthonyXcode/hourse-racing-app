# @synpulse/api-client

Auto-generated API client for Synpulse Strapi CMS using OpenAPI specification.

> **Note:** This package automatically fixes known issues in Strapi's auto-generated OpenAPI spec before generating the client.

## Installation

```bash
npm install @synpulse/api-client
```

## Usage

```typescript
import { createApiClient } from '@synpulse/api-client';

const client = createApiClient({
  baseURL: 'http://localhost:1337/api',
  token: 'your-api-token', // optional
});

// Fetch all insights
const insights = await client.find('insights', {
  populate: '*',
  sort: ['publishedAt:desc'],
  pagination: { page: 1, pageSize: 10 },
});

// Fetch single insight by ID
const insight = await client.findOne('insights', 1, {
  populate: 'experts.profileImage,tags,industries',
});
```

### Using Generated Services

After running `npm run generate`, you can also use the generated services directly:

```typescript
import { InsightService } from '@synpulse/api-client';

// Uses the generated OpenAPI client
const insights = await InsightService.getInsights();
```

## Development

```bash
# Install dependencies
npm install

# Generate API client from OpenAPI spec (fixes spec issues first)
npm run generate

# Build the package
npm run build

# Watch mode
npm run dev

# Clean build artifacts
npm run clean
```

## Scripts

| Script | Description |
|--------|-------------|
| `fix-spec` | Fix known OpenAPI spec issues |
| `generate` | Fix spec + Generate API client from Strapi OpenAPI spec |
| `build` | Build the package |
| `dev` | Build in watch mode |
| `lint` | Run ESLint |
| `clean` | Remove dist, node_modules, and generated files |

## Known Issues Fixed

### Invalid Upload Path in Strapi OpenAPI Spec

Strapi's documentation plugin generates an invalid OpenAPI path:

```
❌ "/upload?id={id}"  (query params should not be in path)
✅ "/upload"          (with proper query parameter definition)
```

Our `fix-spec` script automatically corrects this before generating the client.
