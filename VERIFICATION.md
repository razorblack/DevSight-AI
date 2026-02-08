# Vercel Deployment Verification Checklist

Use this checklist to verify your DevSight AI deployment is Vercel-safe and production-ready.

## Pre-Deployment Checks

### Local Build Verification
- [x] `npm install` runs without errors
- [x] `npm run build` completes successfully
- [x] No TypeScript compilation errors
- [x] Production server starts with `npm start`
- [x] All pages load correctly locally

### Code Quality
- [x] No server-only modules (`fs`, `path`, etc.) in client components
- [x] All client components marked with `"use client"` directive
- [x] Server components don't use client-only hooks
- [x] Environment variables follow Next.js conventions

### Configuration Files
- [x] `vercel.json` present with correct configuration
- [x] `.env.example` documents all required variables
- [x] `next.config.ts` has proper webpack configuration
- [x] `.gitignore` excludes sensitive files but allows `.env.example`

### Environment Variables
- [x] `TAMBO_API_KEY` - Server-side only (no `NEXT_PUBLIC_` prefix)
- [x] `TAMBO_BASE_URL` - Server-side only (optional)
- [x] `TAMBO_MAX_BODY_BYTES` - Server-side only (optional)
- [x] `NEXT_PUBLIC_TAMBO_URL` - Client-side (optional, properly prefixed)

### API Routes
- [x] `/api/tambo/[[...path]]/route.ts` properly configured
- [x] Runtime set to `nodejs` for server-side execution
- [x] API key accessed only server-side
- [x] Proper error handling for missing API key
- [x] Request validation and size limits configured

### Security
- [x] API keys never exposed to client
- [x] Sensitive data not in git history
- [x] `.env*` files (except `.env.example`) in `.gitignore`
- [x] API route validates and sanitizes inputs
- [x] No hardcoded secrets in source code

## Vercel Deployment

### Repository Setup
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] Repository connected to Vercel account
- [ ] Correct branch selected for deployment

### Environment Variables in Vercel
- [ ] `TAMBO_API_KEY` set in Vercel dashboard
- [ ] Variable scopes set (Production, Preview, Development)
- [ ] Values match `.env.example` format
- [ ] Optional variables configured if needed

### Build Configuration
- [ ] Vercel auto-detected Next.js framework
- [ ] Build command: `npm run build` (or default)
- [ ] Install command: `npm install` (or default)
- [ ] Output directory: `.next` (or default)
- [ ] Node.js version: 18.x or higher

### Deployment Process
- [ ] Initial deployment triggered
- [ ] Build logs show no errors
- [ ] Build completes successfully
- [ ] Deployment URL generated

## Post-Deployment Verification

### Basic Functionality
- [ ] Home page loads at `https://your-domain.vercel.app/`
- [ ] Chat page loads at `/chat`
- [ ] Interactables page loads at `/interactables`
- [ ] Generate page loads at `/generate`
- [ ] No 404 errors for expected routes

### API Route Testing
- [ ] API route accessible at `/api/tambo`
- [ ] Returns proper response (not 500 error)
- [ ] Authentication works with Tambo API
- [ ] Requests properly proxied to Tambo backend

### Chat Functionality
- [ ] Chat interface renders correctly
- [ ] Can type messages in input field
- [ ] Messages send when pressing Enter
- [ ] AI responses generate and stream
- [ ] Components render in chat (graphs, cards, etc.)
- [ ] Tools can be invoked (if configured)

### Error Handling
- [ ] No JavaScript errors in browser console
- [ ] No network errors in browser DevTools
- [ ] Proper error messages for invalid states
- [ ] API errors handled gracefully

### Performance
- [ ] Initial page load < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Lighthouse score > 80
- [ ] No memory leaks during extended use
- [ ] Serverless functions respond < 10 seconds

### Browser Compatibility
- [ ] Works in Chrome/Edge (latest)
- [ ] Works in Firefox (latest)
- [ ] Works in Safari (latest)
- [ ] Responsive on mobile devices
- [ ] No console warnings in different browsers

## Vercel-Specific Checks

### Serverless Functions
- [ ] API routes deploy as serverless functions
- [ ] Function size within limits (< 50MB)
- [ ] Function execution time within limits (< 60s)
- [ ] Cold start time acceptable (< 5s)

### Build Optimization
- [ ] Static pages pre-rendered when possible
- [ ] Bundle size optimized (check build output)
- [ ] Images optimized with Next.js Image component
- [ ] Proper caching headers set

### Monitoring (Optional)
- [ ] Vercel Analytics enabled
- [ ] Function logs accessible in dashboard
- [ ] Error tracking configured
- [ ] Performance monitoring active

## Common Issues Checklist

### Build Failures
- [ ] Not related to missing dependencies
- [ ] Not related to TypeScript errors
- [ ] Not related to environment variables
- [ ] Not related to import errors

### Runtime Errors
- [ ] API key is valid and not expired
- [ ] Environment variables accessible
- [ ] No CORS issues
- [ ] No timeout issues with API calls

### Performance Issues
- [ ] Bundle size reasonable (< 200KB compressed)
- [ ] No unnecessary re-renders
- [ ] API responses cached appropriately
- [ ] Images lazy-loaded

## Production Readiness

### Documentation
- [x] README.md includes deployment instructions
- [x] DEPLOYMENT.md provides detailed guide
- [x] .env.example documents all variables
- [x] Code includes helpful comments

### Scalability
- [ ] API rate limiting considered
- [ ] Database connections handled properly (if applicable)
- [ ] Caching strategy in place
- [ ] Error monitoring configured

### Maintenance
- [ ] Dependencies up to date
- [ ] Security vulnerabilities addressed
- [ ] Logging configured for debugging
- [ ] Rollback strategy defined

## Sign-Off

- [ ] All checks completed
- [ ] Deployment verified in production
- [ ] Stakeholders notified
- [ ] Documentation updated
- [ ] Monitoring active

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Vercel URL**: _____________  
**Notes**: _____________

---

## Quick Troubleshooting

### Build fails with "TAMBO_API_KEY not found"
**Solution**: Add `TAMBO_API_KEY` in Vercel project settings → Environment Variables

### API requests return 500 errors
**Solution**: Check Vercel function logs; verify API key is valid at tambo.co/dashboard

### Page loads but chat doesn't work
**Solution**: Check browser console for errors; verify `/api/tambo` route is accessible

### "Module not found" errors
**Solution**: Ensure all imports use correct paths; check `tsconfig.json` paths

### Slow response times
**Solution**: Check Tambo API status; verify network connectivity; review function execution logs

---

For more help, see:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- [Vercel Docs](https://vercel.com/docs) - Platform documentation
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [Tambo Docs](https://docs.tambo.co) - API documentation
