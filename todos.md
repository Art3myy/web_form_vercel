# Project Todos: Migrate to Vercel Redis

This file outlines the steps required to switch the project from using `@upstash/redis` to Vercel's native Redis integration, which uses the `redis` package.

### 1. Dependency Management

- [ ] Uninstall the incorrect `@upstash/redis` package.
- [x] Install the correct `redis` package.

### 2. Update API Endpoints

The following files need to be refactored to use the `redis` client instead of the `@upstash/redis` client. This involves changing the client initialization and the methods used for database commands (e.g., `lpush`, `lrange`, `del`).

- [ ] Update `api/submit/[formId].js`
- [ ] Update `api/admin/download/[formId].js`
- [ ] Update `api/admin/reset/[formId].js`

### 3. Environment Variables

- [ ] Ensure the project is configured in Vercel with the environment variables provided by the Vercel Redis integration. The primary variable will be `REDIS_URL`.
- [ ] For local development, pull the latest environment variables by running `vercel env pull .env.development.local`.

