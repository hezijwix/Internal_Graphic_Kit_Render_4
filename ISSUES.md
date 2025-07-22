# Wix Video Asset Creator - Known Issues

## Issue #1: New Project Creation Navigation Problem
**Priority**: Medium  
**Component**: Project Creation Flow (`index.html` → `template_001.html`)  
**Status**: Open  

### Description
When creating a new project from the main gallery page (`index.html`), the user is automatically redirected to the template editor (`template_001.html`) without remaining on the main page. This disrupts the expected user workflow.

### Expected Behavior
- User clicks "Create New Project" or selects a template
- New project is created in the background
- User remains on the main gallery page (`index.html`)
- User can see their new project in the gallery
- User can manually navigate to edit when ready

### Current Behavior
- User clicks "Create New Project" or selects a template
- User is immediately redirected to `template_001.html?projectId=...`
- User has no choice but to enter edit mode immediately

### Files Affected
- `index.html` - Gallery page with project creation
- `shared/js/gallery-manager.js` - Project creation logic
- `shared/js/project-manager.js` - Project management system

### Technical Notes
The issue likely stems from automatic navigation code in the project creation flow that immediately redirects to the template editor instead of staying on the gallery page.

---

## Issue #2: Content Changes Break Animation Timeline
**Priority**: High  
**Component**: Template Engine Animation System  
**Status**: Open  

### Description
When users modify content properties (text, colors, etc.) in the template editor, the animation timeline gets corrupted and the "animate in" effects are deleted or broken. This results in static content instead of the expected animated sequence.

### Expected Behavior
- User changes text content (e.g., main title, subtitle)
- User changes colors or other properties
- Animation timeline remains intact
- All "animate in" effects continue to work properly
- Content changes are reflected in the animated sequence

### Current Behavior
- User changes any content property
- Animation timeline gets corrupted
- "Animate in" effects disappear or stop working
- Content appears static without proper animation
- Timeline may show empty or broken keyframes

### Files Affected
- `template_001.html` - Template editor interface
- `shared/js/template-engine.js` - Animation timeline management
- Form input handlers for text and property changes

### Technical Notes
This is likely related to:
1. GSAP timeline reconstruction when content changes
2. Improper handling of template object updates
3. Missing timeline preservation during property updates
4. Event handlers that don't properly maintain animation state

### Impact
This is a critical UX issue as it breaks the core functionality of animated templates when users customize content.

---

## Issue #3: Main Title Font Size Constraints
**Priority**: Low  
**Component**: Text Property Controls  
**Status**: Open  

### Description
The main title font size control needs proper minimum and maximum constraints to ensure optimal visual presentation and prevent extremely small or large text that could break the template layout.

### Expected Behavior
- Main title font size should have a minimum of 100px
- Main title font size should have a maximum of 300px
- Input controls should enforce these limits
- UI should clearly indicate the valid range
- Values outside this range should be automatically clamped

### Current Behavior
- No apparent font size limits on main title
- Users can potentially set extremely large or small font sizes
- No visual indicators of recommended size ranges
- Potential layout breaking with extreme values

### Files Affected
- `template_001.html` - Font size input controls
- `shared/js/template-engine.js` - Text property validation
- `shared/css/template-base.css` - UI styling for size controls

### Technical Notes
Implementation should include:
1. HTML input `min="100" max="300"` attributes
2. JavaScript validation in property update handlers
3. Visual range indicators in the UI
4. Automatic clamping of out-of-range values
5. User feedback when limits are reached

### Recommended Implementation
```javascript
// Font size validation example
function validateMainTitleFontSize(size) {
    const MIN_SIZE = 100;
    const MAX_SIZE = 300;
    return Math.max(MIN_SIZE, Math.min(MAX_SIZE, parseInt(size) || MIN_SIZE));
}
```

---

## Development Notes

### Priority Order
1. **Issue #2** (Animation Timeline) - Critical functionality issue
2. **Issue #1** (Navigation Flow) - UX workflow issue  
3. **Issue #3** (Font Size Limits) - Polish/validation issue

### Testing Checklist
When fixing these issues, ensure:
- [ ] Project creation workflow allows staying on gallery page
- [ ] All content changes preserve animation timeline
- [ ] Font size limits are properly enforced
- [ ] Auto-save functionality works with all fixes
- [ ] Template export maintains quality after fixes
- [ ] Backward compatibility with existing projects

### Related Files Overview
```
├── index.html                 # Main gallery (Issue #1)
├── template_001.html         # Template editor (Issues #2, #3)
├── shared/
│   ├── js/
│   │   ├── gallery-manager.js      # Project creation (Issue #1)
│   │   ├── project-manager.js      # Project management (Issue #1)
│   │   └── template-engine.js      # Animation system (Issues #2, #3)
│   └── css/
│       └── template-base.css       # UI styling (Issue #3)
```

---

*Last Updated: $(date)*  
*Status: All issues documented, awaiting development priority assignment* 