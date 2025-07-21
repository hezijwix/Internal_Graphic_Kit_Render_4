# Wix Video Asset Creator - User Interface Design Document

## Layout Structure

The interface follows a three-panel layout with fixed positioning:

**Header Bar (60px height)**
- Left: Wix logo, project name (editable inline), auto-save indicator
- Center: Template name badge
- Right: Export button, account dropdown menu

**Main Content Area**
- Left Panel (300px width): Tool panel with collapsible sections
- Center-Right Panel (remaining width): Preview viewer with playback controls
- Bottom Panel (250px height): Timeline with layers, keyframes, and transport controls

**Spacing**: 1px divider lines between panels using #333333 color

## Core Components

**Tool Panel Components**
- Template selector card gallery with thumbnails
- Text properties section with font controls, size slider, weight dropdown
- Color swatches grid showing allowed palette options
- Icon library with upload button and preset grid
- Animation presets displayed as motion curve thumbnails

**Preview Viewer Components**
- Canvas area with checkerboard pattern for transparency
- Zoom percentage dropdown (25%, 50%, 100%, 200%, Fit)
- Play/pause toggle button with spacebar shortcut
- Current time display (00:00:00:00 format)
- Resolution indicator badge

**Timeline Components**
- Layer stack with visibility toggles and lock icons
- Timecode ruler with 30fps frame marks
- Playhead scrubber with current frame indicator
- Keyframe diamonds for animated properties
- Waveform visualization for audio layers
- Transport controls (beginning, previous frame, play/pause, next frame, end)

## Interaction Patterns

**Direct Manipulation**
- Click elements in preview to select and show properties
- Drag playhead for timeline scrubbing with real-time preview update
- Double-click text elements to edit inline
- Drag and drop icons from library to canvas

**Panel Interactions**
- Single-click to expand/collapse tool panel sections
- Hover states show hand cursor for interactive elements
- Selected elements highlight with white border
- Tab key navigation between form inputs

**Keyboard Shortcuts**
- Spacebar: Play/pause
- Left/Right arrows: Frame stepping
- Home/End: Jump to beginning/end
- Cmd/Ctrl + S: Save project
- Cmd/Ctrl + E: Export

## Visual Design Elements & Color Scheme

**Color Palette**
- Background: #0D0D0D (near black)
- Panel backgrounds: #1A1A1A (dark gray)
- Divider lines: #333333 (medium gray)
- Input fields: #262626 (lighter dark gray)
- Text/icons: #B3B3B3 (light gray)
- Active/selected: #FFFFFF (white)
- Hover states: #404040 (medium-light gray)
- Export button: #0066FF (primary blue)

**Component Styling**
- 2px radius on all buttons and inputs
- 1px borders using #404040 for input fields
- Drop shadows: none (flat design)
- Panel headers use uppercase text with 1.5px letter spacing

## Desktop Specifications

**System Requirements**
- Minimum viewport: 1440x900px
- Recommended: 1920x1080px or larger
- WebGL acceleration for smooth playback
- Browser requirements: Chrome/Edge/Firefox latest versions

**Desktop-Specific Features**
- Full screen mode support (F11)
- Multi-monitor support with detachable preview window (Phase B)
- Native OS file dialogs for import/export
- Right-click context menus for timeline and canvas elements
- Drag files from desktop directly into icon upload area

**Performance Optimizations**
- Hardware acceleration for canvas rendering
- Efficient memory usage for PNG sequence generation
- Background rendering queue for exports

## Typography

**Font Stack**
- Primary UI Font: 'Wix Madefor Text', -apple-system, BlinkMacSystemFont, sans-serif
- Monospace (timecodes): 'Wix Madefor Text', SF Mono, Monaco, Consolas

**Type Scale & Weights**
- Panel headers: 12px uppercase, 400 weight (regular), 1.5px letter spacing
- UI labels: 12px, 300 weight (thin)
- Input text: 13px, 400 weight (regular)
- Timeline markers: 10px, 300 weight (thin)
- Large numbers (time display): 16px, 400 weight (regular)
- Button text: 12px, 400 weight (regular)
- Tooltips: 11px, 300 weight (thin)

**Typography Guidelines**
- Avoid bold weights to maintain subtle, professional appearance
- Use regular (400) weight only for emphasis and important actions
- Default to thin (300) weight for most UI elements
- Increase font size rather than weight for hierarchy
- All caps sparingly, only for section headers with increased letter spacing

## Accessibility

**Keyboard Navigation**
- Full keyboard accessibility for all controls
- Focus indicators using 2px white outline
- Tab order follows logical left-to-right, top-to-bottom flow

**Visual Accessibility**
- Minimum contrast ratio 4.5:1 for normal text
- Contrast ratio 3:1 for large text and UI components
- Hover states provide additional 20% brightness increase
- All icons accompanied by text labels or tooltips

**Screen Reader Support**
- ARIA labels for all interactive elements
- Live regions for timeline position updates
- Descriptive button labels (not just icons)
- Role attributes for custom controls

**Motion Accessibility**
- Respect prefers-reduced-motion settings
- Option to disable auto-playing previews
- Timeline scrubbing includes numerical position indicator