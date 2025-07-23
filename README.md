# Wix Video Asset Creator - Template Editor

A professional web-based motion graphics template editor for creating animated video assets. This frontend-only implementation provides a fully functional interface for customizing templates with real-time preview and timeline controls.

## 🚀 Quick Start

### Option 1: Direct Browser Opening
Simply double-click `index.html` or drag it into your browser to run the app directly.

### Option 2: Local Server (Recommended)
For optimal performance and to avoid CORS issues:

```bash
# Navigate to project directory
cd path/to/Internal_Graphic_Kit_Render_4

# Start local server (choose one):
python3 -m http.server 8000        # Python 3
php -S localhost:8000               # PHP (macOS/Linux)
npx serve .                         # Node.js

# Open in browser
open http://localhost:8000          # macOS
start http://localhost:8000         # Windows
xdg-open http://localhost:8000      # Linux
```

### Browser Compatibility
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**No build process required** - all dependencies loaded via CDN.

## 🚀 Features

### Core Functionality
- **Three-Panel Layout**: Tool panel, preview viewer, and timeline
- **Real-time Preview**: Live canvas rendering with 1920×1080 resolution
- **Timeline Control**: Scrubable timeline with 30fps playback
- **Template Customization**: Text, colors, fonts, icons, and animations
- **Keyboard Shortcuts**: Professional editor shortcuts (Space, arrows, Ctrl+S, etc.)
- **Auto-save**: Automatic project saving every 30 seconds

### User Interface Components

#### Header Bar
- Wix logo and branding
- Editable project name
- Auto-save indicator
- Template name badge
- Export button with progress animation
- User account avatar

#### Tool Panel (Left)
- **Template Selector**: Grid of available templates
- **Text Properties**: Main text, subtitle, font family, weight, and size controls
- **Color Controls**: Curated color swatches for text and background
- **Icon Library**: Upload custom icons or choose from presets
- **Animation Presets**: Visual motion curve previews
- **Collapsible Sections**: Organized property groups

#### Preview Area (Center-Right)
- **Canvas Viewer**: 1920×1080 preview with checkerboard transparency background
- **Advanced Zoom Controls**: 10% to 400% zoom range with +/- buttons and dropdown
- **Fit to Screen**: Intelligent fitting that calculates optimal zoom level
- **Pan & Zoom**: Mouse wheel zoom and drag-to-pan when zoomed in
- **Playback Controls**: Play/pause with visual state indicators
- **Time Display**: Precise timecode (MM:SS:SS:FF format)
- **Resolution Badge**: Current output resolution indicator

#### Timeline Panel (Bottom)
- **Transport Controls**: Beginning, previous frame, play/pause, next frame, end
- **Layer Management**: Visibility toggles, lock controls, layer selection
- **Timeline Track**: Interactive scrubber with keyframe visualization
- **Timecode Ruler**: Second markers for precise navigation
- **Playhead**: Draggable position indicator

### Technical Features

#### Canvas Rendering (Konva.js)
- **Konva.js Stage**: Professional 2D canvas library
- **Layered Architecture**: Background, content, and UI layers for performance
- **Object-Oriented**: Text, shapes, and graphics as interactive objects
- **High-Quality Rendering**: Anti-aliased text and shapes
- **Event System**: Click, hover, and selection interactions
- **Performance Optimized**: Efficient redrawing with batchDraw()
- **Retina Display**: Automatic high-DPI support

#### Zoom & Pan System
- **Zoom Range**: 10% to 400% with smooth scaling
- **Intelligent Fitting**: Calculates optimal zoom to fit viewport
- **Mouse Wheel Zoom**: Precise zoom control at cursor position
- **Drag to Pan**: When zoomed >100%, drag canvas to navigate
- **Constraint System**: Prevents panning beyond canvas boundaries
- **Smooth Transitions**: CSS transform-based smooth zoom/pan

#### Animation System (GSAP Timeline)
- **GSAP Timeline**: Professional animation sequencing with precise timing
- **Multiple Ease Types**: power2.out, back.out, power2.in with stagger effects
- **Complex Animations**: Fade in/out, slide motions, rotation, staggered exits
- **Frame-Perfect Scrubbing**: Seek to any frame with sub-frame precision
- **Real-time Updates**: Live preview during timeline scrubbing
- **Professional Timing**: 10-second duration with intro, hold, and exit phases

#### State Management
- Local storage persistence
- Project auto-save functionality
- Form state synchronization
- Undo/redo ready architecture

#### Accessibility
- Full keyboard navigation
- ARIA labels and roles
- Focus management
- Screen reader compatible
- High contrast support
- Reduced motion preferences

## 🎨 Design System

### Color Palette
- **Primary Background**: `#0D0D0D` (Near black)
- **Secondary Background**: `#1A1A1A` (Dark gray)
- **Panel Background**: `#262626` (Lighter dark gray)
- **Border Color**: `#333333` (Medium gray)
- **Text Primary**: `#FFFFFF` (White)
- **Text Secondary**: `#B3B3B3` (Light gray)
- **Accent Blue**: `#0066FF` (Primary action color)

### Typography
- **Primary Font**: Wix Madefor Text (official Wix brand font)
- **Fallbacks**: Inter, system fonts
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semi Bold), 700 (Bold), 800 (Extra Bold)
- **Hierarchy**: Uppercase section headers with letter spacing
- **Monospace**: SF Mono for timecodes and technical displays

### Layout
- **Minimum Viewport**: 1440×900px
- **Tool Panel Width**: 300px
- **Timeline Height**: 250px
- **Header Height**: 60px
- **Border Radius**: 2px consistent

## 🛠️ File Structure

```
Internal_Graphic_Kit_Render_4/
├── index.html          # Main application structure + Konva.js CDN
├── styles.css          # Complete CSS styling
├── script.js           # Konva-based template editor functionality
├── README.md           # This documentation
└── Docs/               # Project specifications
    ├── wix-video-asset-creator-prd.md
    ├── wix-video-srs.md
    └── wix-video-ui-design.md
```

### External Dependencies
- **Konva.js 9.2.0**: Loaded via CDN for 2D canvas functionality
- **GSAP 3.12.2**: Loaded via CDN for professional animation timeline

## 📱 Browser Support

### Requirements
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dependencies
- **Konva.js 9.2.0**: 2D canvas library for professional rendering
- **GSAP 3.12.2**: Professional animation library for timeline control
- **Wix Madefor Text**: Official Wix brand font via Google Fonts
- CSS Grid and Flexbox
- ES6+ JavaScript features
- Local Storage API

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause toggle |
| `←` / `→` | Previous/Next frame |
| `Home` / `End` | Go to beginning/end |
| `Ctrl/Cmd + S` | Save project |
| `Ctrl/Cmd + E` | Export |
| `Ctrl/Cmd + +` | Zoom in |
| `Ctrl/Cmd + -` | Zoom out |
| `Ctrl/Cmd + 0` | Fit to screen |
| `Tab` | Navigate between controls |
| `Enter` | Confirm project name edit |
| `Mouse Wheel` | Zoom in/out at cursor position |

## 🎬 Template System (Konva Objects)

### Default Template: "Animated Title Card"
- **Background**: Konva.Rect with solid color fill
- **Main Title**: Konva.Text object with center alignment
- **Subtitle**: Konva.Text object with responsive sizing
- **Icon Element**: Konva.Rect placeholder (ready for Konva.Image)
- **Interactive Objects**: Click to select, hover effects
- **Layer Management**: Organized in background, content, and UI layers

### Animation Properties
- **Duration**: 10 seconds (300 frames)
- **Frame Rate**: 30fps
- **Easing**: Cubic ease-in-out
- **Movement**: Horizontal slide animations

## 💾 Data Persistence

### Local Storage Schema
```javascript
{
  "name": "Project Name",
  "template": "Template: Animated Title Card",
  "mainText": "Welcome to Wix",
  "subtitle": "Create Amazing Videos",
  "fontSize": "72",
  "fontFamily": "inter",
  "fontWeight": "400",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Auto-save Features
- Saves every 30 seconds automatically
- Manual save with Ctrl/Cmd+S
- Project name updates trigger save
- Visual save status indicator

## 🔧 Customization Options

### Text Properties
- **Content**: Main title and subtitle text
- **Font Family**: Wix Madefor Text (default), Inter, Roboto, Helvetica
- **Font Weight**: Regular (400), Medium (500), Semi Bold (600), Bold (700), Extra Bold (800)
- **Font Size**: 12px - 120px range slider

### Color System
- **Text Colors**: White, Blue, Red, Teal, Light Blue, Green
- **Background Colors**: Black, Dark Gray, Dark Blue, Slate
- **Selection Visual**: Active state highlighting

### Icon Library
- **Upload Support**: PNG, SVG files up to 2MB
- **Preset Icons**: Star, Checkmark, Lightning, Heart
- **Grid Layout**: 4-column responsive grid

## 🚀 Getting Started

1. **Open the Application**
   ```bash
   open index.html
   ```
   Or serve with a local server for best performance.

2. **Customize Your Template**
   - Edit text in the tool panel
   - Select colors from the swatches
   - Adjust font properties with sliders
   - Upload or select icons

3. **Preview and Timeline**
   - Use play controls to preview animation
   - Scrub timeline for precise positioning
   - Use keyboard shortcuts for efficiency

4. **Export (Simulated)**
   - Click Export button for demo workflow
   - Shows progress animation
   - Ready for backend integration

## 🎯 Next Steps for Backend Integration

### Phase B Implementation Roadmap

1. **Authentication System**
   - User login/registration
   - JWT token management
   - Session persistence

2. **Project Management**
   - Database storage (PostgreSQL)
   - Project CRUD operations
   - User project lists

3. **Template System**
   - Template library with thumbnails
   - Admin template management
   - Template versioning

4. **Asset Management**
   - File upload handling
   - Cloud storage (AWS S3)
   - Asset optimization

5. **Export Engine**
   - Server-side rendering
   - MP4 video generation
   - PNG sequence export
   - Background job processing

6. **Real-time Features**
   - WebSocket integration
   - Live collaboration
   - Real-time preview sync

## 📈 Performance Considerations

### Optimizations Implemented
- Efficient canvas rendering
- Debounced input handling
- Smooth CSS transitions
- Optimized event listeners
- Memory leak prevention

### Future Optimizations
- Web Workers for rendering
- Service Worker caching
- Lazy loading assets
- Progressive enhancement

## 🎨 Design Principles

### User Experience
- **Professional Feel**: Dark theme matching video editing software
- **Intuitive Layout**: Three-panel design familiar to editors
- **Responsive Feedback**: Immediate visual updates
- **Error Prevention**: Guided workflows and validation

### Accessibility
- **Keyboard First**: Complete keyboard navigation
- **Screen Readers**: Proper ARIA implementation
- **High Contrast**: Professional color scheme
- **Motion Sensitive**: Respects user preferences

## 📝 Development Notes

### Code Architecture
- **Modular JavaScript**: Class-based organization
- **CSS Custom Properties**: Consistent design tokens
- **Semantic HTML**: Accessible structure
- **Progressive Enhancement**: Works without JavaScript basics

### Browser Compatibility
- **Modern Standards**: ES6+ features
- **Vendor Prefixes**: WebKit compatibility
- **Graceful Degradation**: Fallback support
- **Performance**: 60fps animations

---

**Built for Wix Video Asset Creator** | Professional motion graphics template editor
**Status**: Frontend Complete | Ready for backend integration
**Last Updated**: January 2024 