/**
 * Modern Animation System - Full Control Animation Framework
 * Provides granular control over individual elements, GSAP easing, property animations,
 * character-level text animations, and icon animations.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

// GSAP Easing presets for easy access
const EASING = {
    // Basic
    LINEAR: 'none',
    EASE: 'power2.inOut',
    EASE_IN: 'power2.in',
    EASE_OUT: 'power2.out',
    
    // Bouncy
    BOUNCE: 'bounce.out',
    BOUNCE_IN: 'bounce.in',
    BOUNCE_OUT: 'bounce.out',
    BOUNCE_INOUT: 'bounce.inOut',
    
    // Elastic
    ELASTIC: 'elastic.out(1, 0.3)',
    ELASTIC_IN: 'elastic.in(1, 0.3)',
    ELASTIC_OUT: 'elastic.out(1, 0.3)',
    ELASTIC_STRONG: 'elastic.out(2, 0.5)',
    
    // Back (overshoot)
    BACK: 'back.out(1.7)',
    BACK_IN: 'back.in(1.7)',
    BACK_OUT: 'back.out(1.7)',
    BACK_STRONG: 'back.out(3)',
    
    // Expo
    EXPO_IN: 'expo.in',
    EXPO_OUT: 'expo.out',
    EXPO_INOUT: 'expo.inOut',
    
    // Circ
    CIRC_IN: 'circ.in',
    CIRC_OUT: 'circ.out',
    CIRC_INOUT: 'circ.inOut'
};

/**
 * Base Animation Controller
 * Provides core animation functionality for any Konva element
 */
class AnimationController {
    constructor(element, elementId) {
        this.element = element;
        this.elementId = elementId;
        this.activeAnimations = new Map();
        this.defaultDuration = 1;
        this.defaultEase = EASING.EASE_OUT;
        
        // Store initial properties
        this.initialProps = this.captureInitialProperties();
        
        console.log(`🎬 AnimationController created for: ${elementId}`);
    }
    
    /**
     * Capture element's initial properties for reset functionality
     */
    captureInitialProperties() {
        if (!this.element) return {};
        
        return {
            x: this.element.x(),
            y: this.element.y(),
            scaleX: this.element.scaleX(),
            scaleY: this.element.scaleY(),
            rotation: this.element.rotation(),
            opacity: this.element.opacity(),
            visible: this.element.visible()
        };
    }
    
    /**
     * Animate element with full GSAP control
     * @param {Object} properties - Animation properties {x, y, rotation, scaleX, scaleY, opacity, etc.}
     * @param {Object} options - Animation options {duration, ease, delay, onComplete, onStart, etc.}
     * @param {string} animationId - Unique ID for this animation (optional)
     * @returns {gsap.core.Tween} The GSAP tween
     */
    animate(properties, options = {}, animationId = 'default') {
        if (!this.element) {
            console.warn(`Cannot animate ${this.elementId}: element not found`);
            return null;
        }
        
        // Kill existing animation with same ID
        this.killAnimation(animationId);
        
        // Merge options with defaults
        const config = {
            duration: options.duration || this.defaultDuration,
            ease: options.ease || this.defaultEase,
            delay: options.delay || 0,
            ...properties,
            onStart: () => {
                console.log(`▶️ Animation started: ${this.elementId} (${animationId})`);
                if (options.onStart) options.onStart();
            },
            onComplete: () => {
                console.log(`✅ Animation completed: ${this.elementId} (${animationId})`);
                this.activeAnimations.delete(animationId);
                if (options.onComplete) options.onComplete();
            },
            onUpdate: options.onUpdate
        };
        
        // Create and store animation
        const tween = gsap.to(this.element, config);
        this.activeAnimations.set(animationId, tween);
        
        return tween;
    }
    
    /**
     * Set element properties instantly (no animation)
     * @param {Object} properties - Properties to set
     */
    set(properties) {
        if (!this.element) return;
        
        Object.entries(properties).forEach(([prop, value]) => {
            if (typeof this.element[prop] === 'function') {
                this.element[prop](value);
            }
        });
        
        // Redraw stage if available
        if (this.element.getStage) {
            this.element.getStage().batchDraw();
        }
    }
    
    /**
     * Kill specific animation
     * @param {string} animationId - Animation ID to kill
     */
    killAnimation(animationId) {
        const animation = this.activeAnimations.get(animationId);
        if (animation) {
            animation.kill();
            this.activeAnimations.delete(animationId);
            console.log(`🛑 Animation killed: ${this.elementId} (${animationId})`);
        }
    }
    
    /**
     * Kill all animations on this element
     */
    killAll() {
        this.activeAnimations.forEach((animation, id) => {
            animation.kill();
            console.log(`🛑 Animation killed: ${this.elementId} (${id})`);
        });
        this.activeAnimations.clear();
    }
    
    /**
     * Reset element to initial properties
     * @param {boolean} animate - Whether to animate the reset
     * @param {Object} options - Animation options if animate is true
     */
    reset(animate = false, options = {}) {
        if (animate) {
            this.animate(this.initialProps, options, 'reset');
        } else {
            this.set(this.initialProps);
        }
    }
    
    /**
     * Check if element has active animations
     * @param {string} animationId - Specific animation ID to check (optional)
     * @returns {boolean}
     */
    isAnimating(animationId) {
        if (animationId) {
            const animation = this.activeAnimations.get(animationId);
            return animation && animation.isActive();
        }
        
        for (let animation of this.activeAnimations.values()) {
            if (animation.isActive()) return true;
        }
        return false;
    }
    
    /**
     * Pause all animations
     */
    pause() {
        this.activeAnimations.forEach(animation => animation.pause());
    }
    
    /**
     * Resume all animations
     */
    resume() {
        this.activeAnimations.forEach(animation => animation.resume());
    }
    
    /**
     * Get element bounds for animation calculations
     */
    getBounds() {
        if (!this.element) return null;
        
        return {
            x: this.element.x(),
            y: this.element.y(),
            width: this.element.width ? this.element.width() : 0,
            height: this.element.height ? this.element.height() : 0
        };
    }
}

/**
 * Text Animation Controller
 * Specialized for text elements with character-level control
 */
class TextAnimator extends AnimationController {
    constructor(textElement, elementId) {
        super(textElement, elementId);
        this.characters = [];
        this.isCharacterMode = false;
    }
    
    /**
     * Enable character-level animation by splitting text into individual characters
     * @param {Object} options - Character options {spacing, individualChars}
     */
    enableCharacterAnimation(options = {}) {
        if (!this.element || this.isCharacterMode) return;
        
        const text = this.element.text();
        const fontSize = this.element.fontSize();
        const fontFamily = this.element.fontFamily();
        const fill = this.element.fill();
        const x = this.element.x();
        const y = this.element.y();
        
        // Create character elements
        this.characters = [];
        let currentX = x;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') {
                currentX += fontSize * 0.3; // Space width
                continue;
            }
            
            const charElement = new Konva.Text({
                x: currentX,
                y: y,
                text: char,
                fontSize: fontSize,
                fontFamily: fontFamily,
                fill: fill,
                opacity: this.element.opacity()
            });
            
            // Add to same layer as original text
            this.element.getLayer().add(charElement);
            
            this.characters.push({
                element: charElement,
                char: char,
                index: i,
                controller: new AnimationController(charElement, `${this.elementId}_char_${i}`)
            });
            
            // Calculate next position
            currentX += charElement.getTextWidth() + (options.spacing || 0);
        }
        
        // Hide original text
        this.element.visible(false);
        this.isCharacterMode = true;
        
        console.log(`🔤 Character animation enabled for ${this.elementId}: ${this.characters.length} characters`);
    }
    
    /**
     * Disable character animation and restore original text
     */
    disableCharacterAnimation() {
        if (!this.isCharacterMode) return;
        
        // Remove character elements
        this.characters.forEach(char => {
            char.controller.killAll();
            char.element.destroy();
        });
        
        this.characters = [];
        this.element.visible(true);
        this.isCharacterMode = false;
        
        console.log(`🔤 Character animation disabled for ${this.elementId}`);
    }
    
    /**
     * Animate individual characters
     * @param {Object} properties - Animation properties
     * @param {Object} options - Animation options with stagger support
     */
    animateCharacters(properties, options = {}) {
        if (!this.isCharacterMode) {
            console.warn('Character animation not enabled. Call enableCharacterAnimation() first.');
            return;
        }
        
        const stagger = options.stagger || 0.1;
        const reverse = options.reverse || false;
        const chars = reverse ? [...this.characters].reverse() : this.characters;
        
        chars.forEach((char, index) => {
            const delay = (options.delay || 0) + (index * stagger);
            const charOptions = {
                ...options,
                delay: delay
            };
            
            char.controller.animate(properties, charOptions, `char_anim_${Date.now()}`);
        });
    }
    
    /**
     * Type-writer effect
     * @param {Object} options - Typewriter options {speed, cursor}
     */
    typewriter(options = {}) {
        if (!this.isCharacterMode) {
            this.enableCharacterAnimation();
        }
        
        const speed = options.speed || 0.1;
        
        // Start with all characters invisible
        this.characters.forEach(char => {
            char.element.opacity(0);
        });
        
        // Animate them in sequence
        this.characters.forEach((char, index) => {
            char.controller.animate(
                { opacity: 1 },
                { 
                    duration: 0.1,
                    delay: index * speed,
                    ease: EASING.LINEAR
                },
                'typewriter'
            );
        });
    }
    
    /**
     * Wave animation effect
     * @param {Object} options - Wave options {amplitude, frequency, speed}
     */
    wave(options = {}) {
        if (!this.isCharacterMode) {
            this.enableCharacterAnimation();
        }
        
        const amplitude = options.amplitude || 20;
        const frequency = options.frequency || 0.5;
        const speed = options.speed || 2;
        
        this.characters.forEach((char, index) => {
            const delay = index * 0.1;
            const initialY = char.element.y();
            
            char.controller.animate(
                {
                    y: `+=${amplitude}`,
                    yoyo: true,
                    repeat: -1,
                    duration: frequency,
                    ease: EASING.EASE_INOUT
                },
                { delay: delay },
                'wave'
            );
        });
    }
    
    /**
     * Get individual character controller
     * @param {number} index - Character index
     * @returns {AnimationController}
     */
    getCharacter(index) {
        if (!this.isCharacterMode || !this.characters[index]) return null;
        return this.characters[index].controller;
    }
}

/**
 * Icon Animation Controller
 * Specialized for icon elements with icon-specific effects
 */
class IconAnimator extends AnimationController {
    constructor(iconElement, elementId) {
        super(iconElement, elementId);
        this.iconType = this.detectIconType();
    }
    
    /**
     * Detect icon type for specialized animations
     */
    detectIconType() {
        if (!this.element) return 'generic';
        
        // Try to detect icon type from element properties or naming
        const elementName = this.elementId.toLowerCase();
        
        if (elementName.includes('arrow')) return 'arrow';
        if (elementName.includes('star') || elementName.includes('celebration')) return 'star';
        if (elementName.includes('icon')) return 'generic';
        
        return 'generic';
    }
    
    /**
     * Pulse animation - classic for icons
     * @param {Object} options - Pulse options {scale, speed, repeat}
     */
    pulse(options = {}) {
        const scale = options.scale || 1.2;
        const speed = options.speed || 0.5;
        const repeat = options.repeat || -1;
        
        this.animate({
            scaleX: scale,
            scaleY: scale,
            yoyo: true,
            repeat: repeat,
            duration: speed,
            ease: EASING.EASE_INOUT
        }, options, 'pulse');
    }
    
    /**
     * Bounce in animation
     * @param {Object} options - Bounce options
     */
    bounceIn(options = {}) {
        // Start small and invisible
        this.set({ scaleX: 0, scaleY: 0, opacity: 0 });
        
        this.animate({
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            duration: options.duration || 0.8,
            ease: EASING.BACK_OUT
        }, options, 'bounceIn');
    }
    
    /**
     * Rotation animation
     * @param {Object} options - Rotation options {direction, speed, repeat}
     */
    rotate(options = {}) {
        const direction = options.direction || 'clockwise';
        const speed = options.speed || 2;
        const repeat = options.repeat || -1;
        const degrees = direction === 'clockwise' ? 360 : -360;
        
        this.animate({
            rotation: `+=${degrees}`,
            repeat: repeat,
            duration: speed,
            ease: EASING.LINEAR
        }, options, 'rotate');
    }
    
    /**
     * Float animation - gentle up and down movement
     * @param {Object} options - Float options {distance, speed}
     */
    float(options = {}) {
        const distance = options.distance || 10;
        const speed = options.speed || 2;
        
        this.animate({
            y: `-=${distance}`,
            yoyo: true,
            repeat: -1,
            duration: speed,
            ease: EASING.EASE_INOUT
        }, options, 'float');
    }
    
    /**
     * Glow effect using opacity pulsing
     * @param {Object} options - Glow options {minOpacity, speed}
     */
    glow(options = {}) {
        const minOpacity = options.minOpacity || 0.5;
        const speed = options.speed || 1;
        
        this.animate({
            opacity: minOpacity,
            yoyo: true,
            repeat: -1,
            duration: speed,
            ease: EASING.EASE_INOUT
        }, options, 'glow');
    }
    
    /**
     * Shake animation
     * @param {Object} options - Shake options {intensity, speed, direction}
     */
    shake(options = {}) {
        const intensity = options.intensity || 5;
        const speed = options.speed || 0.1;
        const direction = options.direction || 'horizontal'; // 'horizontal', 'vertical', 'both'
        
        const shakeProps = {};
        if (direction === 'horizontal' || direction === 'both') {
            shakeProps.x = `+=${intensity}`;
        }
        if (direction === 'vertical' || direction === 'both') {
            shakeProps.y = `+=${intensity}`;
        }
        
        this.animate({
            ...shakeProps,
            yoyo: true,
            repeat: 5,
            duration: speed,
            ease: EASING.LINEAR
        }, options, 'shake');
    }
    
    /**
     * Icon-specific animation based on detected type
     * @param {Object} options - Animation options
     */
    playSignature(options = {}) {
        switch (this.iconType) {
            case 'arrow':
                // Arrows slide and point
                this.animate({
                    x: '+=20',
                    yoyo: true,
                    repeat: 3,
                    duration: 0.5,
                    ease: EASING.BACK_OUT
                }, options, 'signature');
                break;
                
            case 'star':
                // Stars twinkle and scale
                this.animate({
                    scaleX: 1.5,
                    scaleY: 1.5,
                    rotation: 180,
                    yoyo: true,
                    repeat: 2,
                    duration: 0.6,
                    ease: EASING.BACK_OUT
                }, options, 'signature');
                break;
                
            default:
                // Generic bounce
                this.bounceIn(options);
                break;
        }
    }
}

/**
 * Animation System Manager
 * Central control for all animations in the application
 */
class AnimationSystem {
    constructor() {
        this.controllers = new Map();
        this.textAnimators = new Map();
        this.iconAnimators = new Map();
        this.globalTimeline = null;
        
        // Configuration structure expected by template-engine
        this.global = {
            duration: 10, // 10 second timeline
            phases: {
                intro: { start: 0, end: 2 },
                hold: { start: 2, end: 8 },
                exit: { start: 8, end: 10 }
            },
            timing: {
                elementDelay: 0,      // Set to 0 to avoid conflicts with dynamic delays
                exitStagger: 0.05
            },
            defaultEasing: {
                intro: 'power2.out',
                exit: 'power2.in'
            },
            phaseControls: {
                enableAnimateIn: true,
                enableAnimateOut: true,
                enableHold: true
            }
        };
        
        // Element-specific animation configurations
        this.elements = {
            // Will be populated as elements are registered
        };
        
        // Animation presets system
        this.presets = {
            current: 'default',
            default: {
                name: 'Default',
                description: 'Standard animation preset'
            }
        };
        
        console.log('🎭 Animation System initialized with configuration structure');
    }
    
    /**
     * Register an element for animation
     * @param {string} elementId - Unique element identifier
     * @param {Konva.Node} element - Konva element
     * @param {string} type - Element type ('text', 'icon', 'generic')
     * @returns {AnimationController|TextAnimator|IconAnimator}
     */
    register(elementId, element, type = 'generic') {
        // Remove existing controller if present
        this.unregister(elementId);
        
        let controller;
        
        switch (type) {
            case 'text':
                controller = new TextAnimator(element, elementId);
                this.textAnimators.set(elementId, controller);
                break;
                
            case 'icon':
                controller = new IconAnimator(element, elementId);
                this.iconAnimators.set(elementId, controller);
                break;
                
            default:
                controller = new AnimationController(element, elementId);
                break;
        }
        
        this.controllers.set(elementId, controller);
        
        // Create element configuration structure expected by template-engine
        this.elements[elementId] = {
            animateIn: {
                enabled: true,
                order: Object.keys(this.elements).length, // Sequential order
                delay: 0,
                duration: 1,
                ease: this.global.defaultEasing.intro,
                properties: {}
            },
            animateOut: {
                enabled: true,
                delay: 0,
                duration: 1,
                ease: this.global.defaultEasing.exit,
                properties: {}
            }
        };
        
        console.log(`✅ Registered ${type} animator: ${elementId} with configuration`);
        
        return controller;
    }
    
    /**
     * Unregister an element
     * @param {string} elementId - Element identifier
     */
    unregister(elementId) {
        const controller = this.controllers.get(elementId);
        if (controller) {
            controller.killAll();
            this.controllers.delete(elementId);
            this.textAnimators.delete(elementId);
            this.iconAnimators.delete(elementId);
            
            // Clean up element configuration
            delete this.elements[elementId];
            
            console.log(`🗑️ Unregistered animator: ${elementId}`);
        }
    }
    
    /**
     * Get animation controller for element
     * @param {string} elementId - Element identifier
     * @returns {AnimationController|TextAnimator|IconAnimator}
     */
    get(elementId) {
        return this.controllers.get(elementId);
    }
    
    /**
     * Get text animator specifically
     * @param {string} elementId - Element identifier
     * @returns {TextAnimator}
     */
    getText(elementId) {
        return this.textAnimators.get(elementId);
    }
    
    /**
     * Get icon animator specifically
     * @param {string} elementId - Element identifier
     * @returns {IconAnimator}
     */
    getIcon(elementId) {
        return this.iconAnimators.get(elementId);
    }
    
    /**
     * Animate multiple elements with coordinated timing
     * @param {Array} animations - Array of {elementId, properties, options}
     * @param {Object} globalOptions - Global options {stagger, onComplete}
     */
    animateGroup(animations, globalOptions = {}) {
        const stagger = globalOptions.stagger || 0;
        
        animations.forEach((anim, index) => {
            const controller = this.get(anim.elementId);
            if (controller) {
                const options = {
                    ...anim.options,
                    delay: (anim.options?.delay || 0) + (index * stagger)
                };
                
                // Add global completion callback to last animation
                if (index === animations.length - 1 && globalOptions.onComplete) {
                    const originalComplete = options.onComplete;
                    options.onComplete = () => {
                        if (originalComplete) originalComplete();
                        globalOptions.onComplete();
                    };
                }
                
                controller.animate(anim.properties, options, anim.animationId || 'group');
            }
        });
    }
    
    /**
     * Kill all animations in the system
     */
    killAll() {
        this.controllers.forEach(controller => controller.killAll());
        console.log('🛑 All animations killed');
    }
    
    /**
     * Pause all animations
     */
    pauseAll() {
        this.controllers.forEach(controller => controller.pause());
        console.log('⏸️ All animations paused');
    }
    
    /**
     * Resume all animations
     */
    resumeAll() {
        this.controllers.forEach(controller => controller.resume());
        console.log('▶️ All animations resumed');
    }
    
    /**
     * Reset all elements to initial state
     * @param {boolean} animate - Whether to animate the reset
     * @param {Object} options - Animation options if animate is true
     */
    resetAll(animate = false, options = {}) {
        this.controllers.forEach(controller => controller.reset(animate, options));
        console.log(`🔄 All elements reset ${animate ? 'with animation' : 'instantly'}`);
    }
    
    /**
     * Get system stats
     * @returns {Object} System statistics
     */
    getStats() {
        let activeAnimations = 0;
        this.controllers.forEach(controller => {
            if (controller.isAnimating()) activeAnimations++;
        });
        
        return {
            totalElements: this.controllers.size,
            textElements: this.textAnimators.size,
            iconElements: this.iconAnimators.size,
            activeAnimations: activeAnimations
        };
    }
    
    /**
     * Create a global timeline for coordinated animations
     * @param {Object} options - Timeline options
     * @returns {gsap.core.Timeline}
     */
    createTimeline(options = {}) {
        if (this.globalTimeline) {
            this.globalTimeline.kill();
        }
        
        this.globalTimeline = gsap.timeline(options);
        console.log('📅 Global timeline created');
        
        return this.globalTimeline;
    }
    
    /**
     * Destroy the animation system
     */
    destroy() {
        this.killAll();
        if (this.globalTimeline) {
            this.globalTimeline.kill();
        }
        this.controllers.clear();
        this.textAnimators.clear();
        this.iconAnimators.clear();
        console.log('💥 Animation System destroyed');
    }
}

// Export the classes and easing constants
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        AnimationController,
        TextAnimator,
        IconAnimator,
        AnimationSystem,
        EASING
    };
} else {
    // Browser environment
    window.AnimationController = AnimationController;
    window.TextAnimator = TextAnimator;
    window.IconAnimator = IconAnimator;
    window.AnimationSystem = AnimationSystem;
    window.EASING = EASING;
}