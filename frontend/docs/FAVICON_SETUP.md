# Favicon and App Icons Setup Guide

## T090: Add Favicon and App Icons

This guide explains how to add favicon and app icons to the Next.js application.

## Required Icons

Next.js 14+ uses the App Router convention for icons. Place these files in the `app/` directory:

### 1. Favicon (app/favicon.ico)
- **Size**: 32x32 or 16x16 pixels
- **Format**: ICO
- **Location**: `app/favicon.ico`
- **Usage**: Automatically detected by Next.js

### 2. Apple Touch Icon (app/apple-icon.png)
- **Size**: 180x180 pixels
- **Format**: PNG
- **Location**: `app/apple-icon.png`
- **Usage**: iOS home screen icon

### 3. App Icon (app/icon.png)
- **Size**: Multiple sizes (192x192, 512x512)
- **Format**: PNG
- **Location**: `app/icon.png`
- **Usage**: PWA icon, Android home screen

### 4. Open Graph Image (app/opengraph-image.png)
- **Size**: 1200x630 pixels
- **Format**: PNG or JPG
- **Location**: `app/opengraph-image.png`
- **Usage**: Social media sharing preview

### 5. Twitter Image (app/twitter-image.png)
- **Size**: 1200x600 pixels
- **Format**: PNG or JPG
- **Location**: `app/twitter-image.png`
- **Usage**: Twitter card preview

## Implementation Steps

### Step 1: Create Icon Files

Use a design tool (Figma, Sketch, Canva) or online generator:

1. **Design Base Icon** (1024x1024 px)
   - Simple, recognizable design
   - High contrast for visibility
   - Works at small sizes

2. **Generate Multiple Sizes**
   - Use tools like [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Or [Favicon.io](https://favicon.io/)

3. **Export Files**
   ```
   app/
   ├── favicon.ico          (32x32)
   ├── icon.png             (512x512)
   ├── apple-icon.png       (180x180)
   ├── opengraph-image.png  (1200x630)
   └── twitter-image.png    (1200x600)
   ```

### Step 2: Verify Next.js Detection

Next.js automatically detects these files and generates appropriate meta tags:

```html
<!-- Automatically generated -->
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/icon.png" type="image/png" />
<link rel="apple-touch-icon" href="/apple-icon.png" />
<meta property="og:image" content="/opengraph-image.png" />
<meta name="twitter:image" content="/twitter-image.png" />
```

### Step 3: Test Icons

1. **Browser Tab**: Check favicon appears in browser tab
2. **Bookmarks**: Verify icon shows in bookmarks
3. **iOS Home Screen**: Add to home screen on iPhone/iPad
4. **Android Home Screen**: Add to home screen on Android
5. **Social Sharing**: Test Open Graph preview on Facebook/LinkedIn
6. **Twitter Cards**: Test Twitter card preview

## Alternative: Dynamic Icon Generation

For dynamic icons, create `app/icon.tsx`:

```typescript
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(to bottom, #3b82f6, #2563eb)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
        }}
      >
        T
      </div>
    ),
    { ...size }
  );
}
```

## Current Status

**Status**: Documentation created, icons need to be generated

**Action Required**:
1. Design base icon (1024x1024)
2. Generate required sizes using online tool
3. Place files in `app/` directory
4. Test across devices and platforms

## Resources

- [Next.js Metadata Files](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
