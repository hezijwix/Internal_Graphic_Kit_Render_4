# 🎬 Animation System Documentation

## Overview

The **Animation System** is a centralized, configuration-driven animation framework for the Wix Video Asset Creator. It provides a clean, organized way to manage all element animations with **separate control over animate-in and animate-out phases**, easy customization, and preset switching capabilities.

### ⚠️ **CURRENT STATUS: Animate-Out Disabled**
As per user request, **ALL animate-out animations are currently DISABLED**. Elements will animate in and stay visible throughout the timeline without exit animations.

- **Timeline Structure**: Animate-In (0-2s) → Hold (2-10s) 
- **Behavior**: Elements animate to base positions and remain visible
- **Control**: Can be re-enabled globally or per-element as needed

## 🏗️ Architecture

### Location in Code
- **Main Configuration**: `TemplateEditor.animationSystem` object
- **Methods**: Search for `// ANIMATION SYSTEM METHODS` section in `template-engine.js`
- **Integration**: Used in `createGSAPTimeline()` method
- **Phase Controls**: New methods for separate animate-in/animate-out control

### Core Components

```javascript
this.animationSystem = {
    global: {        // Global settings
        duration,    // Total animation duration
        phases,      // Animation phases (intro, hold, exit)
        phaseControls, // NEW: Enable/disable phases
        timing,      // Timing constants
        defaultEasing // Default easing functions
    },
    elements: {      // Per-element animation definitions
        topIcon: {
            animateIn: { enabled, from, to, duration, ease, order },
            animateOut: { enabled, to, duration, ease }
        },
        // ... other elements
    },
    presets: {       // Animation style presets
        current,     // Currently active preset
        slideInLeft, // Slide in from left preset
        fadeIn,      // Fade in preset
        scaleUp,     // Scale up preset
        spiral       // Spiral in preset
    }
}
```

## 📝 Configuration Structure

### Global Settings with Phase Controls

```javascript
global: {
    duration: 10,  // Total animation duration in seconds
    phases: {
        intro: { start: 0, end: 2 },   // Elements animate in (0-2s)
        hold: { start: 2, end: 8 },    // Elements stay visible (2-8s)
        exit: { start: 8, end: 10 }    // Elements animate out (8-10s)
    },
    // NEW: PHASE CONTROL SYSTEM
    phaseControls: {
        enableAnimateIn: true,   // Global toggle for animate-in phase
        enableAnimateOut: false, // Global toggle for animate-out phase (DISABLED)
        enableHold: true         // Global toggle for hold phase
    },
    timing: {
        elementDelay: 0.15,  // Delay between each element (cascade)
        exitStagger: 0.08,   // Stagger delay for exit animations
        iconStagger: 0.1     // Individual stagger for bottom icons
    },
    defaultEasing: {
        intro: "power2.out",      // Default intro easing
        exit: "power2.in",        // Default exit easing
        bounce: "back.out(1.7)"   // Bounce easing for special effects
    }
}
```

### Element Configuration (Updated Structure)

Each element now has separate `animateIn` and `animateOut` configurations:

```javascript
elementName: {
    name: "Display Name",    // Human-readable name
    
    // ANIMATE-IN PHASE
    animateIn: {
        enabled: true,       // Individual element toggle
        from: {              // Starting position/state
            x: 0,            // X offset from base position
            y: -50,          // Y offset from base position
            opacity: 0,      // Starting opacity
            scale: 0.3,      // Starting scale
            rotation: -45    // Starting rotation (degrees)
        },
        to: {                // End position/state (base position)
            x: 0,            // X offset from base position
            y: 0,            // Y offset from base position
            opacity: 1,      // Final opacity
            scale: 1,        // Final scale
            rotation: 0      // Final rotation
        },
        duration: 1.0,       // Animation duration
        ease: "back.out(1.7)", // Easing function
        order: 0             // Animation sequence order
    },
    
    // ANIMATE-OUT PHASE
    animateOut: {
        enabled: false,      // Individual element toggle (DISABLED)
        to: {                // Exit animation properties
            x: 0,
            y: -100,
            opacity: 0,
            scale: 1.5,
            rotation: 45
        },
        duration: 1.5,
        ease: "power2.in"
    }
}
```

### Animation Presets (Updated)

```javascript
presets: {
    current: 'slideInLeft',  // Active preset name
    
    presetName: {
        name: "Preset Display Name",
        description: "What this preset does",
        icon: "🎭",              // Visual icon
        overrides: {
            all: {               // Apply to all elements
                animateIn: {     // Updated to use new structure
                    // Override properties for all elements
                }
            },
            elementName: {       // Element-specific overrides
                animateIn: {
                    // Override properties for specific element
                }
            }
        }
    }
}
```

## 🎯 API Methods

### Basic Usage

```javascript
// Get animation config for an element
const config = templateEditor.getAnimationConfig('topIcon');

// Set animation for specific element (updated structure)
templateEditor.setElementAnimation('topIcon', {
    animateIn: {
        duration: 2.0,
        ease: "elastic.out(1, 0.3)"
    }
});

// Switch animation preset
templateEditor.setAnimationPreset('fadeIn');

// Get available presets
const presets = templateEditor.getAnimationPresets();

// Get current preset
const current = templateEditor.getCurrentAnimationPreset();
```

### NEW: Phase Control Methods

```javascript
// Global phase controls
templateEditor.setAnimateInEnabled(true);    // Enable/disable all animate-in
templateEditor.setAnimateOutEnabled(false);  // Enable/disable all animate-out
templateEditor.setHoldEnabled(true);         // Enable/disable hold phase

// Element-specific phase controls
templateEditor.setElementAnimateIn('topIcon', false);    // Disable element animate-in
templateEditor.setElementAnimateOut('mainTitle', true);  // Enable element animate-out

// Bulk operations
templateEditor.disableAllAnimateOut();  // Disable all animate-out (current state)
templateEditor.enableAllAnimateOut();   // Re-enable all animate-out

// Status checking
templateEditor.getPhaseControls();      // Get all phase control states
```

### Quick Access Methods

```javascript
// Quick phase toggles
templateEditor.quickAnimateIn(true);         // Quick animate-in toggle
templateEditor.quickAnimateOut(false);       // Quick animate-out toggle
templateEditor.quickDisableAnimateOut();     // Quick disable all animate-out
templateEditor.quickEnableAnimateOut();      // Quick enable all animate-out

// Status display
templateEditor.quickPhaseStatus();           // Show detailed phase status

// Element animation
templateEditor.quickElementAnim('topIcon', {
    animateIn: {
        duration: 2.0,
        ease: "bounce.out"
    }
});
```

### Advanced Usage

```javascript
// Modify global timing
templateEditor.animationSystem.global.timing.elementDelay = 0.1;

// Add custom preset with new structure
templateEditor.animationSystem.presets.myCustom = {
    name: "My Custom Animation",
    description: "Custom animation style",
    icon: "✨",
    overrides: {
        all: {
            animateIn: {
                from: { opacity: 0, scale: 0.5, rotation: 180 },
                to: { opacity: 1, scale: 1, rotation: 0 },
                duration: 1.0,
                ease: "bounce.out"
            }
        }
    }
};

// Apply custom preset
templateEditor.setAnimationPreset('myCustom');
```

## 🛠️ Common Use Cases

### 1. Change Single Element Animation (Updated)

```javascript
// Make top icon spin dramatically
templateEditor.setElementAnimation('topIcon', {
    animateIn: {
        from: { rotation: -720, scale: 0.1 },
        to: { rotation: 0, scale: 1 },
        duration: 2.0,
        ease: "power2.out"
    }
});
```

### 2. Control Animation Phases

```javascript
// Animate-in only (current setup)
templateEditor.setAnimateInEnabled(true);
templateEditor.setAnimateOutEnabled(false);

// Animate-out only
templateEditor.setAnimateInEnabled(false);
templateEditor.setAnimateOutEnabled(true);

// Both phases
templateEditor.setAnimateInEnabled(true);
templateEditor.setAnimateOutEnabled(true);

// Neither (elements appear instantly)
templateEditor.setAnimateInEnabled(false);
templateEditor.setAnimateOutEnabled(false);
```

### 3. Element-Specific Phase Control

```javascript
// Disable animate-in for subtitle, but keep others
templateEditor.setElementAnimateIn('subtitle1', false);

// Enable animate-out only for main title
templateEditor.setElementAnimateOut('mainTitle', true);
```

### 4. Timeline Behavior Modification

```javascript
// Current setup: Animate-In → Hold (stay visible)
// Duration: 0-2s animate-in, 2-10s hold

// To restore original: Animate-In → Hold → Animate-Out
templateEditor.quickEnableAnimateOut();
// Duration: 0-2s animate-in, 2-8s hold, 8-10s animate-out

// Instant appearance: Skip animate-in
templateEditor.quickAnimateIn(false);
// Duration: 0-8s hold, 8-10s animate-out (if enabled)
```

## 📊 Position System Integration

### Base Positions

The animation system works with the **Base Position System**:

- **Base Position**: Final resting position calculated dynamically
- **Relative Offsets**: Animation positions are relative to base position
- **Automatic Conversion**: System converts relative to absolute positions

```javascript
// Example: topIcon base position is { x: 960, y: 200 }
// animateIn from: { x: 0, y: -50 } = actual position { x: 960, y: 150 }
// animateIn to: { x: 0, y: 0 } = actual position { x: 960, y: 200 }
```

### Position Properties

- **x, y**: Position offsets from base position
- **opacity**: Transparency (0-1)
- **scale**: Size multiplier (1 = 100%)
- **rotation**: Rotation in degrees

## 🎭 Animation Presets

### Built-in Presets

1. **slideInLeft** (Default)
   - Elements slide in from left with cascade timing
   - Professional, smooth appearance

2. **fadeIn**
   - Simple fade in with subtle scale
   - Clean, minimal look

3. **scaleUp**
   - Elements scale up from center with bounce
   - Energetic, attention-grabbing

4. **spiral**
   - Elements spiral in with dramatic rotation
   - Creative, dynamic effect

### Creating Custom Presets (Updated Structure)

```javascript
// Template for new preset
templateEditor.animationSystem.presets.newPreset = {
    name: "Display Name",
    description: "What it does",
    icon: "🎯",
    overrides: {
        // Option 1: Apply to all elements
        all: {
            animateIn: {
                from: { /* starting state */ },
                to: { /* ending state */ },
                duration: 1.0,
                ease: "power2.out"
            },
            animateOut: {  // Optional animate-out override
                to: { /* exit state */ },
                duration: 1.5,
                ease: "power2.in"
            }
        },
        
        // Option 2: Element-specific overrides
        topIcon: {
            animateIn: {
                from: { rotation: 360 },
                // ... specific to top icon
            }
        }
    }
};
```

## 🔧 Debugging & Troubleshooting

### Console Logging

The system provides detailed console logging:

```javascript
// Enable to see animation system activity
🎬 Creating GSAP timeline using Animation System...
🎭 Applying animation preset: Fade In
✅ Created intro animations for 6 elements
🎭 Animated topIcon with delay 0s
⚠️ Animate-out phase is globally disabled, skipping...
🎭 Current preset: fadeIn
```

### Common Issues

1. **Animation Not Applying**
   ```javascript
   // Check if element exists and is visible
   console.log(templateEditor.isElementVisible('topIcon'));
   console.log(templateEditor.getElementObject('topIcon'));
   
   // Check if phase is enabled
   console.log(templateEditor.getPhaseControls());
   ```

2. **Timeline Not Updating**
   ```javascript
   // Manually refresh timeline
   templateEditor.updateGSAPTimeline();
   ```

3. **Phase Control Issues**
   ```javascript
   // Check phase status
   templateEditor.quickPhaseStatus();
   
   // Reset to defaults
   templateEditor.resetAnimationSystem();
   ```

### Debug Methods

```javascript
// Get animation system state
console.log(templateEditor.getAnimationSystemConfig());

// Get current configuration
console.log(templateEditor.getAnimationConfig('topIcon'));

// Check phase controls
console.log(templateEditor.getPhaseControls());

// Check element visibility and phase status
Object.keys(templateEditor.animationSystem.elements).forEach(element => {
    const visible = templateEditor.isElementVisible(element);
    const config = templateEditor.animationSystem.elements[element];
    console.log(`${element}: visible=${visible}, animateIn=${config.animateIn.enabled}, animateOut=${config.animateOut.enabled}`);
});
```

## 🚀 Performance Considerations

### Best Practices

1. **Use Phase Controls Efficiently**
   - Disable unused phases to improve performance
   - Current setup (animate-in only) is optimal for performance

2. **Minimize Timeline Recreations**
   - Batch multiple changes before calling phase control methods
   - Use quick methods for single changes

3. **Choose Appropriate Durations**
   - Shorter animations (0.5-1.5s) feel snappier
   - Longer animations (2-3s) allow complex effects

## 📈 Extending the System

### Adding New Phase Types

The system can be extended with new phase types:

```javascript
// Example: Add a "prepare" phase before animate-in
this.animationSystem.global.phases.prepare = { start: -1, end: 0 };
this.animationSystem.global.phaseControls.enablePrepare = true;

// Add to elements
elementConfig.prepare = {
    enabled: true,
    to: { /* preparation state */ },
    duration: 0.5
};
```

### Adding New Elements

1. **Add to Base Position System**
   ```javascript
   this.basePositions.newElement = { x: 960, y: 400, width: 100, height: 50 };
   ```

2. **Add to Animation System**
   ```javascript
   this.animationSystem.elements.newElement = {
       name: "New Element",
       animateIn: { enabled: true, /* config */ },
       animateOut: { enabled: false, /* config */ }
   };
   ```

3. **Update Template Objects**
   ```javascript
   this.templateObjects.newElement = /* Konva object */;
   ```

4. **Add to Layer Visibility**
   ```javascript
   this.layerVisibility.newElement = true;
   ```

## 📋 Quick Reference

### Element Names
- `topIcon` - Top icon element
- `topTitle` - Top title text
- `mainTitle` - Main title text (2 lines)
- `subtitle1` - First subtitle
- `subtitle2` - Second subtitle
- `bottomIcons` - Array of bottom icons

### Phase Control Status (Current)
- **Animate-In**: ✅ ENABLED (all elements)
- **Animate-Out**: ❌ DISABLED (all elements)
- **Hold**: ✅ ENABLED
- **Timeline**: 0-2s animate-in, 2-10s hold

### Common Easing Functions
- `power2.out` - Smooth deceleration
- `power2.in` - Smooth acceleration
- `back.out(1.7)` - Bounce effect
- `elastic.out(1, 0.3)` - Elastic bounce
- `bounce.out` - Bouncy landing

### Animation Properties
- `x, y` - Position offsets
- `opacity` - Transparency (0-1)
- `scale` - Size multiplier
- `rotation` - Rotation in degrees
- `duration` - Animation length in seconds
- `ease` - Easing function

### Phase Management
```javascript
// Quick toggles
templateEditor.quickAnimateIn(true/false);
templateEditor.quickAnimateOut(true/false);
templateEditor.quickDisableAnimateOut(); // Current state
templateEditor.quickEnableAnimateOut();

// Status
templateEditor.quickPhaseStatus();
templateEditor.getPhaseControls();

// Reset
templateEditor.resetAnimationSystem();
```

---

## 💡 Tips for Developers

1. **Understand Phase Separation** - Animate-in and animate-out are completely independent
2. **Use Phase Controls** - Enable/disable phases globally or per-element as needed
3. **Current Setup** - Only animate-in is enabled, elements stay visible (no exit)
4. **Test Phases Separately** - Use quick commands to test different combinations
5. **Check Phase Status** - Use `quickPhaseStatus()` to see current configuration
6. **Use Relative Positions** - Always use offsets from base position, not absolute coordinates
7. **Batch Changes** - Multiple phase control calls are efficient
8. **Console is Your Friend** - Use console logging to debug phase and animation issues

## 🎯 Current Implementation Summary

**The Animation System now provides complete separation of animate-in and animate-out phases with the following current configuration:**

- ✅ **Animate-In Phase**: Enabled for all elements (0-2s)
- ❌ **Animate-Out Phase**: Disabled for all elements (user request)
- ✅ **Hold Phase**: Enabled (2-10s, elements stay visible)
- 🎛️ **Full Control**: Can be modified globally or per-element
- 🚀 **Performance**: Optimized for current animate-in only setup
- 🎭 **Flexibility**: Easy to re-enable animate-out when needed

The Animation System provides a powerful, flexible foundation for creating sophisticated animations while maintaining clean, maintainable code with complete phase control! 🎬✨ 