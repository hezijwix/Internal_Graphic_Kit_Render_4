# Simple Animation System Guide

## Overview
The new animation system in `template-animations-simple.js` makes it easy to modify animations without breaking anything. Each element has its own self-contained animation configuration.

## Key Benefits
- **Simple Structure**: Each element has its own animation settings
- **No Phases**: Got rid of complex intro/hold/exit phases
- **Individual Easing**: Each element can have its own easing function
- **Easy to Modify**: Change any property without affecting others
- **Visibility Aware**: Maintains consistent timing when elements are hidden

## Basic Structure

```javascript
SimpleAnimations.elements.elementName = {
    visible: true,  // Controls if element animates
    
    animateIn: {
        delay: 0.5,         // When to start (seconds) - LEGACY TIMING
        duration: 2,        // How long (seconds)
        ease: "power2.out", // Easing function
        from: {             // Starting state
            opacity: 0,
            y: 50
        },
        to: {               // Ending state
            opacity: 1,
            y: 0
        }
    },
    
    animateOut: {           // Optional exit animation
        startTime: 8,       // When to start exit (seconds)
        duration: 1,
        ease: "power2.in",
        to: {
            opacity: 0
        }
    }
};
```

## Quick Examples

### Change Animation Duration
```javascript
// Make main title animate faster
SimpleAnimations.elements.mainTitle.animateIn.duration = 1.5; // Was 3
```

### Change Easing
```javascript
// Make subtitle bounce
SimpleAnimations.elements.subtitle1.animateIn.ease = "bounce.out";
```

### Change Animation Type
```javascript
// Make icon scale in instead of rotate
SimpleAnimations.elements.topIcon.animateIn = {
    startFrame: 0,
    duration: 1,
    ease: "back.out(2)",
    from: { opacity: 0, scaleX: 0, scaleY: 0 },
    to: { opacity: 1, scaleX: 1, scaleY: 1 }
};
```

### Change Animation Delays
```javascript
// Make elements appear closer together
SimpleAnimations.elements.topTitle.animateIn.delay = 0.1; // Was 0.2
SimpleAnimations.elements.mainTitle.animateIn.delay = 0.3; // Was 0.5
```

## Available Easing Functions
- `"power1.out"`, `"power2.out"`, `"power3.out"`, `"power4.out"` - Smooth deceleration
- `"power1.in"`, `"power2.in"`, etc. - Smooth acceleration
- `"power1.inOut"`, `"power2.inOut"`, etc. - Smooth both ways
- `"bounce.out"` - Bouncy finish
- `"elastic.out(1, 0.3)"` - Elastic overshoot
- `"back.out(1.7)"` - Slight overshoot
- `"expo.out"` - Very smooth deceleration
- `"none"` or `"linear"` - No easing

## Animation Properties
- `opacity`: 0 to 1 (fade)
- `x`, `y`: Position offset in pixels
- `scaleX`, `scaleY`: Scale (1 = normal, 0 = invisible, 2 = double)
- `rotation`: Rotation in degrees

## Legacy Timing System
- Uses direct delays in seconds (no frame conversion needed)
- topIcon: 0.3s delay
- topTitle: 0.2s delay  
- mainTitle: 0.5s delay
- subtitle1: 1.0s delay
- subtitle2: 1.2s delay
- bottomIcons: 1.8s delay

## How Visibility Works
When elements are hidden, the system maintains consistent spacing:
- If mainTitle and subtitle1 are hidden, subtitle2 still animates with proper timing
- No gaps in the animation sequence
- Elements maintain their relative timing based on visible elements only

## Files
- `shared/js/template-animations-simple.js` - **Main configuration (EDIT THIS FILE)**
- `shared/js/animation-examples.js` - Example modifications
- `script.js` - Uses the configuration in `createGSAPTimeline()`
- `shared/js/template-animations-legacy.js` - Old system (archived, not used)
- `shared/js/ANIMATION-MIGRATION.md` - Migration notes from old system

## Tips
1. Test changes by playing the animation after each modification
2. Use browser console to debug: `console.log(SimpleAnimations.elements)`
3. Keep animations under 3 seconds for best user experience
4. Use consistent easing across similar elements
5. Test with different visibility combinations