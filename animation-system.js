/**
 * Animation System for Template Editor
 * Pure individual element control system for maximum animation flexibility
 * 
 * USAGE EXAMPLES:
 * 
 * // 1. Direct Individual Control
 * const titleAnimator = animationManager.getElementAnimator('mainTitle');
 * titleAnimator.animate({
 *     x: 100, y: 50, rotation: 15, scaleX: 1.2, opacity: 1
 * }, { duration: 2, ease: 'elastic.out(1, 0.3)', delay: 0.5 });
 * 
 * // 2. Batch Individual Animations
 * animationManager.animateElements({
 *     mainTitle: {
 *         properties: { opacity: 1, y: '-=30' },
 *         timing: { duration: 1.2, ease: 'power2.out' }
 *     },
 *     subtitle1: {
 *         properties: { opacity: 1, x: '+=20', rotation: -2 },
 *         timing: { duration: 1, delay: 0.5, ease: 'back.out(1.7)' }
 *     }
 * });
 * 
 * // 3. Custom Animation Chains
 * animationManager.chainAnimations([
 *     {
 *         elementId: 'topTitle',
 *         properties: { opacity: 1, y: '-=20' },
 *         timing: { duration: 0.8 }
 *     },
 *     {
 *         elementId: 'mainTitle',
 *         properties: { opacity: 1, scaleX: 1.1 },
 *         timing: { duration: 1.5 },
 *         onComplete: () => console.log('Chain step completed!')
 *     }
 * ]);
 */

// Animation Configuration Constants
const ANIMATION_CONFIG = {
    // Default animation settings
    DEFAULTS: {
        DURATION: 1,
        EASE: 'power2.out',
        DELAY: 0
    },
    
    // Common easing curves
    EASING: {
        SMOOTH_IN: 'power2.in',
        SMOOTH_OUT: 'power2.out', 
        SMOOTH_INOUT: 'power2.inOut',
        BOUNCE: 'bounce.out',
        ELASTIC: 'elastic.out(1, 0.3)',
        ELASTIC_STRONG: 'elastic.out(2, 0.5)',
        OVERSHOOT: 'back.out(1.7)',
        OVERSHOOT_STRONG: 'back.out(2.5)',
        SNAP: 'steps(12)'
    },
    
    // Animation property constraints
    CONSTRAINTS: {
        OPACITY: { min: 0, max: 1 },
        SCALE: { min: 0.1, max: 3 },
        ROTATION: { min: -360, max: 360 }
    }
};

/**
 * Individual Element Animation Controller
 * Manages animations for a single template element with full property control
 */
class ElementAnimator {
    /**
     * Create an animator for a specific element
     * @param {Konva.Node} element - The Konva element to animate
     * @param {string} elementId - Unique identifier for the element
     * @param {Object} config - Animation configuration for this element
     */
    constructor(element, elementId, config = {}) {
        this.element = element;
        this.elementId = elementId;
        this.config = { ...ANIMATION_CONFIG.DEFAULTS, ...config };
        this.timeline = null;
        this.isAnimating = false;
        
        // Store initial properties for reset capability
        this.initialProperties = this.captureInitialProperties();
        
        // Validate element
        if (!this.element) {
            console.warn(`ElementAnimator: Invalid element provided for ${elementId}`);
            return;
        }
        
        console.debug(`ElementAnimator created for: ${elementId}`);
    }
    
    /**
     * Capture initial element properties for later reset
     * @returns {Object} Initial property values
     */
    captureInitialProperties() {
        if (!this.element) return {};
        
        try {
            return {
                x: this.element.x(),
                y: this.element.y(),
                scaleX: this.element.scaleX(),
                scaleY: this.element.scaleY(),
                rotation: this.element.rotation(),
                opacity: this.element.opacity(),
                visible: this.element.visible()
            };
        } catch (error) {
            console.error(`Failed to capture initial properties for ${this.elementId}:`, error);
            return {};
        }
    }
    
    /**
     * Animate element with specified properties and timing
     * @param {Object} properties - GSAP animation properties
     * @param {Object} timing - Timing configuration {duration, delay, ease}
     * @returns {gsap.core.Timeline} The animation timeline
     */
    animate(properties, timing = {}) {
        if (!this.element) {
            console.warn(`Cannot animate ${this.elementId}: element not found`);
            return null;
        }
        
        // Merge timing with defaults and config
        const animationConfig = {
            duration: timing.duration || this.config.duration || ANIMATION_CONFIG.DEFAULTS.DURATION,
            delay: timing.delay || this.config.delay || ANIMATION_CONFIG.DEFAULTS.DELAY,
            ease: timing.ease || this.config.ease || ANIMATION_CONFIG.DEFAULTS.EASE,
            ...properties,
            onComplete: () => {
                this.isAnimating = false;
                console.debug(`Animation completed for: ${this.elementId}`);
                if (timing.onComplete) timing.onComplete();
            },
            onStart: () => {
                this.isAnimating = true;
                console.debug(`Animation started for: ${this.elementId}`);
                if (timing.onStart) timing.onStart();
            }
        };
        
        // Validate and constrain properties
        this.validateAnimationProperties(animationConfig);
        
        // Kill any existing timeline
        if (this.timeline) {
            this.timeline.kill();
        }
        
        try {
            // Create new timeline for this animation
            this.timeline = gsap.to(this.element, animationConfig);
            return this.timeline;
        } catch (error) {
            console.error(`Animation failed for ${this.elementId}:`, error);
            this.isAnimating = false;
            return null;
        }
    }
    
    /**
     * Validate and constrain animation properties
     * @param {Object} properties - Properties to validate
     */
    validateAnimationProperties(properties) {
        // Constrain opacity
        if (properties.opacity !== undefined) {
            const { min, max } = ANIMATION_CONFIG.CONSTRAINTS.OPACITY;
            properties.opacity = Math.max(min, Math.min(max, properties.opacity));
        }
        
        // Constrain scale
        if (properties.scaleX !== undefined) {
            const { min, max } = ANIMATION_CONFIG.CONSTRAINTS.SCALE;
            properties.scaleX = Math.max(min, Math.min(max, properties.scaleX));
        }
        if (properties.scaleY !== undefined) {
            const { min, max } = ANIMATION_CONFIG.CONSTRAINTS.SCALE;
            properties.scaleY = Math.max(min, Math.min(max, properties.scaleY));
        }
        
        // Constrain rotation
        if (properties.rotation !== undefined) {
            const { min, max } = ANIMATION_CONFIG.CONSTRAINTS.ROTATION;
            properties.rotation = Math.max(min, Math.min(max, properties.rotation));
        }
    }
    
    /**
     * Set element to initial animation state (typically hidden/positioned for intro)
     * @param {Object} state - Initial state properties
     */
    setInitialState(state = {}) {
        if (!this.element) return;
        
        const defaultState = {
            opacity: 0,
            x: this.initialProperties.x,
            y: this.initialProperties.y,
            scaleX: this.initialProperties.scaleX,
            scaleY: this.initialProperties.scaleY,
            rotation: this.initialProperties.rotation,
            ...state
        };
        
        try {
            // Apply state immediately
            Object.entries(defaultState).forEach(([prop, value]) => {
                if (typeof this.element[prop] === 'function') {
                    this.element[prop](value);
                }
            });
            
            console.debug(`Initial state set for: ${this.elementId}`, defaultState);
        } catch (error) {
            console.error(`Failed to set initial state for ${this.elementId}:`, error);
        }
    }
    
    /**
     * Reset element to its original captured properties
     */
    reset() {
        if (!this.element) return;
        
        try {
            Object.entries(this.initialProperties).forEach(([prop, value]) => {
                if (typeof this.element[prop] === 'function') {
                    this.element[prop](value);
                }
            });
            
            if (this.timeline) {
                this.timeline.kill();
                this.timeline = null;
            }
            
            this.isAnimating = false;
            console.debug(`Element reset: ${this.elementId}`);
        } catch (error) {
            console.error(`Failed to reset ${this.elementId}:`, error);
        }
    }
    
    /**
     * Check if element is currently animating
     * @returns {boolean}
     */
    isActive() {
        return this.isAnimating || (this.timeline && this.timeline.isActive());
    }
    
    /**
     * Pause current animation
     */
    pause() {
        if (this.timeline && this.timeline.isActive()) {
            this.timeline.pause();
            console.debug(`Animation paused for: ${this.elementId}`);
        }
    }
    
    /**
     * Resume paused animation
     */
    resume() {
        if (this.timeline && this.timeline.paused()) {
            this.timeline.resume();
            console.debug(`Animation resumed for: ${this.elementId}`);
        }
    }
    
    /**
     * Stop current animation
     */
    stop() {
        if (this.timeline) {
            this.timeline.kill();
            this.timeline = null;
            this.isAnimating = false;
            console.debug(`Animation stopped for: ${this.elementId}`);
        }
    }
}

/**
 * Animation System Manager
 * Orchestrates animations across all template elements
 */
class AnimationManager {
    /**
     * Create animation manager for a template editor
     * @param {TemplateEditor} editor - Reference to the main editor
     */
    constructor(editor) {
        this.editor = editor;
        this.elementAnimators = new Map();
        this.isPlaying = false;
        
        console.info('AnimationManager initialized for individual element control');
    }
    
    /**
     * Register an element for animation control
     * @param {string} elementId - Unique identifier
     * @param {Konva.Node} element - The Konva element
     * @param {Object} config - Element-specific animation configuration
     * @returns {ElementAnimator|null} The created animator
     */
    registerElement(elementId, element, config = {}) {
        if (!element) {
            console.warn(`Cannot register ${elementId}: element is null`);
            return null;
        }
        
        // Unregister existing animator if present
        if (this.elementAnimators.has(elementId)) {
            this.unregisterElement(elementId);
        }
        
        const animator = new ElementAnimator(element, elementId, config);
        this.elementAnimators.set(elementId, animator);
        
        console.debug(`Registered element for animation: ${elementId}`);
        return animator;
    }
    
    /**
     * Unregister an element from animation control
     * @param {string} elementId - Element identifier to remove
     */
    unregisterElement(elementId) {
        const animator = this.elementAnimators.get(elementId);
        if (animator) {
            animator.reset();
            this.elementAnimators.delete(elementId);
            console.debug(`Unregistered element: ${elementId}`);
        }
    }
    
    /**
     * Get animator for a specific element
     * @param {string} elementId - Element identifier
     * @returns {ElementAnimator|null}
     */
    getElementAnimator(elementId) {
        return this.elementAnimators.get(elementId) || null;
    }
    
    /**
     * Get all registered element IDs
     * @returns {string[]} Array of element IDs
     */
    getRegisteredElements() {
        return Array.from(this.elementAnimators.keys());
    }
    
    /**
     * Set all elements to their initial animation state
     * @param {Object} globalState - Global state to apply to all elements
     */
    setInitialStates(globalState = {}) {
        this.elementAnimators.forEach((animator, elementId) => {
            animator.setInitialState(globalState);
        });
        
        // Trigger canvas redraw
        this.redrawCanvas();
        
        console.info('All elements set to initial animation states');
    }
    
    /**
     * Reset all elements to their original properties
     */
    resetAllElements() {
        this.elementAnimators.forEach((animator) => {
            animator.reset();
        });
        
        this.isPlaying = false;
        
        // Trigger canvas redraw
        this.redrawCanvas();
        
        console.info('All elements reset to original state');
    }
    
    /**
     * Pause all active animations
     */
    pauseAll() {
        this.elementAnimators.forEach((animator) => {
            animator.pause();
        });
        
        this.isPlaying = false;
        console.info('All animations paused');
    }
    
    /**
     * Resume all paused animations
     */
    resumeAll() {
        this.elementAnimators.forEach((animator) => {
            animator.resume();
        });
        
        this.isPlaying = true;
        console.info('All animations resumed');
    }
    
    /**
     * Stop all animations
     */
    stopAll() {
        this.elementAnimators.forEach((animator) => {
            animator.stop();
        });
        
        this.isPlaying = false;
        console.info('All animations stopped');
    }
    
    /**
     * Trigger canvas redraw
     */
    redrawCanvas() {
        if (this.editor && this.editor.stage) {
            this.editor.stage.batchDraw();
        }
    }
    
    /**
     * Animate multiple elements with individual timing control
     * @param {Object} animations - { elementId: { properties, timing } }
     */
    animateElements(animations) {
        Object.entries(animations).forEach(([elementId, config]) => {
            const animator = this.getElementAnimator(elementId);
            if (animator) {
                animator.animate(config.properties || {}, config.timing || {});
            } else {
                console.warn(`Element animator not found: ${elementId}`);
            }
        });
        
        console.info('Batch element animations started');
    }
    
    /**
     * Chain individual animations with callbacks for sequential control
     * @param {Array} sequence - [{ elementId, properties, timing, onComplete }]
     */
    chainAnimations(sequence) {
        if (!Array.isArray(sequence) || sequence.length === 0) {
            console.warn('Invalid animation sequence provided');
            return;
        }
        
        const executeNext = (index) => {
            if (index >= sequence.length) {
                console.info('Animation chain completed');
                return;
            }
            
            const { elementId, properties, timing, onComplete } = sequence[index];
            const animator = this.getElementAnimator(elementId);
            
            if (animator) {
                animator.animate(properties, {
                    ...timing,
                    onComplete: () => {
                        if (onComplete) onComplete();
                        executeNext(index + 1);
                    }
                });
            } else {
                console.warn(`Element animator not found in chain: ${elementId}`);
                executeNext(index + 1); // Skip missing elements
            }
        };
        
        executeNext(0);
        console.info(`Animation chain started with ${sequence.length} steps`);
    }
    
    
    /**
     * Clean up all resources
     */
    destroy() {
        this.stopAll();
        this.elementAnimators.clear();
        this.editor = null;
        console.info('AnimationManager destroyed');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = { ElementAnimator, AnimationManager, ANIMATION_CONFIG };
} else {
    // Browser environment - attach to window
    window.ElementAnimator = ElementAnimator;
    window.AnimationManager = AnimationManager;
    window.ANIMATION_CONFIG = ANIMATION_CONFIG;
}