# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a **Wix Video Asset Creator - Template Editor**, a professional web-based motion graphics template editor for creating animated video assets. It's a frontend-only implementation with a three-panel layout (tool panel, preview viewer, timeline) for customizing animation templates with real-time preview and export capabilities.

## Development Commands

### Running the Application
```bash
# Simply open in browser (no build process)
open index.html

# Or serve locally for optimal performance
python -m http.server 8000
# Then open http://localhost:8000
```

### Development Workflow
- **Live Development**: Direct file editing, no transpilation needed
- **Testing**: Manual testing in browser, use DevTools for debugging
- **Dependencies**: External CDN links (Konva.js, GSAP, Google Fonts)
- **Local Storage**: Project state persists automatically

## Project Structure
```
Internal_Graphic_Kit_Render_4/
├── index.html          # Main application + CDN dependencies
├── styles.css          # Complete CSS styling system
├── shared/js/template-engine.js # Single-class Konva-based editor
├── README.md           # Comprehensive documentation
└── Docs/               # Project specifications
    ├── wix-video-asset-creator-prd.md
    ├── wix-video-srs.md
    └── wix-video-ui-design.md
```

## Architecture Overview

### Core Technologies
- **Konva.js 9.2.0**: 2D canvas rendering engine with layered architecture
- **GSAP 3.12.2**: Professional animation timeline with frame-perfect scrubbing
- **Vanilla JavaScript**: ES6+ class-based architecture, no build tools
- **CSS Grid + Flexbox**: Three-panel responsive layout system

### Main Application Class
```javascript
class TemplateEditor {
  // Core canvas and animation state
  stage: Konva.Stage           // 1920x1080 main canvas
  backgroundLayer: Konva.Layer // Background elements
  contentLayer: Konva.Layer    // Text and graphics
  uiLayer: Konva.Layer         // UI overlays
  
  timeline: gsap.Timeline      // GSAP animation timeline
  templateObjects: {}          // Konva objects (text, shapes, icons)
  
  // Playback and frame control
  currentFrame: number         // 0-299 (300 total frames)
  isPlaying: boolean          // Animation state
  fps: 30, duration: 10       // 10-second animation
  
  // Viewport management
  zoomLevel: 10-400%          // Zoom range with pan support
  panX, panY: number          // Pan offset coordinates
}
```

### Key System Integrations

#### Konva.js Canvas System
- **Three-layer architecture**: Background → Content → UI layers for optimal performance
- **Object-based rendering**: Text, shapes, and graphics as interactive Konva objects
- **Event system**: Click, hover, selection with batchDraw() optimization
- **High-DPI support**: Automatic retina display scaling

#### GSAP Timeline Integration
- **Frame-perfect scrubbing**: Seek to any frame with sub-frame precision via `timeline.progress()`
- **Professional easing**: power2.out, back.out with stagger effects
- **Real-time updates**: Live Konva object updates during timeline scrubbing
- **Complex sequences**: Intro, hold, and exit phases with precise timing

#### Zoom & Pan System
- **Viewport management**: 10%-400% zoom with intelligent boundary constraints
- **Mouse interactions**: Wheel zoom at cursor position, drag-to-pan when zoomed
- **Fit-to-screen**: Automatic optimal zoom calculation
- **CSS transform integration**: Smooth zoom/pan via transform3d for hardware acceleration

## Key Features Implemented

### ✅ Core Application
- **Three-panel layout**: Tool panel (300px), canvas viewer, timeline (250px)
- **Konva.js integration**: Professional 2D canvas with layer management
- **GSAP timeline**: 10-second animation with frame-perfect scrubbing
- **Zoom & pan system**: 10%-400% zoom with drag-to-pan capabilities
- **Real-time preview**: Live updates during property changes
- **Auto-save system**: Local storage persistence every 30 seconds

### ✅ Template Customization
- **Text properties**: Main title, subtitle with font family/weight/size controls
- **Color system**: Curated swatches for text and background colors
- **Icon library**: Upload custom icons (PNG/SVG) or use presets
- **Animation presets**: Visual motion curve previews
- **Form state sync**: Real-time updates between UI controls and canvas

### ✅ Timeline & Playback
- **Transport controls**: Play/pause, previous/next frame, beginning/end
- **Interactive timeline**: Drag scrubber for precise frame positioning
- **Frame indicators**: Current frame display (0-299 of 300 total)
- **Keyboard shortcuts**: Space (play/pause), arrows (frame stepping)
- **Performance monitoring**: Real-time FPS and render time display

### ✅ Export System (Placeholder)
- **Export dropdown**: MP4 and PNG sequence options with progress animation
- **Simulated workflow**: Demo export process ready for backend integration
- **Frame capture ready**: Konva stage toDataURL() for frame-by-frame export

### 🚀 Usage Instructions
1. **Open application**: `open index.html` or serve locally
2. **Customize content**: Edit text, colors, fonts in left tool panel
3. **Preview animation**: Use play controls and timeline scrubber
4. **Navigate with shortcuts**: Space (play/pause), arrows (frame step)
5. **Test export**: Click Export button to see demo workflow

### 🔧 Development Notes
- **State management**: Single TemplateEditor class with centralized state
- **No build process**: Direct browser execution, CDN dependencies
- **Performance optimized**: Layer separation, batchDraw() optimization
- **Accessibility compliant**: ARIA labels, keyboard navigation, focus management

## Technical Implementation Details

### Canvas Rendering Architecture
```javascript
// Layer-based organization for performance
backgroundLayer.add(background);     // Static elements
contentLayer.add(mainTitle, subtitle, icon); // Animated content
uiLayer.add(selectionOutline);       // Interactive overlays

// Animation integration with GSAP
timeline.to(mainTitle, {
  x: 200,
  duration: 2,
  ease: "power2.out",
  onUpdate: () => contentLayer.batchDraw()
});
```

### State Management Pattern
```javascript
// Centralized state updates
updateTemplate(property, value) {
  this.templateObjects[element][property] = value; // Update Konva object
  this.saveProject();                             // Persist to localStorage
  this.contentLayer.batchDraw();                  // Redraw canvas
}
```

### Timeline Integration
- **Frame calculation**: `frame = Math.round(progress * 299)` for 0-299 range
- **Scrubbing**: `timeline.progress(frame / 299)` for precise positioning
- **Real-time sync**: Timeline updates trigger immediate canvas redraws
- **Performance**: Uses `requestAnimationFrame` for smooth playback

### Zoom System Implementation
- **Container transforms**: CSS `transform: scale() translate()` for hardware acceleration
- **Boundary constraints**: Prevents panning beyond canvas edges when zoomed
- **Mouse wheel handling**: Zoom at cursor position with coordinate transformation
- **Fit-to-screen**: Calculates optimal zoom to fit 1920×1080 canvas in viewport

## Browser Requirements
- Chrome/Chromium 90+, Firefox 88+, Safari 14+, Edge 90+
- **Required APIs**: Canvas 2D, Local Storage, ES6+ features
- **Performance**: Hardware acceleration recommended for smooth zoom/pan
- **Memory**: 4GB+ RAM for optimal performance during complex animations

## Next Development Steps

### Backend Integration Priorities
1. **Authentication**: User login, JWT tokens, session management
2. **Project storage**: Database persistence (PostgreSQL recommended)
3. **Template library**: Admin-managed templates with thumbnails
4. **Asset management**: File uploads, cloud storage (AWS S3)
5. **Export engine**: Server-side rendering, MP4/PNG generation
6. **Real-time features**: WebSocket integration for live collaboration

### Performance Optimizations
- **Canvas optimization**: Object pooling, selective redraws
- **Memory management**: Asset cleanup, garbage collection
- **Web Workers**: Background processing for export operations
- **Service Workers**: Caching strategy for offline capability