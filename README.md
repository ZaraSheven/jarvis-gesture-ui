# Jarvis Gesture Interface

A futuristic gesture-controlled interface inspired by Iron Man's Jarvis system.

## Features

- 🎥 Real-time hand gesture recognition using MediaPipe Hands
- ✨ Beautiful cyberpunk-style UI with particle effects
- 🎮 Interactive gesture commands
- 📱 Responsive design
- ⚡ Smooth animations and transitions

## Gesture Commands

| Gesture | Action |
|---------|--------|
| Open Palm | Activate system |
| Fist | Standby mode |
| Point Up | Navigate up |
| Point Left | Navigate left |
| Point Right | Navigate right |
| Thumbs Up | Confirm action |
| Thumbs Down | Cancel action |
| Peace | Take screenshot |

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **MediaPipe Hands** - Gesture recognition
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Usage

1. Open the application in your browser
2. Click "START" on the camera panel to enable gesture detection
3. Allow camera permissions when prompted
4. Perform gestures in front of your camera
5. Watch the interface respond to your commands!

## Project Structure

```
src/
├── components/          # React components
│   ├── JarvisUI.tsx    # Main interface
│   ├── ParticleSystem.tsx
│   ├── StatusPanel.tsx
│   ├── CentralVisual.tsx
│   ├── CommandPanel.tsx
│   └── GestureCamera.tsx
├── hooks/              # Custom hooks
│   └── useGestureDetection.ts
├── utils/              # Utility functions
│   └── gestureClassifier.ts
├── types/              # TypeScript types
│   └── gesture.ts
├── App.tsx
└── main.tsx
```

## License

MIT
