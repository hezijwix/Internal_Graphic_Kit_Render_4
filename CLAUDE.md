# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a **Wix Video Asset Creator - Multi-Template System**, a professional web-based motion graphics template editor for creating animated video assets. It features a template gallery (`index.html`) for selecting between multiple independent templates, each with their own assets and customization options. The system supports a three-panel layout (tool panel, preview viewer, timeline) for customizing animation templates with real-time preview and export capabilities.

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
├── index.html          # Template gallery & project selection
├── template_001.html   # Animated Title Card template
├── template_002.html   # Chapter template
├── styles.css          # Main application styles
├── wix_palette.md      # Color palette definitions (70 combinations)
├── api/
│   └── templates.json  # Template metadata & configuration
├── shared/
│   ├── assets/         # Global assets & thumbnails
│   ├── css/           # Shared stylesheets
│   │   ├── template-base.css    # Template UI framework
│   │   ├── gallery.css          # Template gallery styles
│   │   └── icon-gallery.css     # Icon selection system
│   └── js/            # Core application modules
│       ├── template-engine.js    # Konva-based template editor
│       ├── project-manager.js    # Project persistence & thumbnails
│       ├── gallery-manager.js    # Template gallery system
│       ├── simple-icon-gallery.js # Icon selection UI
│       ├── wix-color-palette.js  # Color palette system
│       └── animation-system.js   # GSAP animation framework
├── templates/         # Template-specific assets
│   ├── template_001/
│   │   └── assets/
│   │       └── icons/ # 62 template-specific icons
│   └── template_002/
│       └── assets/
│           └── icons/ # Duplicated icon set for independence
└── Docs/              # Project specifications
    ├── wix-video-asset-creator-prd.md
    ├── wix-video-srs.md
    └── wix-video-ui-design.md
```

## Architecture Overview

### Multi-Template System
- **Template Gallery** (`index.html`): Central hub for template selection and project management
- **Template Instances**: Independent HTML files (`template_001.html`, `template_002.html`) with shared core systems
- **Asset Isolation**: Each template has its own `/assets/` directory for complete independence
- **Metadata API**: `api/templates.json` provides template configuration and gallery integration
- **Shared Systems**: Common functionality through `/shared/js/` modules

### Core Technologies
- **Konva.js 9.2.0**: 2D canvas rendering engine with layered architecture
- **GSAP 3.12.2**: Professional animation timeline with frame-perfect scrubbing
- **Vanilla JavaScript**: ES6+ class-based architecture, no build tools
- **CSS Grid + Flexbox**: Three-panel responsive layout system

### Core Application Classes

#### TemplateEditor (shared/js/template-engine.js)
```javascript
class TemplateEditor {
  // Core canvas and animation state
  stage: Konva.Stage           // 1920x1080 main canvas
  backgroundLayer: Konva.Layer // Background elements
  contentLayer: Konva.Layer    // Text and graphics
  uiLayer: Konva.Layer         // UI overlays
  
  timeline: gsap.Timeline      // GSAP animation timeline
  templateObjects: {}          // Konva objects (text, shapes, icons)
  
  // Template configuration
  templateConfig: {}           // Template metadata (id, name, type)
  iconBasePath: string         // Template-specific icon directory
  
  // Playback and frame control
  currentFrame: number         // 0-299 (300 total frames)
  isPlaying: boolean          // Animation state
  fps: 30, duration: 10       // 10-second animation
  
  // Viewport management
  zoomLevel: 10-400%          // Zoom range with pan support
  panX, panY: number          // Pan offset coordinates
}
```

#### ProjectManager (shared/js/project-manager.js)
```javascript
class ProjectManager {
  // Project persistence and thumbnails
  createProject(templateId, name, config)
  loadProject(projectId)
  updateProjectConfig(projectId, config)
  updateProjectThumbnail(projectId, dataURL)
  getAllProjects()
  deleteProject(projectId)
  
  // Storage management
  checkStorageUsage()
  cleanupOldProjects(keepCount, daysOld)
  optimizeThumbnails(quality)
}
```

#### GalleryManager (shared/js/gallery-manager.js)
```javascript
class GalleryManager {
  // Template gallery and selection
  loadTemplates()              // Load from api/templates.json
  showTemplateSelectionModal()
  createProjectFromTemplate(templateId)
  filterTemplatesByCategory(category)
  displayProjects()            // User's saved projects
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

### ✅ Multi-Template System
- **Template Gallery**: Central hub with template selection and project management
- **Independent Templates**: Each template is a complete, standalone application
- **Asset Isolation**: Templates have dedicated `/assets/` directories for customization
- **Shared Core**: Common functionality through modular `/shared/js/` architecture
- **Project Persistence**: Cross-template project management with thumbnails
- **API-Driven**: Template metadata managed through `api/templates.json`

### ✅ Core Template Features
- **Three-panel layout**: Tool panel (300px), canvas viewer, timeline (250px)
- **Konva.js integration**: Professional 2D canvas with layer management
- **GSAP timeline**: 10-second animation with frame-perfect scrubbing
- **Zoom & pan system**: 10%-400% zoom with drag-to-pan capabilities
- **Real-time preview**: Live updates during property changes
- **Auto-save system**: Local storage persistence every 30 seconds

### ✅ Template Customization
- **Text properties**: Main title, subtitle with font family/weight/size controls
- **Color system**: 70 curated color combinations from `wix_palette.md`
- **Icon library**: Template-specific icon sets (62 icons per template)
- **Icon management**: SimpleIconGallery for easy icon selection and preview
- **Animation presets**: Visual motion curve previews
- **Form state sync**: Real-time updates between UI controls and canvas
- **Layer visibility**: Independent control of top icons, text layers, bottom icons

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

#### Template Gallery Workflow
1. **Start**: Open `index.html` - the template gallery
2. **Select Template**: Choose "Animated Title Card" or "Chapter" template
3. **Create Project**: Click "Create New Project" → Select template → Start editing
4. **Resume Projects**: Click on existing project thumbnails to continue editing

#### Template Editor Workflow
1. **Customize content**: Edit text, colors, fonts in left tool panel
2. **Select icons**: Click icon buttons to open SimpleIconGallery selection
3. **Choose colors**: Use curated color palette with 70 combinations
4. **Preview animation**: Use play controls and timeline scrubber
5. **Navigate with shortcuts**: Space (play/pause), arrows (frame step)
6. **Save project**: Auto-saves every 30s, manual save via header button
7. **Test export**: Click Export button to see demo workflow

#### Adding New Templates
1. **Duplicate template**: Copy `template_XXX.html` to new number
2. **Create assets**: Create `templates/template_XXX/assets/` directory
3. **Update metadata**: Add entry to `api/templates.json`
4. **Update references**: Change all internal paths and template config
5. **Add thumbnail**: Create `shared/assets/template-XXX-thumb.jpg`

### 🔧 Development Notes
- **Multi-template architecture**: Independent template files with shared core systems
- **State management**: TemplateEditor class with template-specific configuration
- **Asset organization**: Template-isolated assets for independent customization
- **Project management**: Cross-template project persistence with thumbnails
- **No build process**: Direct browser execution, CDN dependencies
- **Performance optimized**: Layer separation, batchDraw() optimization
- **Accessibility compliant**: ARIA labels, keyboard navigation, focus management

## Technical Implementation Details

### Multi-Template Architecture
```javascript
// Template configuration per instance
const templateConfig = {
  id: 'template_001',           // Unique template identifier
  name: 'Animated Title Card',  // Display name
  type: 'title-card',          // Template category
  iconBasePath: 'templates/template_001/assets/icons/'
};

// Template-specific asset loading
const iconGallery = new SimpleIconGallery({
  iconBasePath: templateConfig.iconBasePath
});
```

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
// Template-aware state management
updateTemplate(property, value) {
  this.templateObjects[element][property] = value; // Update Konva object
  this.scheduleAutoSave();                        // Trigger auto-save
  this.contentLayer.batchDraw();                  // Redraw canvas
}

// Project integration with thumbnails
const projectManager = new ProjectManager();
projectManager.updateProjectConfig(projectId, {
  texts: getCurrentTexts(),
  colors: getCurrentColors(),
  iconConfig: getIconConfiguration(),
  templateId: templateConfig.id
});
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

## Advanced Systems

### Color Palette System
- **Source**: `wix_palette.md` with 70 curated color combinations
- **Format**: ID, Background hex, Foreground hex for optimal contrast
- **Integration**: WixColorPalette class with real-time preview
- **Usage**: Automatic foreground/background color pairing

### Icon Management System
- **Per-Template Icons**: 62 unique icons per template in `/assets/icons/`
- **Categories**: Arrows (1-22), Celebrations (23-49), Stars (50-61), Misc (62)
- **Selection UI**: SimpleIconGallery with thumbnail preview
- **Dynamic Loading**: Template-specific icon paths with fallbacks

### Animation System Architecture
- **Shared Core**: `shared/js/animation-system.js` provides GSAP timeline framework
- **Template-Specific Animations**: Each template can have custom animations
  - **Template 001**: Uses `shared/js/template-animations-simple.js` (bounce effects, longer durations)
  - **Template 002**: Uses `templates/template_002/animations.js` (subtle slides, professional timing)
- **Animation Customization**: Templates define their own:
  - Timing sequences (delays, durations)
  - Easing functions (bounce, power, expo)
  - Motion patterns (scale, rotate, slide)
  - Entry/exit behaviors

### Project Management System
- **Cross-Template**: Projects work with any template type
- **Thumbnails**: High-quality canvas captures (600x338px)
- **Persistence**: localStorage with compression and cleanup
- **Recovery**: Auto-recovery from unsaved changes

## Next Development Steps

### Template Expansion
1. **New Templates**: Add template_003, template_004 following existing pattern
2. **Template Categories**: Expand beyond "titles" to "overlays", "intros", "outros"
3. **Template Variants**: Create template variations with different layouts
4. **Custom Animations**: Template-specific animation sequences

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
- **Template loading**: Lazy loading of template-specific assets
- **Icon caching**: Smart caching of frequently used icons
- **Thumbnail optimization**: Compressed thumbnails with quality controls
- **Web Workers**: Background processing for export operations
- **Service Workers**: Caching strategy for offline capability

## Current Templates

### Template 001: Animated Title Card
- **File**: `template_001.html`
- **Type**: Title card with professional branding
- **Assets**: `templates/template_001/assets/`
- **Features**: Top icon, main title, subtitles, bottom icons (0-6)
- **Use Case**: Video introductions, corporate branding

### Template 002: Chapter
- **File**: `template_002.html` 
- **Type**: Chapter markers and section dividers
- **Assets**: `templates/template_002/assets/` (independent copy)
- **Animations**: `templates/template_002/animations.js` (custom chapter animations)
  - Faster timing (0.2s base delay vs 0.3s)
  - Subtle slide-in effects from left (no bounce)
  - Professional easing (power2/power3 instead of back.out)
  - Simpler exits (fade only, no scale/rotation)
- **Features**: Same UI as Template 001, different animation personality
- **Use Case**: Video chapters, section markers, educational content