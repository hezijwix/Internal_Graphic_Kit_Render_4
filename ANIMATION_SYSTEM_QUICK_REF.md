# 🎬 Animation System - Quick Reference

## 🚀 Console Commands

Open browser console and use these commands with `templateEditor`:

### 🔧 **NEW: Timeline Debugging Commands**
```javascript
// Test if timeline is working
templateEditor.testTimeline();

// Check timeline status
console.log('Timeline:', templateEditor.timeline);
console.log('Duration:', templateEditor.timeline.duration());
console.log('Progress:', templateEditor.timeline.progress());

// Force timeline recreation
templateEditor.createGSAPTimeline();

// Manual playback test
templateEditor.timeline.play();
templateEditor.timeline.pause();
templateEditor.timeline.seek(2); // Go to 2 seconds
```

### 🎭 **NEW: Phase Control Commands**
```javascript
// Quick phase toggles
templateEditor.quickAnimateIn(true);     // Enable animate-in
templateEditor.quickAnimateIn(false);    // Disable animate-in
templateEditor.quickAnimateOut(true);    // Enable animate-out
templateEditor.quickAnimateOut(false);   // Disable animate-out

// Quick actions (as requested by user)
templateEditor.quickDisableAnimateOut(); // Disable ALL animate-out
templateEditor.quickEnableAnimateOut();  // Enable ALL animate-out

// Check current phase status
templateEditor.quickPhaseStatus();

// Individual element phase control
templateEditor.setElementAnimateIn('topIcon', false);    // Disable specific element animate-in
templateEditor.setElementAnimateOut('mainTitle', true);  // Enable specific element animate-out

// Advanced phase controls
templateEditor.setAnimateInEnabled(true);   // Global animate-in toggle
templateEditor.setAnimateOutEnabled(false); // Global animate-out toggle
templateEditor.setHoldEnabled(true);        // Global hold phase toggle
```

### Quick Preset Switching
```javascript
// Switch to different animation styles
templateEditor.quickPreset('fadeIn');
templateEditor.quickPreset('scaleUp');
templateEditor.quickPreset('spiral');
templateEditor.quickPreset('slideInLeft'); // Default
```

### Debug & Inspect
```javascript
// Debug full animation system state
templateEditor.debugAnimationSystem();

// Check what's available
templateEditor.getAnimationPresets();
templateEditor.getCurrentAnimationPreset();

// Check element visibility
templateEditor.isElementVisible('topIcon');

// Get animation system config
templateEditor.getAnimationSystemConfig();
```

### Quick Element Animation Changes
```javascript
// Make top icon spin dramatically
templateEditor.quickElementAnim('topIcon', {
    intro: {
        from: { rotation: -720, scale: 0.1 },
        to: { rotation: 0, scale: 1 },
        duration: 2.0,
        ease: "power2.out"
    }
});

// Disable subtitle animation
templateEditor.quickElementAnim('subtitle1', {
    intro: { duration: 0, from: { opacity: 1 }, to: { opacity: 1 } }
});

// Make main title bounce in
templateEditor.quickElementAnim('mainTitle', {
    intro: {
        ease: "bounce.out",
        duration: 2.0
    }
});
```

### Speed Controls
```javascript
// Speed up all animations
templateEditor.animationSystem.global.timing.elementDelay = 0.05;
templateEditor.updateGSAPTimeline();

// Slow down for dramatic effect
templateEditor.animationSystem.global.timing.elementDelay = 0.3;
templateEditor.updateGSAPTimeline();

// Reset to normal
templateEditor.resetAnimationSystem();
```

## 📍 Quick Access Locations

### ⚠️ **CURRENT STATUS: Animate-Out Disabled**
```javascript
// As requested by user, ALL animate-out animations are currently DISABLED
// Elements will animate IN and stay visible (no animate-out)
// Timeline structure: Animate-In → Hold (stay visible)

// To check current status:
templateEditor.quickPhaseStatus();

// To re-enable animate-out if needed:
templateEditor.quickEnableAnimateOut();
```

### In Code (template-engine.js)
```javascript
// Find animation system config
search: "ANIMATION SYSTEM - CENTRALIZED CONFIGURATION"

// Find animation system methods  
search: "ANIMATION SYSTEM METHODS"

// Find GSAP timeline integration
search: "createGSAPTimeline()"
```

### Element Names
- `topIcon` - Top icon element
- `topTitle` - Top title text  
- `mainTitle` - Main title (2 lines)
- `subtitle1` - First subtitle
- `subtitle2` - Second subtitle
- `bottomIcons` - Bottom icons array

### Built-in Presets
- `slideInLeft` - Default slide from left
- `fadeIn` - Simple fade effect
- `scaleUp` - Scale from center with bounce
- `spiral` - Dramatic spiral rotation

## ⚡ Common Quick Fixes

### **🆘 Timeline Not Playing - EMERGENCY FIX**
```javascript
// Step 1: Check timeline exists
console.log(templateEditor.timeline);

// Step 2: Test timeline functionality
templateEditor.testTimeline();

// Step 3: Force recreation if needed
templateEditor.createGSAPTimeline();

// Step 4: Test basic playback
templateEditor.timeline.play();
```

### Make Animation Faster
```javascript
templateEditor.animationSystem.global.timing.elementDelay = 0.05;
templateEditor.updateGSAPTimeline();
```

### Add Dramatic Bounce to All Elements
```javascript
templateEditor.quickPreset('scaleUp');
```

### Disable All Element Delays (Simultaneous)
```javascript
templateEditor.animationSystem.global.timing.elementDelay = 0;
templateEditor.updateGSAPTimeline();
```

### Create Custom Smooth Preset
```javascript
templateEditor.animationSystem.presets.smooth = {
    name: "Smooth",
    description: "Ultra smooth animations",
    icon: "✨",
    overrides: {
        all: {
            intro: {
                from: { opacity: 0, scale: 0.98 },
                to: { opacity: 1, scale: 1 },
                duration: 1.5,
                ease: "power1.out"
            }
        }
    }
};
templateEditor.quickPreset('smooth');
```

## 🎯 Animation Properties Quick Reference

| Property | Description | Example Values |
|----------|-------------|----------------|
| `x`, `y` | Position offset | `-100`, `0`, `50` |
| `opacity` | Transparency | `0` (invisible) to `1` (visible) |
| `scale` | Size multiplier | `0.1`, `1` (normal), `2.0` |
| `rotation` | Rotation degrees | `-45`, `0`, `360` |
| `duration` | Animation time | `0.5`, `1.0`, `2.0` seconds |
| `ease` | Easing function | `"power2.out"`, `"bounce.out"` |

## 🔧 Troubleshooting Commands

```javascript
// Check if elements exist and are visible
Object.keys(templateEditor.animationSystem.elements).forEach(element => {
    console.log(`${element}: visible=${templateEditor.isElementVisible(element)}`);
});

// Check base positions
console.log(templateEditor.positionStates.base);

// Check template objects exist
console.log('Template Objects:', templateEditor.templateObjects);

// Check layer visibility
console.log('Layer Visibility:', templateEditor.layerVisibility);

// Reset everything if broken
templateEditor.resetAnimationSystem();

// Manually refresh timeline
templateEditor.updateGSAPTimeline();

// Force fallback timeline if animation system is broken
templateEditor.createFallbackTimeline();
```

## 💡 Pro Tips

1. **Timeline Broken?** - Use `templateEditor.testTimeline()` first
2. **Always use `quickPreset()` first** - Start with built-in styles
3. **Use `debugAnimationSystem()`** - Shows everything at once
4. **Test with `quickElementAnim()`** - Quick single changes
5. **Reset with `resetAnimationSystem()`** - When things go wrong
6. **Check visibility first** - Invisible elements won't animate
7. **Use fallback timeline** - If animation system fails completely

---

**Location**: Animation System is in `shared/js/template-engine.js`  
**Documentation**: See `ANIMATION_SYSTEM_DOCS.md` for full details  
**Console Access**: `templateEditor.animationSystem` or helper methods  
**Emergency**: `templateEditor.createFallbackTimeline()` if all else fails 