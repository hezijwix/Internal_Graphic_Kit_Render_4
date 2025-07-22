# GitHub Issues for Wix Video Asset Creator

Below are 5 detailed issue reports for the identified problems with the custom icon upload feature and icon display system.

## Issue 1: Upload Icon Button Design Issues

**Title:** Upload icon button is oversized and disrupts UI harmony

**Labels:** `enhancement`, `ui/ux`, `design`

**Body:**
### Problem Description
The upload icon button in the icon gallery modal is too large and visually disruptive, creating an inconsistent user experience that doesn't harmonize with the overall design language.

### Current Behavior
- Upload button appears oversized compared to other UI elements
- Button styling doesn't match the subtle design theme
- Creates visual hierarchy imbalance in the icon gallery

### Expected Behavior
- Upload button should be subtle and harmonious with existing design
- Should integrate seamlessly with the icon gallery layout
- Maintain consistent sizing and styling with other interactive elements

### Technical Details
- **File affected:** `shared/js/simple-icon-gallery.js`
- **Component:** Upload button in icon gallery modal
- **CSS styling:** Button dimensions, colors, and spacing need adjustment

### Acceptance Criteria
- [ ] Button size reduced to match other gallery elements
- [ ] Color scheme adjusted to be more subtle
- [ ] Maintains accessibility standards
- [ ] Visual hierarchy preserved in gallery layout

### Priority
Medium - UI/UX enhancement

---

## Issue 2: PNG Icon Color Handling

**Title:** PNG icons should maintain original colors and not be affected by template coloring

**Labels:** `bug`, `feature`, `icon-system`

**Body:**
### Problem Description
When users upload PNG icons, the system applies the same color transformation logic used for SVG icons, which incorrectly modifies the original RGB colors of PNG images.

### Current Behavior
- PNG icons are treated identically to SVG icons
- Color transformation (white color filter) applied to PNG images
- Original PNG colors are lost/modified during rendering

### Expected Behavior
- PNG icons should maintain their original RGB colors
- Only SVG icons should be subject to color transformation
- System should detect file type and handle each format appropriately

### Technical Details
- **Files affected:** 
  - `shared/js/template-engine.js` (icon creation methods)
  - `shared/js/simple-icon-gallery.js` (icon handling)
- **Root cause:** No differentiation between SVG and raster image handling
- **Impact:** PNG icons lose their intended visual appearance

### Proposed Solution
1. Add file type detection in icon processing
2. Create separate rendering paths for SVG vs PNG/JPG
3. Apply color transformations only to SVG icons
4. Preserve original pixel data for raster images

### Acceptance Criteria
- [ ] PNG icons display with original colors
- [ ] SVG icons continue to support color transformation
- [ ] File type detection implemented
- [ ] No regression in existing SVG functionality

### Priority
High - Functional bug affecting user experience

---

## Issue 3: Default Icons Not Displaying on Canvas Load

**Title:** Default icons show as circles instead of actual icons on template load

**Labels:** `bug`, `initialization`, `canvas-rendering`

**Body:**
### Problem Description
When the template loads initially, default icons appear as circles on the canvas instead of displaying the actual icon graphics. Icons only render correctly after user interaction or property changes.

### Current Behavior
- Template loads with placeholder circles instead of default icons
- Icons appear correctly only after user interaction
- Default icon loading seems to be deferred or failing on initialization

### Expected Behavior
- Default icons should be visible immediately when template loads
- All default icons (top icon + bottom icons) should render properly
- No user interaction required to see initial icon state

### Technical Details
- **Files affected:** `template_001.html`, `shared/js/template-engine.js`
- **Suspected cause:** Timing issue in icon loading during initialization
- **Default icon:** `icon-023-celebration.svg` used for all default slots

### Steps to Reproduce
1. Load template_001.html in browser
2. Observe canvas area
3. Notice circles instead of celebration icons
4. Change any property (triggers correct icon display)

### Proposed Solution
1. Ensure default icons are loaded synchronously during initialization
2. Add proper error handling for icon loading failures
3. Implement loading state management for icons
4. Force canvas redraw after all default icons are loaded

### Acceptance Criteria
- [ ] Default icons visible immediately on template load
- [ ] No placeholder circles on initial load
- [ ] All icon slots show proper default icons
- [ ] Loading performance remains acceptable

### Priority
High - Core functionality issue affecting first impression

---

## Issue 4: Icon State Loss When Changing Icon Count

**Title:** Icons reset to default when user modifies the number of bottom icons

**Labels:** `bug`, `state-management`, `data-persistence`

**Body:**
### Problem Description
When users adjust the icon count slider, all previously selected custom icons are lost and reset to the default celebration icon, forcing users to reconfigure their icon selections.

### Current Behavior
- User selects custom icons for bottom icon slots
- User changes icon count using slider (e.g., from 4 to 6 icons)
- All icons reset to default `icon-023-celebration.svg`
- Previous icon selections are lost

### Expected Behavior
- Icon state should be preserved when count changes
- Previously selected icons should remain in their original positions
- Only new slots should use default icons
- Icon configuration should persist across count modifications

### Technical Details
- **Files affected:** `template_001.html` (updateBottomIconsUI function)
- **Root cause:** UI regeneration destroys existing icon state
- **Impact:** Poor UX, forces users to reconfigure icons repeatedly

### Current Implementation Issue
```javascript
// Problem: Complete regeneration of UI elements
bottomIconsGrid.innerHTML = ''; // Destroys all state
window.bottomIconButtons = []; // Resets icon data
```

### Proposed Solution
1. Implement icon state preservation during count changes
2. Store icon configurations independently from UI elements
3. Restore previous selections when regenerating UI
4. Only reset icons when count decreases below current selection

### State Management Strategy
- Maintain icon state array separate from UI
- Map existing icons to new slots based on index
- Preserve custom selections during UI updates
- Implement smart default assignment for new slots

### Acceptance Criteria
- [ ] Icon selections preserved when increasing count
- [ ] Icon selections preserved when decreasing count (up to new limit)
- [ ] Only new slots get default icons
- [ ] No unexpected icon resets during slider interaction

### Priority
High - Significant usability issue

---

## Issue 5: Icon Color System Malfunction

**Title:** Icon color system not working properly - top icon unresponsive, bottom icons show colored bounding boxes

**Labels:** `bug`, `critical`, `color-system`, `rendering`

**Body:**
### Problem Description
The icon color system has two critical issues:
1. Top icon does not respond to color changes at all
2. Bottom icons display colored square bounding boxes instead of properly colored icon graphics

### Current Behavior
**Top Icon:**
- Color picker changes have no visual effect
- Icon remains in original color regardless of selection
- No error messages or feedback provided

**Bottom Icons:**
- Color changes affect entire bounding box/container
- Icons appear as colored squares instead of colored graphics
- Original icon shape/design is obscured by background coloring

### Expected Behavior
- Top icon should change color when user selects different colors
- Bottom icons should show colored icon graphics, not colored backgrounds
- Icon shapes should remain visible with applied color overlay
- Color changes should be immediate and visually clear

### Technical Details
- **Files affected:** `shared/js/template-engine.js`
- **Methods involved:** 
  - `colorizeReferenceSVG()`
  - `createSVGTopIconFromGallery()`
  - `createSVGBottomIconFromGallery()`

### Current Issues Identified

**Top Icon Problem:**
- Color transformation may not be applied to top icon
- Event handlers possibly not connected properly
- SVG colorization failing for top icon instance

**Bottom Icons Problem:**
- Color being applied to container/background instead of SVG content
- Incorrect CSS filter or fill application
- Bounding box styled instead of actual icon graphics

### Debugging Information Needed
- Console logs during color change attempts
- Inspection of generated SVG markup
- Verification of color transformation application
- CSS styling analysis of icon containers

### Proposed Investigation Steps
1. Add detailed logging to color transformation methods
2. Verify SVG content modification during color changes
3. Check CSS styling application for both top and bottom icons
4. Test color system with different icon types (SVG vs PNG)

### Acceptance Criteria
- [ ] Top icon responds to all color picker changes
- [ ] Bottom icons show colored graphics (not colored backgrounds)
- [ ] Icon shapes remain clearly visible after color application
- [ ] Color changes are immediate and smooth
- [ ] Color system works consistently across all icon slots

### Priority
Critical - Core feature completely non-functional

### Additional Context
This issue significantly impacts the user experience as color customization is a key feature of the template system. Users expect to be able to color-coordinate icons with their brand colors.

---

## Summary

These 5 issues represent the main problems with the current icon system implementation:

1. **UI Polish** - Upload button design harmony
2. **File Type Handling** - PNG color preservation  
3. **Initialization** - Default icon display on load
4. **State Management** - Icon persistence during count changes
5. **Color System** - Complete color functionality breakdown

**Priority Order for Development:**
1. Issue #5 (Critical - Color system)
2. Issue #3 (High - Default icon display) 
3. Issue #4 (High - State management)
4. Issue #2 (High - PNG handling)
5. Issue #1 (Medium - UI polish)

Each issue includes detailed technical analysis, reproduction steps, and clear acceptance criteria to guide development work. 