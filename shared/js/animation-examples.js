/**
 * Animation Examples - How to modify animations easily
 * This file shows practical examples of changing animations
 */

// ============================================
// EXAMPLE 1: Change Main Title Animation
// ============================================

// Make main title bounce in instead of sliding
SimpleAnimations.elements.mainTitle.animateIn = {
    startFrame: 20,
    duration: 2,
    ease: "bounce.out",
    from: {
        opacity: 0,
        scaleX: 0,
        scaleY: 0
    },
    to: {
        opacity: 1,
        scaleX: 1,
        scaleY: 1
    }
};

// ============================================
// EXAMPLE 2: Change Subtitle Timing
// ============================================

// Make subtitle1 appear faster
SimpleAnimations.elements.subtitle1.animateIn.duration = 1; // Was 2.5

// Change subtitle2 easing
SimpleAnimations.elements.subtitle2.animateIn.ease = "power4.out"; // Was expo.out

// ============================================
// EXAMPLE 3: Modify Icon Animations
// ============================================

// Make top icon spin in
SimpleAnimations.elements.topIcon.animateIn = {
    startFrame: 0,
    duration: 1.5,
    ease: "power2.out",
    from: {
        opacity: 0,
        rotation: -360,
        scaleX: 0,
        scaleY: 0
    },
    to: {
        opacity: 1,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
    }
};

// Change bottom icons to fade in only (no movement)
SimpleAnimations.elements.bottomIcons.animateIn = {
    startFrame: 50,
    duration: 1,
    ease: "power2.out",
    from: {
        opacity: 0
    },
    to: {
        opacity: 1
    },
    stagger: 0.1
};

// ============================================
// EXAMPLE 4: Disable Exit Animations
// ============================================

// Remove exit animation for main title
delete SimpleAnimations.elements.mainTitle.animateOut;

// Or disable all exit animations
Object.keys(SimpleAnimations.elements).forEach(key => {
    delete SimpleAnimations.elements[key].animateOut;
});

// ============================================
// EXAMPLE 5: Change Frame Offset
// ============================================

// Make elements appear faster (5 frames apart instead of 10)
SimpleAnimations.frameOffset = 5; // ~0.17 seconds at 30fps

// Or make them appear slower (20 frames apart)
SimpleAnimations.frameOffset = 20; // ~0.67 seconds at 30fps

// ============================================
// EXAMPLE 6: Complex Custom Animation
// ============================================

// Make main title typewriter effect (character by character)
// Note: This would require additional character splitting logic
SimpleAnimations.elements.mainTitle.animateIn = {
    startFrame: 20,
    duration: 3,
    ease: "none",
    from: {
        opacity: 0
    },
    to: {
        opacity: 1
    },
    // Custom property for future implementation
    characterAnimation: {
        type: "typewriter",
        delay: 0.05 // 50ms between characters
    }
};

// ============================================
// EXAMPLE 7: Synchronize Multiple Elements
// ============================================

// Make all text elements appear at the same time
const syncFrame = 30;
SimpleAnimations.elements.topTitle.animateIn.startFrame = syncFrame;
SimpleAnimations.elements.mainTitle.animateIn.startFrame = syncFrame;
SimpleAnimations.elements.subtitle1.animateIn.startFrame = syncFrame;
SimpleAnimations.elements.subtitle2.animateIn.startFrame = syncFrame;

// ============================================
// EXAMPLE 8: Create a Preset
// ============================================

// Save current configuration as a preset
const myPreset = {
    frameOffset: SimpleAnimations.frameOffset,
    elements: JSON.parse(JSON.stringify(SimpleAnimations.elements))
};

// Apply preset later
function applyPreset(preset) {
    SimpleAnimations.frameOffset = preset.frameOffset;
    SimpleAnimations.elements = JSON.parse(JSON.stringify(preset.elements));
}

// ============================================
// EXAMPLE 9: Conditional Animations
// ============================================

// Different animation based on template type
if (templateType === 'corporate') {
    // Subtle, professional animations
    SimpleAnimations.elements.mainTitle.animateIn = {
        startFrame: 20,
        duration: 1.5,
        ease: "power2.out",
        from: { opacity: 0, y: 20 },
        to: { opacity: 1, y: 0 }
    };
} else if (templateType === 'playful') {
    // Fun, bouncy animations
    SimpleAnimations.elements.mainTitle.animateIn = {
        startFrame: 20,
        duration: 2,
        ease: "elastic.out(1, 0.3)",
        from: { opacity: 0, scaleX: 0, scaleY: 0 },
        to: { opacity: 1, scaleX: 1, scaleY: 1 }
    };
}

// ============================================
// EXAMPLE 10: Debug Helper
// ============================================

// Log all animation timings
function debugAnimationTimings() {
    console.log('=== Animation Timeline ===');
    Object.entries(SimpleAnimations.elements).forEach(([name, config]) => {
        if (config.animateIn) {
            const startTime = (config.animateIn.startFrame * (1/30)).toFixed(2);
            const endTime = (parseFloat(startTime) + config.animateIn.duration).toFixed(2);
            console.log(`${name}: ${startTime}s - ${endTime}s (${config.animateIn.ease})`);
        }
    });
}

// Usage: debugAnimationTimings();