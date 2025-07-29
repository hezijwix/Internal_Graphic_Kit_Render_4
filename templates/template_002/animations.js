/**
 * Chapter Template Animation Configuration
 * Custom animations for the Chapter template (template_002)
 * Different from Title Card animations - more subtle and professional
 * 
 * CHAPTER-SPECIFIC FEATURES:
 * - Faster, more subtle entrances
 * - Different easing curves
 * - Unique timing sequences
 * 
 * @template template_002
 * @author Claude Code
 * @version 1.0.0 - Chapter Template
 */

const ChapterAnimations = {
    
    // ===================================
    // DYNAMIC DELAY ANIMATION SYSTEM
    // ===================================
    
    // Simple timing configuration for dynamic delay calculation
    global: {
        frameOffset: 10,      // Frames between visible elements
        baseDelay: 0.3,       // Starting delay in seconds
        fps: 30,             // Frames per second
        totalDuration: 10    // Total animation duration in seconds
    },
    
    // ===================================
    // ELEMENT ANIMATIONS
    // ===================================
    // Each element is self-contained with all its animation properties
    
    elements: {
        
        topIcon: {
            visible: true, // Controls if element animates
            animationOrder: 0, // Position in animation sequence
            
            // Animation in (entrance) - DYNAMIC DELAY TIMING
            animateIn: {
                duration: 2.5, // Duration in seconds
                ease: "back.out(2)",
                from: {
                    opacity: 0,
                    scaleX: 0,
                    scaleY: 0,
                    rotation: -180
                },
                to: {
                    opacity: 1,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0
                }
            },
            
            // Animation out (exit) - Clean fade for chapters
            animateOut: {
                startTime: 9.0, // Later exit for chapters
                duration: 0.8, // Quick fade
                ease: "power2.inOut",
                to: {
                    opacity: 0
                    // No scale or rotation - just fade
                }
            }
        },
        
        topTitle: {
            visible: true,
            animationOrder: 1, // Position in animation sequence
            
            animateIn: {
                duration: 1.5, // Duration in seconds
                ease: "back.out(1.7)",
                from: {
                    opacity: 0,
                    y: -30 // Start 30px above
                },
                to: {
                    opacity: 1,
                    y: 0 // End at base position
                }
            },
            
            animateOut: {
                startTime: 9.1,
                duration: 0.8,
                ease: "power2.in",
                to: {
                    opacity: 0,
                    y: -30
                }
            }
        },
        
        mainTitle: {
            visible: true, // Fixed: Should be visible when content exists
            animationOrder: 2, // Position in animation sequence
            
            animateIn: {
                duration: 3.0, // Duration in seconds
                ease: "expo.out",
                from: {
                    opacity: 0,
                    y: 50 // Start 50px below
                },
                to: {
                    opacity: 1,
                    y: 0
                }
            },
            
            animateOut: {
                startTime: 9,
                duration: 1,
                ease: "power2.in",
                to: {
                    opacity: 0,
                    y: -50 // Exit upward
                }
            }
        },
        
        subtitle1: {
            visible: true, // Fixed: Should be visible when content exists
            animationOrder: 3, // Position in animation sequence
            
            animateIn: {
                duration: 2.5, // Duration in seconds
                ease: "expo.out",
                from: {
                    opacity: 0,
                    y: 50
                },
                to: {
                    opacity: 1,
                    y: 0
                }
            },
            
            animateOut: {
                startTime: 8.8,
                duration: 1,
                ease: "power2.in",
                to: {
                    opacity: 0,
                    y: -50
                }
            }
        },
        
        subtitle2: {
            visible: true,
            animationOrder: 4, // Position in animation sequence
            
            animateIn: {
                duration: 1.6, // Quick for chapter second subtitle
                ease: "power2.out",
                from: {
                    opacity: 0,
                    x: -30 // Subtle slide from left
                },
                to: {
                    opacity: 1,
                    x: 0
                }
            },
            
            animateOut: {
                startTime: 8.7,
                duration: 0.8,
                ease: "power2.in",
                to: {
                    opacity: 0,
                    y: -50
                }
            }
        },
        
        bottomIcons: {
            visible: true,
            animationOrder: 5, // Position in animation sequence
            
            animateIn: {
                duration: 2.0, // Duration in seconds
                ease: "expo.out",
                from: {
                    opacity: 0,
                    y: 40 // Start 40px below
                },
                to: {
                    opacity: 1,
                    y: 0
                },
                // Special properties for bottom icons
                stagger: 0.12, // Seconds between each center-out ring
                staggerType: "center-out" // Center-out pattern: 5 icons = 3→2+4→1+5, 6 icons = 3+4→2+5→1+6
            },
            
            animateOut: {
                startTime: 8.9,
                duration: 0.6,
                ease: "power2.in",
                to: {
                    opacity: 0
                },
                stagger: 0.08 // Faster stagger on exit
            }
        }
    },
    
    // ===================================
    // HELPER FUNCTIONS
    // ===================================
    
    /**
     * Get elements in animation order
     * @returns {Array} Array of element objects with name and config
     */
    getElementsInOrder: function() {
        const elements = Object.entries(this.elements);
        
        // Sort by animation order
        elements.sort((a, b) => a[1].animationOrder - b[1].animationOrder);
        
        return elements.map(([name, config]) => ({
            name: name,
            visible: config.visible,
            animationOrder: config.animationOrder,
            config: config
        }));
    },
    
    /**
     * Count visible elements before a given element
     * @param {string} targetElementName - Name of the target element
     * @returns {number} Number of visible elements before target
     */
    countVisibleElementsBefore: function(targetElementName) {
        const elementsInOrder = this.getElementsInOrder();
        let visibleCount = 0;
        
        for (let element of elementsInOrder) {
            if (element.name === targetElementName) {
                break;
            }
            if (element.visible) {
                visibleCount++;
            }
        }
        
        return visibleCount;
    },
    
    /**
     * Calculate delay for an element based on visible elements before it
     * @param {string} elementName - Name of the element
     * @returns {number} Delay in seconds
     */
    calculateElementDelay: function(elementName) {
        const visibleElementsBefore = this.countVisibleElementsBefore(elementName);
        const frameOffset = this.global.frameOffset / this.global.fps; // Convert frames to seconds
        
        return this.global.baseDelay + (visibleElementsBefore * frameOffset);
    },
    
    /**
     * Test function for dynamic delay calculation
     * Can be called from browser console: SimpleAnimations.testDelays()
     */
    testDelays: function() {
        console.log('🧪 DYNAMIC DELAY TEST');
        console.log(`⚙️ Config: baseDelay=${this.global.baseDelay}s, frameOffset=${this.global.frameOffset} frames (${(this.global.frameOffset/this.global.fps).toFixed(3)}s)`);
        
        const elementsInOrder = this.getElementsInOrder();
        
        elementsInOrder.forEach((element, index) => {
            if (element.visible) {
                const delay = this.calculateElementDelay(element.name);
                console.log(`${element.name}: delay=${delay.toFixed(3)}s (${this.countVisibleElementsBefore(element.name)} visible before)`);
            } else {
                console.log(`${element.name}: HIDDEN - skipped`);
            }
        });
        
        return this;
    },
    
    /**
     * Get animation timing for an element (legacy delay system)
     * @param {string} elementName - Name of the element
     * @returns {number} Start time in seconds
     */
    getElementStartTime: function(elementName) {
        // Now uses dynamic delay calculation
        return this.calculateElementDelay(elementName);
    },
    
    /**
     * Get all visible elements in order
     * @param {Object} visibilityState - Current visibility state
     * @returns {Array} Array of visible element names
     */
    getVisibleElements: function(visibilityState) {
        const elementOrder = ['topIcon', 'topTitle', 'mainTitle', 'subtitle1', 'subtitle2', 'bottomIcons'];
        return elementOrder.filter(name => visibilityState[name] && this.elements[name]);
    },
    
    /**
     * Update element visibility
     * @param {string} elementName - Name of the element
     * @param {boolean} visible - Visibility state
     */
    setElementVisibility: function(elementName, visible) {
        if (this.elements[elementName]) {
            this.elements[elementName].visible = visible;
        }
    },
    
    /**
     * Get animation config for an element
     * @param {string} elementName - Name of the element
     * @returns {Object} Element animation configuration
     */
    getElementConfig: function(elementName) {
        return this.elements[elementName] || null;
    },
    
    /**
     * Modify animation property easily
     * @param {string} elementName - Name of the element
     * @param {string} property - Property path (e.g., 'animateIn.duration')
     * @param {*} value - New value
     */
    setAnimationProperty: function(elementName, property, value) {
        const element = this.elements[elementName];
        if (!element) return;
        
        const keys = property.split('.');
        let current = element;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }
};

// Export for use - ChapterAnimations as SimpleAnimations for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChapterAnimations;
} else {
    // Make available as both names
    window.SimpleAnimations = ChapterAnimations;
    window.ChapterAnimations = ChapterAnimations;
}

// Console confirmation for Chapter Animation System
if (typeof console !== 'undefined') {
    console.log('📖 Chapter Animation System Loaded (template_002)');
    console.log(`📊 Elements configured: ${Object.keys(ChapterAnimations.elements).length}`);
    console.log(`⏱️ Frame offset: ${ChapterAnimations.global.frameOffset} frames (${(ChapterAnimations.global.frameOffset/ChapterAnimations.global.fps).toFixed(3)}s) between visible elements`);
    console.log(`🎯 Base delay: ${ChapterAnimations.global.baseDelay}s`);
    console.log(`✨ Chapter animations: Faster, subtle slide-in effects`);
}