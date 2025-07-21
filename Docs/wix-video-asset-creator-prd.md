# Wix Video Asset Creator - Product Requirements Document

## 1. Elevator Pitch

A web-based motion graphics tool that empowers Wix's internal communication team to independently create professional animated video assets (titles, intros, closures) using pre-designed templates. By providing controlled customization options within a simplified After Effects-like interface, this tool dramatically reduces motion designers' workload while maintaining brand consistency. Users can modify text, colors, icons, and animations within templates, then export as MP4 videos or PNG sequences with alpha channel support.

## 2. Who is this app for

**Primary Users**: Wix internal communication team content writers who need to create video assets quickly without motion design expertise.

**Secondary Stakeholders**: 
- Design team who creates and controls templates to maintain brand consistency
- Motion designers who save time by not creating repetitive assets

## 3. Functional Requirements

### Core Features
- **User Authentication**: Email/password login system
- **Project Management**: Create, save, edit, and delete projects
- **Template System**: 
  - Browse and select from pre-designed 2D templates
  - Templates built with Konva canvas, supporting PNG/SVG assets
  - GSAP-powered animations with 30fps playback
- **Customization Controls**:
  - Edit text with custom fonts and weights
  - Modify colors from allowed palette
  - Upload custom icons or select from presets
  - Choose from pre-defined animation variations
  - Maintain accurate margins and element relationships
- **Preview System**:
  - Real-time preview viewer (right panel)
  - Scrubable GSAP timeline (bottom panel)
  - Tool panel for modifications (left panel)
- **Export Capabilities**:
  - MP4 video format
  - PNG sequence with alpha channel support
  - Frame naming convention: _0001, _0002, etc.
  - Resolution: 1920x1080 (with additional social media sizes)
  - Duration: 5-10 seconds
- **Rendering**: Client-side frame-by-frame rendering from GSAP timeline

### Technical Requirements
- Browser-based application
- Support for custom fonts and font weights
- High-quality SVG rendering
- PNG with alpha channel support
- 30fps animation playback
- Client-side rendering engine

## 4. User Stories

1. **As a content writer**, I want to log into the system so I can access my saved projects and create new ones.

2. **As a content writer**, I want to browse available templates so I can choose one that fits my video's needs.

3. **As a content writer**, I want to customize the text in my selected template so it displays my specific content with the correct font and styling.

4. **As a content writer**, I want to adjust colors within allowed options so the asset matches my video's theme while staying on-brand.

5. **As a content writer**, I want to upload my own icons or choose from presets so I can personalize the template.

6. **As a content writer**, I want to preview my animation in real-time and scrub through the timeline so I can see exactly how it will look.

7. **As a content writer**, I want to export my completed asset as an MP4 or PNG sequence so I can use it in my video editing software.

8. **As a content writer**, I want to save my project and return to it later so I can make adjustments without starting over.

## 5. User Interface

### Layout Structure
- **Header**: Logo, project name, save button, user account menu
- **Main Canvas Area** (Center-Right): 
  - Preview viewer showing real-time template rendering
  - Zoom controls and play/pause button
- **Tool Panel** (Left Side):
  - Template selection gallery
  - Property panels for selected elements:
    - Text editor (font family, size, weight, content)
    - Color picker (limited to approved colors)
    - Icon uploader/selector
    - Animation preset selector
- **Timeline** (Bottom):
  - GSAP timeline visualization
  - Playhead scrubber
  - Play/pause controls
  - Frame counter (30fps)
  - Export button

### Visual Design Principles
- Clean, professional interface matching Wix's internal tools aesthetic
- Clear visual hierarchy with the preview as focal point
- Intuitive controls similar to video editing software
- Real-time feedback for all changes
- Disabled/grayed out options for non-editable template elements

## 6. Development Phases

### Phase A - Core Template Engine (MVP)
**Goal**: Prove the concept with a single working template

**Deliverables**:
- One fully functional 2D template (Konva/GSAP)
- Template customization controls:
  - Text editing with custom fonts
  - Color modification
  - Icon upload/selection
  - Animation preset selection
- Preview functionality:
  - Real-time preview viewer
  - GSAP timeline with scrubbing
  - Play/pause controls
- Export capabilities:
  - MP4 export
  - PNG sequence with alpha channel
- Basic UI with three-panel layout (no navigation/menu system)

**Success Criteria**: Content writers can successfully customize and export a single template

### Phase B - Full System Implementation
**Goal**: Build the complete application infrastructure

**Deliverables**:
- User authentication system (email/password)
- Project management:
  - Create/save/edit/delete projects
  - Project listing screen
  - Navigation between projects
- Template gallery:
  - Multiple templates
  - Template selection interface
- Admin capabilities:
  - Design team template management
  - Usage analytics
- Enhanced features:
  - Multiple resolution options
  - Additional template types
  - Potential sharing capabilities

**Success Criteria**: Full production-ready system with multiple users creating various video assets