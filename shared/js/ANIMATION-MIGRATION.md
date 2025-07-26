# Animation System Migration

## Summary
The animation system has been migrated from the complex phase-based system to a simpler element-based system.

## Changes Made

### ❌ **Removed (Legacy)**
- `template-animations.js` → `template-animations-legacy.js` (archived)
- Complex phase system (intro/hold/exit)
- Global easing defaults
- Preset system with overrides

### ✅ **Current System**
- `template-animations-simple.js` - Main animation configuration
- `animation-examples.js` - Examples of how to modify animations
- `ANIMATION-GUIDE.md` - Complete documentation

## Why the Change?

The old system had:
- Complex phase management
- Global settings that affected all elements
- Difficult to modify individual elements
- Hard to understand structure

The new system has:
- Each element is self-contained
- No global dependencies
- Easy to modify any property
- Clear, simple structure

## Migration Path

If you need to recreate an animation from the legacy system:

### Legacy Format:
```javascript
TemplateAnimations.text.mainTitle.animations.intro = {
    from: { y: "+50", opacity: 0 },
    to: { y: "0", opacity: 1 },
    duration: 3,
    ease: "expo.out",
    delay: 0.5
}
```

### New Format:
```javascript
SimpleAnimations.elements.mainTitle.animateIn = {
    startFrame: 15, // delay 0.5s = frame 15 at 30fps
    duration: 3,
    ease: "expo.out",
    from: { y: 50, opacity: 0 },
    to: { y: 0, opacity: 1 }
}
```

## Key Differences
1. `startFrame` instead of `delay` - more predictable timing
2. No relative positioning (`"+50"` → `50`)
3. No separate phase management
4. Direct property modification instead of presets

## Current Animation Timing
All animations maintain the same visual appearance as before:
- 10-frame intervals between elements
- Same easing functions
- Same durations
- Visibility-aware timing (no gaps when elements hidden)