# 🎬 Animation System Documentation

## Overview

The **Animation System** is a centralized, configuration-driven animation framework for the Wix Video Asset Creator. It provides a clean, organized way to manage all element animations with easy customization and preset switching capabilities.

## 🏗️ Architecture

### Location in Code
- **Main Configuration**: `TemplateEditor.animationSystem` object
- **Methods**: Search for `// ANIMATION SYSTEM METHODS` section in `template-engine.js`
- **Integration**: Used in `createGSAPTimeline()` method

### Core Components

```javascript
this.animationSystem = {
    global: {        // Global settings
        duration,    // Total animation duration
        phases,      // Animation phases (intro, hold, exit)
        timing,      // Timing constants
        defaultEasing // Default easing functions
    },
    elements: {      // Per-element animation definitions
        topIcon,     // Top icon animations
        topTitle,    // Top title animations
        mainTitle,   // Main title animations
        subtitle1,   // Subtitle 1 animations
        subtitle2,   // Subtitle 2 animations
        bottomIcons  // Bottom icons animations
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

### Global Settings

```javascript
global: {
    duration: 10,  // Total animation duration in seconds
    phases: {
        intro: { start: 0, end: 2 },   // Elements animate in (0-2s)
        hold: { start: 2, end: 8 },    // Elements stay visible (2-8s)
        exit: { start: 8, end: 10 }    // Elements animate out (8-10s)
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

### Element Configuration

Each element has this structure:

```javascript
elementName: {
    name: "Display Name",    // Human-readable name
    intro: {
        from: {              // Starting position/state
            x: 0,            // X offset from base position
            y: -50,          // Y offset from base position
            opacity: 0,      // Starting opacity
            scale: 0.3,      // Starting scale
            rotation: -45    // Starting rotation (degrees)
        },
        to: {                // End position/state
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
    exit: {
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

### Animation Presets

```javascript
presets: {
    current: 'slideInLeft',  // Active preset name
    
    presetName: {
        name: "Preset Display Name",
        description: "What this preset does",
        icon: "🎭",              // Visual icon
        overrides: {
            all: {               // Apply to all elements
                intro: {
                    // Override properties for all elements
                }
            },
            elementName: {       // Element-specific overrides
                intro: {
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

// Set animation for specific element
templateEditor.setElementAnimation('topIcon', {
    intro: {
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

### Advanced Usage

```javascript
// Modify global timing
templateEditor.animationSystem.global.timing.elementDelay = 0.1;

// Add custom preset
templateEditor.animationSystem.presets.myCustom = {
    name: "My Custom Animation",
    description: "Custom animation style",
    icon: "✨",
    overrides: {
        all: {
            intro: {
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

### 1. Change Single Element Animation

```javascript
// Make top icon spin dramatically
templateEditor.setElementAnimation('topIcon', {
    intro: {
        from: { rotation: -720, scale: 0.1 },
        to: { rotation: 0, scale: 1 },
        duration: 2.0,
        ease: "power2.out"
    }
});
```

### 2. Speed Up All Animations

```javascript
// Reduce delays for faster animations
templateEditor.animationSystem.global.timing.elementDelay = 0.05;
templateEditor.animationSystem.global.timing.exitStagger = 0.03;

// Update timeline
templateEditor.updateGSAPTimeline();
```

### 3. Disable Element Animation

```javascript
// Make subtitle1 appear instantly
templateEditor.setElementAnimation('subtitle1', {
    intro: {
        from: { opacity: 1 },
        to: { opacity: 1 },
        duration: 0
    }
});
```

### 4. Create Custom Animation Preset

```javascript
// Add a "zoom in" preset
templateEditor.animationSystem.presets.zoomIn = {
    name: "Zoom In",
    description: "Elements zoom in from center",
    icon: "🔍",
    overrides: {
        all: {
            intro: {
                from: { opacity: 0, scale: 3.0 },
                to: { opacity: 1, scale: 1 },
                duration: 0.8,
                ease: "power2.out"
            }
        }
    }
};

templateEditor.setAnimationPreset('zoomIn');
```

## 📊 Position System Integration

### Base Positions

The animation system works with the **Base Position System**:

- **Base Position**: Final resting position calculated dynamically
- **Relative Offsets**: Animation positions are relative to base position
- **Automatic Conversion**: System converts relative to absolute positions

```javascript
// Example: topIcon base position is { x: 960, y: 200 }
// Animation from: { x: 0, y: -50 } = actual position { x: 960, y: 150 }
// Animation to: { x: 0, y: 0 } = actual position { x: 960, y: 200 }
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

### Creating Custom Presets

```javascript
// Template for new preset
templateEditor.animationSystem.presets.newPreset = {
    name: "Display Name",
    description: "What it does",
    icon: "🎯",
    overrides: {
        // Option 1: Apply to all elements
        all: {
            intro: {
                from: { /* starting state */ },
                to: { /* ending state */ },
                duration: 1.0,
                ease: "power2.out"
            }
        },
        
        // Option 2: Element-specific overrides
        topIcon: {
            intro: {
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
🎭 Current preset: fadeIn
```

### Common Issues

1. **Animation Not Applying**
   ```javascript
   // Check if element exists and is visible
   console.log(templateEditor.isElementVisible('topIcon'));
   console.log(templateEditor.getElementObject('topIcon'));
   ```

2. **Timeline Not Updating**
   ```javascript
   // Manually refresh timeline
   templateEditor.updateGSAPTimeline();
   ```

3. **Position Issues**
   ```javascript
   // Check base positions
   console.log(templateEditor.positionStates.base);
   console.log(templateEditor.getBasePosition('topIcon'));
   ```

### Debug Methods

```javascript
// Get animation system state
console.log(templateEditor.animationSystem);

// Get current configuration
console.log(templateEditor.getAnimationConfig('topIcon'));

// Check available presets
console.log(templateEditor.getAnimationPresets());

// Check element visibility
Object.keys(templateEditor.animationSystem.elements).forEach(element => {
    console.log(`${element}: ${templateEditor.isElementVisible(element)}`);
});
```

## 🚀 Performance Considerations

### Best Practices

1. **Minimize Timeline Recreations**
   - Batch multiple changes before calling `setAnimationPreset()`
   - Use `setElementAnimation()` for single changes

2. **Use Appropriate Durations**
   - Shorter animations (0.5-1.5s) feel snappier
   - Longer animations (2-3s) allow complex effects

3. **Choose Efficient Easing**
   - `power2.out` - Good general purpose
   - `back.out()` - Nice bounce effect
   - `elastic.out()` - More dramatic bounce

### Memory Management

- Animation system reuses GSAP timeline
- Old animations are automatically cleaned up
- No manual cleanup required

## 📈 Extending the System

### Adding New Elements

1. **Add to Base Position System**
   ```javascript
   this.basePositions.newElement = { x: 960, y: 400, width: 100, height: 50 };
   ```

2. **Add to Animation System**
   ```javascript
   this.animationSystem.elements.newElement = {
       name: "New Element",
       intro: { /* animation config */ },
       exit: { /* animation config */ }
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

### Adding New Animation Properties

The system can be extended to support new animation properties:

```javascript
// Add rotation speed, blur, etc.
intro: {
    from: { 
        opacity: 0, 
        blur: 10,      // Custom property
        skewX: 45      // Custom property
    },
    to: { 
        opacity: 1, 
        blur: 0, 
        skewX: 0 
    }
}
```

## 📋 Quick Reference

### Element Names
- `topIcon` - Top icon element
- `topTitle` - Top title text
- `mainTitle` - Main title text (2 lines)
- `subtitle1` - First subtitle
- `subtitle2` - Second subtitle
- `bottomIcons` - Array of bottom icons

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

### Preset Management
```javascript
// Switch presets
templateEditor.setAnimationPreset('fadeIn');
templateEditor.setAnimationPreset('scaleUp');
templateEditor.setAnimationPreset('spiral');

// Get current
templateEditor.getCurrentAnimationPreset();

// List all
templateEditor.getAnimationPresets();
```

---

## 💡 Tips for Developers

1. **Start with Built-in Presets** - Understand how they work before creating custom ones
2. **Use Relative Positions** - Always use offsets from base position, not absolute coordinates
3. **Test Visibility States** - Animations only apply to visible elements
4. **Batch Changes** - Multiple `setElementAnimation()` calls are efficient
5. **Console is Your Friend** - Use console logging to debug animation issues

The Animation System provides a powerful, flexible foundation for creating sophisticated animations while maintaining clean, maintainable code! 🎬✨ 