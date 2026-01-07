# Image and Asset Optimization Guide

## T091: Optimize Images and Assets

This guide explains how to optimize images and assets for production performance.

## Next.js Image Optimization

### 1. Use Next.js Image Component

Always use `next/image` instead of `<img>` tags:

```typescript
import Image from 'next/image';

// ✅ Optimized
<Image
  src="/images/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur" // Optional blur placeholder
/>

// ❌ Not optimized
<img src="/images/hero.jpg" alt="Hero image" />
```

### 2. Image Formats

**Recommended formats:**
- **WebP**: Modern format, 25-35% smaller than JPEG
- **AVIF**: Next-gen format, 50% smaller than JPEG (when supported)
- **PNG**: For images with transparency
- **SVG**: For icons and logos

**Next.js automatically serves WebP/AVIF** when browser supports it.

### 3. Image Sizing

**Responsive images:**
```typescript
<Image
  src="/images/hero.jpg"
  alt="Hero"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  style={{ objectFit: 'cover' }}
/>
```

**Fixed size images:**
```typescript
<Image
  src="/images/avatar.jpg"
  alt="Avatar"
  width={40}
  height={40}
  className="rounded-full"
/>
```

## Asset Optimization Checklist

### Images

- [ ] **Compress images** before adding to project
  - Use [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)
  - Target: < 200KB for photos, < 50KB for thumbnails

- [ ] **Use appropriate dimensions**
  - Don't upload 4K images for 400px display
  - Generate multiple sizes for responsive images

- [ ] **Lazy load images**
  - Next.js Image component lazy loads by default
  - Use `priority` only for above-the-fold images

- [ ] **Add blur placeholders**
  - Improves perceived performance
  - Use `placeholder="blur"` with `blurDataURL`

### Fonts

- [ ] **Use Next.js Font Optimization**
  ```typescript
  import { Inter } from 'next/font/google';

  const inter = Inter({
    subsets: ['latin'],
    display: 'swap', // Prevents FOIT (Flash of Invisible Text)
  });
  ```

- [ ] **Subset fonts**
  - Only include required character sets
  - Reduces font file size by 50-80%

- [ ] **Preload critical fonts**
  - Next.js automatically preloads fonts
  - Reduces layout shift

### Icons

- [ ] **Use SVG for icons**
  - Scalable without quality loss
  - Smaller file size than PNG

- [ ] **Optimize SVG files**
  - Use [SVGOMG](https://jakearchibald.github.io/svgomg/)
  - Remove unnecessary metadata

- [ ] **Consider icon fonts or sprite sheets**
  - For multiple icons, use lucide-react (already installed)
  - Reduces HTTP requests

### CSS and JavaScript

- [ ] **Enable minification** (automatic in production)
  ```javascript
  // next.config.js
  module.exports = {
    swcMinify: true, // Default in Next.js 13+
  };
  ```

- [ ] **Code splitting** (automatic with Next.js)
  - Each page only loads required JavaScript
  - Dynamic imports for large components

- [ ] **Tree shaking** (automatic)
  - Removes unused code from bundles
  - Reduces bundle size

### Static Assets

- [ ] **Compress static files**
  - Enable gzip/brotli compression
  - Configured in deployment platform

- [ ] **Use CDN for static assets**
  - Faster delivery worldwide
  - Reduced server load

- [ ] **Cache static assets**
  - Set appropriate cache headers
  - Next.js handles this automatically

## Performance Budgets

Set performance budgets to maintain fast load times:

```javascript
// next.config.js
module.exports = {
  // Warn if page exceeds 244KB
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Analyze bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        default: false,
        vendors: false,
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
        },
      };
    }
    return config;
  },
};
```

## Bundle Analysis

Analyze bundle size to identify optimization opportunities:

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your config
});

# Run analysis
ANALYZE=true npm run build
```

## Image Optimization Tools

### Online Tools
- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [Squoosh](https://squoosh.app/) - Advanced image compression
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - SVG optimization
- [ImageOptim](https://imageoptim.com/) - Mac app for image optimization

### CLI Tools
```bash
# Install sharp for image processing
npm install sharp

# Optimize images programmatically
const sharp = require('sharp');

sharp('input.jpg')
  .resize(800, 600)
  .webp({ quality: 80 })
  .toFile('output.webp');
```

## Current Implementation

**Status**: Next.js Image component ready, optimization guidelines documented

**Implemented:**
- ✅ Next.js automatic image optimization
- ✅ Font optimization (Inter font with subset)
- ✅ Automatic code splitting
- ✅ Tree shaking enabled
- ✅ SWC minification enabled

**Action Required:**
- Generate and optimize favicon/app icons
- Add any hero images or marketing assets
- Run bundle analysis before production
- Set up CDN for static assets (deployment phase)

## Performance Targets

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Web.dev Performance](https://web.dev/performance/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
