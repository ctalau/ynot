# Deployment Guide - yNot Deobfuscator

This guide explains how to deploy the yNot deobfuscator web application to Vercel as a client-only app.

## Prerequisites

- Node.js 18+ installed
- A Vercel account (free tier works fine)
- Git repository pushed to GitHub, GitLab, or Bitbucket

## Project Configuration

The project is already configured for static export deployment in `next.config.mjs`:

```javascript
export default {
  output: 'export',        // Enable static HTML export
  images: {
    unoptimized: true,     // Disable image optimization for static export
  },
  distDir: 'out',          // Output directory
}
```

This ensures the app:
- Runs entirely in the browser (client-side only)
- Requires no server-side functions
- Can be deployed to any static hosting service

**No `vercel.json` required** - Vercel automatically detects Next.js projects and uses the correct settings.

## Deployment Methods

### Method 1: Git Integration (Recommended - Easiest)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [https://vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Deploy with Default Settings**
   - Vercel will automatically detect:
     - Framework: Next.js
     - Build Command: `npm run build`
     - Output Directory: `out`
     - Install Command: `npm install`
   - **Just click "Deploy"** - no configuration needed!

4. **Done!**
   - Vercel will build and deploy your app
   - You'll get a URL like `https://ynot-xxx.vercel.app`
   - Future pushes to `main` will auto-deploy

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts** (accept defaults):
   - Set up and deploy: **Yes**
   - Which scope: Choose your account
   - Link to existing project: **No**
   - Project name: **ynot** (or press Enter)
   - In which directory is your code located: **./** (press Enter)
   - Want to override settings: **No** (press Enter)

5. **Production deployment**
   ```bash
   vercel --prod
   ```

### Method 3: Other Static Hosting

For non-Vercel hosting (Netlify, GitHub Pages, Cloudflare Pages, etc.):

1. **Build**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy the `out/` directory**
   - The `out/` folder contains all static files
   - Upload it to any static hosting service

## Vercel Default Settings

When deploying to Vercel, these settings are applied automatically:

| Setting | Value | Notes |
|---------|-------|-------|
| Framework | Next.js | Auto-detected |
| Build Command | `npm run build` | From package.json |
| Output Directory | `out` | From next.config.mjs |
| Install Command | `npm install` | Auto-detected |
| Node Version | 18.x | Can override if needed |

**You don't need to configure anything** - Vercel reads these from your project files.

## Environment Variables

None required - this is a pure client-side app with no backend.

## Custom Domain

After deployment:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your domain
4. Update your DNS records as instructed
5. HTTPS is automatic

## Continuous Deployment

Once connected via Git:
- Every push to `main` → New production deployment
- Every PR → Preview deployment with unique URL
- Rollback to any previous deployment with one click

## Verifying Deployment

After deployment, check:

1. ✓ App loads at your Vercel URL
2. ✓ Fixture selector works
3. ✓ Can load example fixtures
4. ✓ Deobfuscation button works
5. ✓ Output displays correctly

## Troubleshooting

### Build Fails

Check the build logs in Vercel Dashboard. Common issues:

**Module errors:**
```bash
# Test locally first
npm install
npm run build
```

**TypeScript errors:**
```bash
npm run typecheck
```

### 404 on Fixtures

Fixtures are in `public/fixtures/` and should be automatically copied during build. Check that this directory exists in your repository.

### Blank Page

Check browser console for errors. The app is client-side only, so JavaScript must be enabled.

### Build Timeout

Unlikely with this project, but if it happens:
- Go to Project Settings → General
- Increase "Build Timeout" (requires Pro plan)

## Performance

- **Build time**: ~30-60 seconds
- **Deploy time**: ~10-20 seconds
- **Bundle size**: ~500KB gzipped
- **Global CDN**: Automatic with Vercel

## Cost

**Vercel Free Tier** includes:
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Global CDN
- Preview deployments

Perfect for this project!

## Next Steps

1. **Deploy now**: Push to GitHub and import to Vercel
2. **Add custom domain**: Optional but recommended
3. **Enable analytics**: Vercel Analytics (free tier available)
4. **Set up monitoring**: Vercel provides automatic error tracking

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Vercel Support](https://vercel.com/support)
