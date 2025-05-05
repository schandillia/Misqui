# Asset Management and Optimization Guide

## Current Structure

```
/public
├── mascot.svg
├── images/
│   ├── components/
│   └── backgrounds/
├── audio/
│   └── jingles/
└── fonts/
```

## Image Optimization

### 1. Next.js Image Component

```tsx
import Image from 'next/image'

// Instead of
<img src="/images/component.png" alt="Component" />

// Use
<Image
  src="/images/component.png"
  alt="Component"
  width={500}
  height={300}
  priority={true} // For above-the-fold images
  quality={75} // Default is 75, adjust based on needs
  loading="lazy" // For below-the-fold images
/>
```

### 2. Image Formats

- Use WebP format for photos and complex images
- Use SVG for icons and simple graphics
- Use PNG for images requiring transparency
- Use JPEG for photos where transparency isn't needed

### 3. Image Sizing

- Provide multiple sizes for responsive images
- Use `sizes` attribute for responsive images
- Implement proper srcset for different screen sizes

### 4. SVG Optimization

- Use SVGO for SVG optimization
- Remove unnecessary metadata
- Optimize paths and shapes
- Consider using SVGR for React components

## Audio Optimization

### 1. Audio Formats

- Use MP3 for broad compatibility
- Provide OGG as fallback
- Consider using WebM for better compression

### 2. Audio Loading

```tsx
// Lazy load audio files
const audio = new Audio("/audio/jingle.mp3")
audio.preload = "none" // Don't preload until needed
```

### 3. Audio Compression

- Compress audio files to appropriate bitrates
- Use variable bitrate encoding
- Consider using Web Audio API for advanced features

## Font Optimization

### 1. Font Loading Strategy

```tsx
// In your _document.tsx
<link
  rel="preload"
  href="/fonts/your-font.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

### 2. Font Formats

- Use WOFF2 as primary format
- Provide WOFF as fallback
- Consider using variable fonts

### 3. Font Subsetting

- Only include needed characters
- Use tools like `font-subset` or `pyftsubset`
- Consider using Google Fonts with `&display=swap`

## Caching Strategy

### 1. Cache Headers

```typescript
// In next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
}
```

### 2. Versioning

- Use content hashes in production
- Implement cache busting for critical assets
- Use version numbers for major updates

## CDN Integration

### 1. Vercel Edge Network

- Automatically enabled with Vercel deployment
- Global CDN distribution
- Automatic image optimization

### 2. Custom CDN Setup

```typescript
// In next.config.js
module.exports = {
  images: {
    domains: ["your-cdn.com"],
    path: "https://your-cdn.com/images",
  },
}
```

## Performance Monitoring

### 1. Lighthouse Metrics

- Monitor Core Web Vitals
- Track Largest Contentful Paint (LCP)
- Monitor Cumulative Layout Shift (CLS)

### 2. Asset Loading

- Implement proper loading strategies
- Use intersection observer for lazy loading
- Monitor asset loading times

## Implementation Examples

### 1. Responsive Images

```tsx
<Image
  src="/images/hero.jpg"
  alt="Hero Image"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  srcSet={`
    /images/hero-300.jpg 300w,
    /images/hero-600.jpg 600w,
    /images/hero-900.jpg 900w
  `}
  width={900}
  height={600}
/>
```

### 2. Audio Player

```tsx
const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.preload = "none"
    }
  }, [])

  return (
    <audio
      ref={audioRef}
      src="/audio/jingle.mp3"
      preload="none"
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
    />
  )
}
```

### 3. Font Loading

```tsx
// In your global CSS
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/your-font.woff2') format('woff2'),
       url('/fonts/your-font.woff') format('woff');
  font-display: swap;
  font-weight: 400;
  font-style: normal;
}
```

## Tools and Resources

### 1. Image Optimization

- [Squoosh](https://squoosh.app/) - Image compression
- [SVGO](https://github.com/svg/svgo) - SVG optimization
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing

### 2. Audio Optimization

- [FFmpeg](https://ffmpeg.org/) - Audio compression
- [Audacity](https://www.audacityteam.org/) - Audio editing
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) - Audio processing

### 3. Font Optimization

- [Font Subsetter](https://github.com/fonttools/fonttools) - Font subsetting
- [Google Fonts](https://fonts.google.com/) - Web fonts
- [Font Squirrel](https://www.fontsquirrel.com/) - Font conversion

## Best Practices Checklist

- [ ] Use Next.js Image component for all images
- [ ] Implement proper caching strategies
- [ ] Optimize all assets before deployment
- [ ] Use appropriate file formats
- [ ] Implement lazy loading where appropriate
- [ ] Monitor performance metrics
- [ ] Regular asset audits
- [ ] Backup original assets
- [ ] Document asset sources and licenses
- [ ] Implement proper error handling
