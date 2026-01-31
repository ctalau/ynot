# yNot - yGuard TypeScript Deobfuscator

A TypeScript implementation of the yGuard deobfuscator with a web-based interface for deobfuscating Java stack traces.

## Features

- **TypeScript Library**: Complete port of yGuard deobfuscator from Java to TypeScript
- **Web Interface**: Browser-based UI for easy deobfuscation (client-side only, no server required)
- **100% Test Coverage**: All original Java test fixtures passing
- **Zero Dependencies**: Minimal runtime dependencies (only XML parsing)
- **Client-Side**: All processing happens in your browser

## Quick Start

### Web Interface

The easiest way to use yNot is through the web interface:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### TypeScript Library

Install as a dependency:

```bash
npm install ynot
```

Use in your code:

```typescript
import { deobfuscate } from 'ynot'

const stackTrace = 'at A.A.A.A.A()'
const mappingXml = '<xml>...</xml>'
const result = deobfuscate(stackTrace, mappingXml)
console.log(result) // 'at com.yworks.test.Test.run(Test.java:0)'
```

## Project Structure

- **src/**: Core TypeScript deobfuscator library
- **app/**, **components/**, **lib/**: Next.js web interface
- **fixtures/**: Test fixtures from yGuard Java project
- **java-reference/**: Standalone Java implementation for reference
- **docs/**: Documentation and research notes
- **tests/**: Test suite

## Documentation

- [WEB_README.md](./WEB_README.md) - Web interface documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide for Vercel
- [spec.md](./spec.md) - Full project specification
- [docs/](./docs/) - Implementation documentation

## Development

```bash
# Install dependencies
npm install

# Run web interface in development
npm run dev

# Build web interface for production
npm run build

# Build TypeScript library
npm run build:lib

# Run tests
npm test

# Lint and format
npm run lint
npm run format
```

## Based on yWorks/yGuard

This project is a TypeScript port of the deobfuscation logic from [yWorks/yGuard](https://github.com/yWorks/yGuard/).

## License

MIT
