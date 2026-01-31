# yNot - Web Interface

A web-based interface for deobfuscating Java stack traces obfuscated by yGuard. This is a client-side application built with Next.js that runs entirely in your browser.

## Features

- **Client-Side Processing**: All deobfuscation happens in your browser - no data is sent to any server
- **Drag & Drop**: Upload mapping files by dragging and dropping
- **Example Fixtures**: Load pre-configured examples to test the deobfuscator
- **Copy & Download**: Easily copy or download deobfuscated output
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatically adapts to your system theme

## Getting Started

### Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

This creates a static export in the `out/` directory that can be deployed to any static hosting service.

### Start Production Server (for testing)

```bash
npm run build
npm run start
```

## How to Use

1. **Load an Example (Optional)**
   - Select a category from the "Fixture Selector"
   - Choose a specific fixture
   - Click "Load" to populate the inputs

2. **Provide Input**
   - **Stack Trace**: Paste your obfuscated Java stack trace in the left text area
   - **Mapping File**:
     - Paste the yGuard mapping XML in the right text area, OR
     - Click "Upload File" to select a file, OR
     - Drag and drop a mapping XML file

3. **Deobfuscate**
   - Click the "Deobfuscate" button
   - The deobfuscated output will appear below

4. **Use the Output**
   - Click "Copy to Clipboard" to copy the result
   - Click "Download" to save as a text file

## Project Structure

```
├── app/
│   ├── globals.css       # Global styles with Tailwind
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page with deobfuscator UI
├── components/
│   ├── FixtureSelector.tsx   # Example fixture loader
│   ├── MappingInput.tsx      # Mapping file input
│   ├── ResultDisplay.tsx     # Deobfuscated output display
│   └── StackInput.tsx        # Stack trace input
├── lib/
│   ├── deobfuscator.ts   # Deobfuscator logic wrapper
│   └── fixtures.ts       # Fixture metadata
├── public/
│   └── fixtures/         # Example fixtures (copied during build)
└── src/                  # Core TypeScript deobfuscator library
```

## Technology Stack

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Custom Deobfuscator**: TypeScript port of yGuard deobfuscator

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## Configuration

### Next.js Config (next.config.mjs)

The app is configured for static export:

```javascript
export default {
  output: 'export',          // Static HTML export
  images: {
    unoptimized: true,       // No image optimization
  },
  distDir: 'out',            # Output directory
}
```

### Tailwind Config (tailwind.config.cjs)

Configured to scan all app and component files:

```javascript
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  ...
}
```

## Available Fixtures

The app includes example fixtures organized by category:

- **Common Mappings**: Basic class/method deobfuscation
- **Invalid Mappings**: Handling missing mappings
- **Leading Dollar**: Classes with `$` prefix
- **Module Qualified**: Java 9+ modules
- **Prefixed**: Obfuscation with prefixes
- **Overload**: Method overloading

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production (static export)
npm run build

# Start production server
npm run start

# Build library only
npm run build:lib

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run typecheck
```

## Browser Support

- Chrome/Edge: Latest
- Firefox: Latest
- Safari: Latest
- Mobile browsers: iOS Safari, Chrome Mobile

## Performance

- Initial load: < 500KB (gzipped)
- All processing: Client-side
- No server required
- Works offline after initial load

## Privacy

- **No data collection**: Nothing is sent to any server
- **No cookies**: No tracking or analytics
- **No external requests**: All processing happens locally

## Contributing

This web interface is part of the yNot project. See the main [README.md](./README.md) for contribution guidelines.

## License

MIT License - See [LICENSE](./LICENSE) file

## Acknowledgments

- Based on [yWorks/yGuard](https://github.com/yWorks/yGuard/)
- TypeScript implementation maintains feature parity with the Java version
