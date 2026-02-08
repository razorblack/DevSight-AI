# Vercel Deployment Guide

This guide ensures your DevSight AI application deploys successfully on Vercel.

## Prerequisites

- A GitHub repository with your DevSight AI code
- A Vercel account (free tier works)
- A Tambo API key from [tambo.co/dashboard](https://tambo.co/dashboard)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

### 2. Configure Environment Variables

In your Vercel project settings, add the following environment variables:

#### Required
- **`TAMBO_API_KEY`**: Your Tambo API key
  - Get from: https://tambo.co/dashboard
  - Scope: Production, Preview, Development

#### Optional
- **`TAMBO_BASE_URL`**: Tambo API endpoint (defaults to `https://api.tambo.co`)
  - Only change if using a custom Tambo server
  - Scope: Production, Preview, Development

- **`TAMBO_MAX_BODY_BYTES`**: Maximum request body size (defaults to `5242880` = 5MB)
  - Scope: Production, Preview, Development

- **`NEXT_PUBLIC_TAMBO_URL`**: Client-side Tambo URL override (optional)
  - Only needed for custom Tambo server setups
  - Must be an absolute URL (e.g., `https://your-domain.com/api/tambo`)
  - Scope: Production, Preview, Development

### 3. Deploy

Click "Deploy" and Vercel will:
1. Install dependencies with `npm install`
2. Build the project with `npm run build`
3. Deploy to production

## Verification Checklist

After deployment, verify the following:

- [ ] Build completes successfully (check Vercel build logs)
- [ ] No build errors or warnings
- [ ] Environment variables are set correctly
- [ ] API route at `/api/tambo` responds (check network tab)
- [ ] Chat interface loads at `/chat`
- [ ] Can send messages and receive AI responses
- [ ] No runtime errors in browser console
- [ ] No server errors in Vercel function logs

## Troubleshooting

### Build Fails

**Error**: `TAMBO_API_KEY is not set`
- **Solution**: Add `TAMBO_API_KEY` environment variable in Vercel project settings

**Error**: Module not found
- **Solution**: Ensure all dependencies are in `package.json` (not just devDependencies)
- Run `npm install` locally to verify

### Runtime Errors

**Error**: API calls fail with 500
- **Solution**: Check Vercel function logs
- Verify `TAMBO_API_KEY` is set correctly
- Ensure API key is valid (test at https://tambo.co/dashboard)

**Error**: Cannot read environment variables
- **Solution**: Server-side variables (e.g., `TAMBO_API_KEY`) should NOT have `NEXT_PUBLIC_` prefix
- Client-side variables (e.g., `NEXT_PUBLIC_TAMBO_URL`) MUST have `NEXT_PUBLIC_` prefix

### Performance Issues

**Slow API responses**
- Check Tambo API status
- Verify network connectivity
- Review Vercel function execution times

## Architecture Notes

### Server-Side Only
- `TAMBO_API_KEY` - Kept secret, only accessible in API routes
- `TAMBO_BASE_URL` - Used by API route proxy
- `TAMBO_MAX_BODY_BYTES` - Request limit for API route

### Client-Side Access
- `NEXT_PUBLIC_TAMBO_URL` - Optional override for custom setups
- All other config is handled server-side for security

### API Route Proxy
The `/api/tambo/[[...path]]` route acts as a secure proxy:
1. Client sends requests to `/api/tambo/*`
2. API route authenticates with `TAMBO_API_KEY`
3. Proxies requests to Tambo API
4. Returns responses to client

This keeps your API key secure and never exposes it to the browser.

## Production Best Practices

1. **Use Environment Variables**: Never hardcode API keys
2. **Enable HTTPS**: Vercel provides this by default
3. **Monitor Logs**: Check Vercel function logs regularly
4. **Set Rate Limits**: Consider implementing rate limiting
5. **Enable Analytics**: Use Vercel Analytics for monitoring

## Local Development vs Production

### Local Development
```bash
npm install
cp .env.example .env.local
# Add your TAMBO_API_KEY to .env.local
npm run dev
```

### Production (Vercel)
- Environment variables set in Vercel dashboard
- Automatic builds on git push
- Serverless function auto-scaling

## Support

- **Tambo Docs**: [docs.tambo.co](https://docs.tambo.co)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Last Updated**: 2024
**Vercel Framework**: Next.js 15.5+
**Node Version**: 18.x or later
