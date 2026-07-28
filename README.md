# rePlay

A visual novel case-solving game built with Next.js 16, React 19, and Tailwind CSS v4.

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+

## Setup

```bash
# Install dependencies
npm install
```

No environment variables or API keys are required to run the app.

## Development

```bash
# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production

```bash
# Build
npm run build

# Start production server
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run pixelize` | Run the pixel art pipeline |

## Project Structure

```
src/
  app/          Next.js pages and layouts
  components/   UI, VN, evidence, and toolkit components
  lib/          Engine logic, schemas, and utilities
public/
  vn-assets/    Character sprites, backgrounds, and palettes
scripts/        Pixel art generation and asset utilities
content/
  cases/        Case story files
```

## Pixel Art Pipeline

The pixel art assets in `public/vn-assets/` are generated from reference photos using scripts in `scripts/`. See `docs/pixel-art-guide.md` for details.
