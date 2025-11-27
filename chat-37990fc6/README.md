# Voice Journal App

A modern journaling application with voice recording capabilities built with React and Tailwind CSS.

## Features

### 🎤 Voice Recording
- **Browser-based speech recognition** using webkitSpeechRecognition (no paid APIs)
- **Pulsing mic animation** during recording
- **Real-time status updates**: "Listening...", "Processing...", etc.
- **Graceful error handling** for microphone permissions and network issues

### 📝 Smart Templates
- **Template guides** shown only in the modal (not saved to journal)
- **Automatic transcript filtering** removes template text from final entries
- **Preserves paragraph formatting** and line breaks
- **Supports both Reflections and Gratitude sections**

### 🎨 UI/UX Enhancements
- **Smooth fade-in/out transitions** for modal
- **Responsive design** works on all devices
- **Visual feedback** with animations and status indicators
- **Keyboard shortcuts** (ESC to close modal)
- **Professional styling** with Tailwind CSS

### 🔧 Technical Features
- **Fallback mechanisms** for unsupported browsers
- **Retry logic** for network errors
- **Local audio backup** when recognition fails
- **TypeScript support** for better development experience

## Getting Started

### Prerequisites
- Node.js 18+
- Modern browser (Chrome/Edge recommended for speech recognition)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd voice-journal-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Voice Recording
1. Click the **"Voice"** button next to Reflections or Gratitude
2. Review the template guide (this won't be saved)
3. Click the **microphone button** to start recording
4. Speak naturally - the template text is automatically filtered out
5. The app automatically processes and saves your entry

### Manual Text Entry
- Click in any text area to type manually
- Templates are shown as placeholders but not required
- Mix voice and text as needed

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Speech Recognition | ✅ | ✅ | ❌ | ✅* |
| Audio Recording | ✅ | ✅ | ✅ | ✅ |
| Fallback Text Input | ✅ | ✅ | ✅ | ✅ |

*Safari may require user interaction before speech recognition works

## Project Structure

```
voice-journal-app/
├── src/
│   ├── components/
│   │   └── VoiceModal.jsx          # Voice recording modal
│   ├── App.jsx                     # Main application
│   ├── main.jsx                    # Entry point
│   ├── index.css                   # Global styles
│   └── App.css                     # App-specific styles
├── public/
│   └── index.html                  # HTML template
├── bulletproofSpeechRecognition.ts # Speech recognition engine
└── package.json                    # Dependencies
```

## Key Components

### BulletproofSpeechRecognition
A robust speech recognition system that:
- Uses native webkitSpeechRecognition when available
- Falls back to MediaRecorder + manual transcription
- Handles network errors gracefully
- Provides retry logic and timeout management

### VoiceModal
A polished modal interface that:
- Shows template guides without saving them
- Filters template text from transcripts
- Provides visual feedback during recording
- Handles errors gracefully

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features
1. Voice recording logic: Modify `BulletproofSpeechRecognition`
2. UI changes: Update `VoiceModal` and `App` components
3. Styling: Edit Tailwind classes in component files

## Troubleshooting

### "Speech recognition not supported"
- Use Chrome or Edge for best results
- Check if microphone permissions are granted
- Try refreshing the page

### "Microphone permission denied"
- Click the microphone icon in your browser's address bar
- Allow microphone access
- Refresh the page

### Voice recording not working
1. Check browser compatibility (Chrome recommended)
2. Ensure microphone permissions are granted
3. Try using a different browser
4. Use the text input fallback option

## License

MIT License - feel free to use this in your own projects!