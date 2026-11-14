# @iamclaudia/screenshot

<p align="center">
  <img src="https://raw.githubusercontent.com/iamclaudia-ai/screenshot/refs/heads/main/assets/social-preview.jpg" alt="@iamclaudia/screenshot" width="100%" />
</p>

Generate high-quality screenshots from HTML files using Playwright.

## Features

- 🎯 Simple CLI interface
- 🖼️ Support for PNG and JPEG formats
- 📐 Customizable viewport dimensions
- 🎨 Retina-quality output (2x device scale)
- 🚀 Fast and reliable with Playwright
- 📦 Zero configuration needed

## Installation

```bash
# Use with npx (no installation required)
npx @iamclaudia/screenshot page.html

# Or install globally
npm install -g @iamclaudia/screenshot
```

## Usage

### Basic Usage

```bash
# Generate a PNG screenshot with default settings
npx @iamclaudia/screenshot page.html

# Specify output filename
npx @iamclaudia/screenshot page.html screenshot.png

# Use JPEG format
npx @iamclaudia/screenshot page.html --format jpg

# Use size presets for common social media platforms
npx @iamclaudia/screenshot page.html --size github
npx @iamclaudia/screenshot page.html --size og --format jpg
npx @iamclaudia/screenshot page.html --size twitter

# Custom dimensions
npx @iamclaudia/screenshot page.html --width 1920 --height 1080

# Output to specific directory
npx @iamclaudia/screenshot page.html --outdir ./screenshots

# Real example: The social preview image above was generated using this package!
npx @iamclaudia/screenshot assets/social-preview.html social-preview.jpg --outdir assets --size github --format jpg
```

### Size Presets

Use `--size` to quickly generate screenshots optimized for different platforms:

| Preset      | Dimensions   | Description                          |
|-------------|--------------|--------------------------------------|
| `github`    | 1280×640     | GitHub social preview                |
| `og`        | 1200×630     | Open Graph (Facebook, LinkedIn)      |
| `twitter`   | 1200×675     | Twitter/X card                       |
| `instagram` | 1080×1080    | Instagram post (square)              |
| `hd`        | 1920×1080    | HD/Full HD                           |
| `4k`        | 3840×2160    | 4K/Ultra HD                          |

You can override preset dimensions with `--width` and `--height`:

```bash
# Use Twitter preset but make it wider
npx @iamclaudia/screenshot page.html --size twitter --width 1600
```

### CLI Options

```
Usage: npx @iamclaudia/screenshot HTML_FILE [OUT_FILE] [OPTIONS]

Arguments:
  HTML_FILE              Path to the HTML file to screenshot (required)
  OUT_FILE              Output filename (optional, default: basename.format)

Options:
  --size PRESET         Use a size preset (github, og, twitter, instagram, hd, 4k)
  --width WIDTH         Viewport width in pixels (default: 1280)
  --height HEIGHT       Viewport height in pixels (default: 720)
  --format FORMAT       Image format: png, jpg, jpeg (default: png)
  --outdir DIR          Output directory (default: current directory)
  --help, -h            Show help message

Note: --width and --height override --size preset values
```

## Programmatic Usage

You can also use this package programmatically in your Node.js projects:

```typescript
import { generateScreenshot } from '@iamclaudia/screenshot';

// Using size preset
await generateScreenshot('page.html', 'output.png', {
  size: 'github',
  format: 'jpg',
  outdir: './screenshots'
});

// Using custom dimensions
await generateScreenshot('page.html', 'output.png', {
  width: 1920,
  height: 1080,
  format: 'png',
  outdir: './screenshots'
});
```

### API

#### `generateScreenshot(htmlFile, outputFile?, options?)`

Generates a screenshot from an HTML file.

**Parameters:**

- `htmlFile` (string, required): Path to the HTML file
- `outputFile` (string, optional): Output filename (default: basename + format extension)
- `options` (object, optional):
  - `size` ('github' | 'og' | 'twitter' | 'instagram' | 'hd' | '4k'): Size preset
  - `width` (number): Viewport width in pixels (default: 1280, overrides size preset)
  - `height` (number): Viewport height in pixels (default: 720, overrides size preset)
  - `format` ('png' | 'jpg' | 'jpeg'): Image format (default: 'png')
  - `outdir` (string): Output directory (default: current directory)
  - `quality` (number): JPEG quality 0-100 (default: 85, only for JPEG)

**Returns:** Promise<string> - The full path to the generated screenshot

## Requirements

- Node.js 18 or higher
- Playwright will automatically download required browser binaries on first use

## License

MIT © [Michael Carter](https://github.com/kiliman)

## Author

Created by [Michael Carter](https://github.com/kiliman)
