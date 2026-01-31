# Quick Start Guide

## Run Locally (Development)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
```

Output: Static files in `out/` directory

## Deploy to Vercel (Easiest)

### Option 1: Git Integration (One-Click)

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click "Deploy" (accept all defaults)

**That's it!** Vercel automatically detects everything.

### Option 2: CLI

```bash
npm install -g vercel
vercel login
vercel
```

## Configuration (Already Done)

The project is pre-configured for Vercel deployment:

### Files:
- ✅ `next.config.mjs` - Static export enabled
- ✅ `package.json` - Build scripts configured
- ✅ `tsconfig.json` - TypeScript settings for Next.js
- ✅ `tailwind.config.cjs` - Styling configured
- ✅ No `vercel.json` needed (uses Vercel defaults)

### Settings:
| Setting | Value |
|---------|-------|
| Framework | Next.js (auto-detected) |
| Build Command | `npm run build` |
| Output Directory | `out` |
| Install Command | `npm install` |
| Node Version | 18.x |

**No manual configuration required!**

## How It Works

1. **Client-Only**: All deobfuscation runs in the browser
2. **Static Export**: Next.js generates plain HTML/CSS/JS
3. **Zero Server**: No backend, API routes, or database
4. **Auto-Deploy**: Push to main → Automatic deployment

## Verifying It Works

After deploying to Vercel:

1. Visit your Vercel URL (e.g., `https://ynot-xxx.vercel.app`)
2. Select a fixture from the dropdown
3. Click "Load"
4. Click "Deobfuscate"
5. See the deobfuscated output

## Troubleshooting

### Build fails locally
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Build fails on Vercel
Check the build logs in Vercel Dashboard. Most likely:
- Missing dependencies (check package.json)
- TypeScript errors (run `npm run typecheck`)

### Blank page
- Check browser console for errors
- Verify JavaScript is enabled
- Check that fixtures loaded (should be in `public/fixtures/`)

## Next Steps

- **Custom Domain**: Add in Vercel project settings
- **Analytics**: Enable Vercel Analytics
- **Monitoring**: Automatic error tracking included

## Support

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- See [WEB_README.md](./WEB_README.md) for web interface docs
