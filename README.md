# doakes

Sergeant Doakes is Watching.

## Features

- 🎥 **Auto-playing video** - Video starts playing automatically when the website opens (muted for autoplay compatibility)
- 🎵 **Background music** - Looping background audio with play/pause controls
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 📘 **TypeScript** - Type-safe code for better developer experience
- 🎨 **Tailwind CSS v4** - Modern utility-first CSS framework
- 📱 **Responsive Design** - Works on all device sizes

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173/`

## Customization

### Using Your Own Media Files

To use your own video and audio files:

1. Place your files in the `public` directory:
   - `public/video.mp4` - Your video file
   - `public/music.mp3` - Your audio file

2. Update the URLs in `src/main.ts`:
   ```typescript
   const VIDEO_URL = '/video.mp4'
   const AUDIO_URL = '/music.mp3'
   ```

### Browser Autoplay Policy

Modern browsers restrict autoplay with sound. The video is muted by default to allow autoplay. The background music requires user interaction (clicking the play button) to start.

## Technology Stack

- **Vite 6.4.1** - Build tool
- **TypeScript 5.7+** - Programming language
- **Tailwind CSS 4.1.17** - Styling
- **HTML5 Video & Audio APIs** - Media playback

## Project Structure

```
doakes/
├── public/          # Static assets
├── src/
│   ├── main.ts     # Application entry point
│   └── style.css   # Tailwind CSS imports
├── index.html      # HTML template
├── package.json    # Dependencies
├── tsconfig.json   # TypeScript config
└── vite.config.ts  # Vite config
```

## License

See LICENSE file for details.
