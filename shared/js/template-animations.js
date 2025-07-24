/**
 * Template Animation Configuration
 * Easy-to-edit animation settings for all template elements
 * 
 * @author Claude Code
 * @version 1.0.0
 */

const TemplateAnimations = {
    
    // ===================================
    // GLOBAL ANIMATION SETTINGS
    // ===================================
    global: {
        timeline: {
            duration: 10,        // Total timeline duration (seconds)
            fps: 30             // Frames per second
        },
        phases: {
            intro: { start: 0, end: 2 },     // Intro phase: 0-2 seconds
            hold: { start: 2, end: 8 },      // Hold phase: 2-8 seconds  
            exit: { start: 8, end: 10 }      // Exit phase: 8-10 seconds
        },
        defaults: {
            ease: "expo.out",    // Default easing for all animations
            stagger: 0.1         // Default stagger between elements
        }
    },

    // ===================================
    // TEXT ELEMENTS ANIMATIONS
    // ===================================
    text: {
        mainTitle: {
            name: "Main Title",
            enabled: true,
            animations: {
                // Primary animation: Slide in from below
                intro: {
                    from: { y: "+50", opacity: 0 },     
                    to: { y: "0", opacity: 1 },          // End at base position
                    duration: 3,                         
                    ease: "expo.out",                    
                    delay: 0.5,                          
                    stagger: 0                           
                },
                hold: {
                    // Stays at base position during hold phase
                    duration: 6    // 2s-8s = 6 seconds
                },
                exit: {
                    from: { y: "0", opacity: 1 },
                    to: { y: "-50", opacity: 0 },        // Exit upward
                    duration: 1,
                    ease: "power2.in",
                    delay: 0
                }
            },
            // Character-level animation options
            characterAnimation: {
                enabled: false,      // Enable individual character control
                type: "none",        // "typewriter", "wave", "stagger"
                spacing: 2           // Extra spacing between characters
            }
        },

        topTitle: {
            name: "Top Title",
            enabled: true,
            animations: {
                intro: {
                    from: { y: "-30", opacity: 0 },      // Start 30px above
                    to: { y: "0", opacity: 1 },
                    duration: 1.5,
                    ease: "back.out(1.7)",
                    delay: 0.2,
                    stagger: 0
                },
                hold: { duration: 6.3 },
                exit: {
                    from: { y: "0", opacity: 1 },
                    to: { y: "-30", opacity: 0 },
                    duration: 0.8,
                    ease: "power2.in",
                    delay: 0.1
                }
            },
            characterAnimation: {
                enabled: false,
                type: "none",
                spacing: 1
            }
        },

        subtitle1: {
            name: "Subtitle 1",
            enabled: true,
            animations: {
                intro: {
                    from: { y: "+50", opacity: 0 },      // Subtle upward movement like main title
                    to: { y: "0", opacity: 1 },
                    duration: 2.5,
                    ease: "expo.out",                    // Same easing as main title
                    delay: 1.0,
                    stagger: 0
                },
                hold: { duration: 5.5 },
                exit: {
                    from: { y: "0", opacity: 1 },
                    to: { y: "-50", opacity: 0 },        // Exit upward
                    duration: 1,
                    ease: "power2.in",
                    delay: 0.2
                }
            },
            characterAnimation: {
                enabled: false,
                type: "none",
                spacing: 1
            }
        },

        subtitle2: {
            name: "Subtitle 2", 
            enabled: true,
            animations: {
                intro: {
                    from: { y: "+50", opacity: 0 },      // Subtle upward movement like main title
                    to: { y: "0", opacity: 1 },
                    duration: 2.2,
                    ease: "expo.out",                    // Same easing as main title
                    delay: 1.2,
                    stagger: 0
                },
                hold: { duration: 5.3 },
                exit: {
                    from: { y: "0", opacity: 1 },
                    to: { y: "-50", opacity: 0 },        // Exit upward
                    duration: 0.8,
                    ease: "power2.in",
                    delay: 0.3
                }
            },
            characterAnimation: {
                enabled: false,
                type: "none",
                spacing: 1
            }
        }
    },

    // ===================================
    // ICON ELEMENTS ANIMATIONS  
    // ===================================
    icons: {
        topIcon: {
            name: "Top Icon",
            enabled: true,
            animations: {
                intro: {
                    from: { scaleX: 0, scaleY: 0, rotation: -180, opacity: 0 },
                    to: { scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 },
                    duration: 2.5,
                    ease: "back.out(2)",
                    delay: 0.3,
                    stagger: 0
                },
                hold: { 
                    duration: 5.7,
                    // Optional continuous animation during hold
                    continuous: {
                        enabled: false,
                        type: "pulse",           // "pulse", "float", "rotate", "glow"
                        amplitude: 1.1,          // Scale factor for pulse
                        speed: 2                 // Animation speed
                    }
                },
                exit: {
                    from: { scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 },
                    to: { scaleX: 0, scaleY: 0, rotation: 180, opacity: 0 },
                    duration: 1.2,
                    ease: "power2.in",
                    delay: 0
                }
            }
        },

        bottomIcons: {
            name: "Bottom Icons",
            enabled: false,              // DISABLED - Keep icons static at base position
            count: 4,                    // Number of bottom icons
            animations: {
                intro: {
                    from: { y: "+30", opacity: 0, scaleX: 0.8, scaleY: 0.8, rotation: 0 },
                    to: { y: "0", opacity: 1, scaleX: 1, scaleY: 1, rotation: 0 },
                    duration: 1.2,
                    ease: "back.out(1.7)",
                    delay: 1.8,
                    stagger: 0.08            // Faster stagger for smoother reveal
                },
                hold: { 
                    duration: 4.4,          // Adjusted for new timing
                    continuous: {
                        enabled: false,      // Disabled floating for cleaner look
                        type: "pulse",       // Changed to subtle pulse
                        amplitude: 1.05,     // Very subtle scale change
                        speed: 4,            // Slower, more elegant
                        stagger: 0.1         // Reduced stagger
                    }
                },
                exit: {
                    from: { y: "0", opacity: 1, scaleX: 1, scaleY: 1, rotation: 0 },
                    to: { y: "-20", opacity: 0, scaleX: 0.9, scaleY: 0.9, rotation: 0 },
                    duration: 0.8,
                    ease: "power2.in",
                    delay: 0.2,
                    stagger: 0.06            // Faster exit stagger
                }
            }
        }
    },

    // ===================================
    // BACKGROUND ANIMATIONS
    // ===================================
    background: {
        main: {
            name: "Background",
            enabled: false,              // Usually static
            animations: {
                intro: {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                    duration: 1,
                    ease: "none",
                    delay: 0
                },
                hold: { duration: 8 },
                exit: {
                    from: { opacity: 1 },
                    to: { opacity: 0 },
                    duration: 1,
                    ease: "none",
                    delay: 0
                }
            }
        }
    },

    // ===================================
    // ANIMATION PRESETS
    // ===================================
    presets: {
        current: "slideInFromBelow",     // Active preset
        
        slideInFromBelow: {
            name: "Slide In From Below",
            description: "Elements slide up with staggered timing",
            // Preset can override individual element settings
            overrides: {
                "text.mainTitle.animations.intro.from": { y: "+100", opacity: 0 },
                "text.mainTitle.animations.intro.ease": "expo.out",
                "text.topTitle.animations.intro.from": { y: "-30", opacity: 0 },
                "text.subtitle1.animations.intro.from": { x: "-50", opacity: 0 },
                "text.subtitle2.animations.intro.from": { scaleX: 0, scaleY: 0, opacity: 0 }
            }
        },
        
        fadeInSequence: {
            name: "Fade In Sequence", 
            description: "Simple fade in with staggered timing",
            overrides: {
                "text.mainTitle.animations.intro.from": { opacity: 0 },
                "text.mainTitle.animations.intro.to": { opacity: 1 },
                "text.mainTitle.animations.intro.ease": "power2.out",
                "text.topTitle.animations.intro.from": { opacity: 0 },
                "text.topTitle.animations.intro.to": { opacity: 1 },
                "text.subtitle1.animations.intro.from": { opacity: 0 },
                "text.subtitle1.animations.intro.to": { opacity: 1 },
                "text.subtitle2.animations.intro.from": { opacity: 0 },
                "text.subtitle2.animations.intro.to": { opacity: 1 }
            }
        },
        
        dynamicEntrance: {
            name: "Dynamic Entrance",
            description: "Mixed animation types for dynamic feel",
            overrides: {
                "text.mainTitle.animations.intro.ease": "bounce.out",
                "text.mainTitle.animations.intro.duration": 2.5,
                "text.topTitle.animations.intro.ease": "elastic.out(1, 0.3)",
                "text.subtitle1.animations.intro.ease": "back.out(1.7)",
                "text.subtitle2.animations.intro.ease": "power4.out",
                "icons.topIcon.animations.intro.ease": "elastic.out(2, 0.3)",
                "icons.bottomIcons.animations.intro.ease": "back.out(2)"
            }
        },

        minimal: {
            name: "Minimal",
            description: "Subtle animations for professional look",
            overrides: {
                "text.mainTitle.animations.intro.from": { y: "+20", opacity: 0 },
                "text.mainTitle.animations.intro.duration": 1.5,
                "text.mainTitle.animations.intro.ease": "power2.out",
                "text.topTitle.animations.intro.from": { y: "-10", opacity: 0 },
                "text.topTitle.animations.intro.duration": 1,
                "text.subtitle1.animations.intro.from": { opacity: 0 },
                "text.subtitle1.animations.intro.duration": 1,
                "text.subtitle2.animations.intro.from": { opacity: 0 },
                "text.subtitle2.animations.intro.duration": 1,
                "icons.topIcon.animations.intro.from": { scaleX: 0.8, scaleY: 0.8, opacity: 0 },
                "icons.topIcon.animations.intro.to": { scaleX: 1, scaleY: 1, opacity: 1 },
                "icons.topIcon.animations.intro.ease": "power2.out"
            }
        }
    },

    // ===================================
    // HELPER FUNCTIONS
    // ===================================
    utils: {
        // Function to get animation config for specific element
        getElementAnimation: function(elementType, elementName, phase) {
            return TemplateAnimations[elementType]?.[elementName]?.animations?.[phase];
        },
        
        // Function to apply preset overrides
        applyPreset: function(presetName) {
            const preset = TemplateAnimations.presets[presetName];
            if (!preset || !preset.overrides) {
                console.warn(`Preset '${presetName}' not found or has no overrides`);
                return;
            }

            console.log(`🎨 Applying animation preset: ${preset.name}`);
            
            // Apply overrides to configuration
            Object.entries(preset.overrides).forEach(([path, value]) => {
                this.setDeepProperty(TemplateAnimations, path, value);
            });
            
            // Update current preset
            TemplateAnimations.presets.current = presetName;
            console.log(`✅ Preset '${preset.name}' applied successfully`);
        },
        
        // Helper function to set deep object property by path
        setDeepProperty: function(obj, path, value) {
            const keys = path.split('.');
            let current = obj;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
        },
        
        // Function to get all enabled elements
        getEnabledElements: function() {
            const enabled = [];
            ['text', 'icons', 'background'].forEach(category => {
                Object.entries(TemplateAnimations[category] || {}).forEach(([name, config]) => {
                    if (config.enabled) {
                        enabled.push({ category, name, config });
                    }
                });
            });
            return enabled;
        },
        
        // Function to get timeline phases
        getPhases: function() {
            return TemplateAnimations.global.phases;
        },
        
        // Function to get global settings
        getGlobalSettings: function() {
            return TemplateAnimations.global;
        },
        
        // Function to toggle element
        toggleElement: function(elementType, elementName, enabled) {
            if (TemplateAnimations[elementType] && TemplateAnimations[elementType][elementName]) {
                TemplateAnimations[elementType][elementName].enabled = enabled;
                console.log(`${enabled ? '✅' : '❌'} ${elementType}.${elementName} ${enabled ? 'enabled' : 'disabled'}`);
            }
        },
        
        // Function to get available presets
        getPresets: function() {
            const presets = {};
            Object.entries(TemplateAnimations.presets).forEach(([key, value]) => {
                if (key !== 'current' && typeof value === 'object') {
                    presets[key] = {
                        name: value.name,
                        description: value.description
                    };
                }
            });
            return presets;
        },
        
        // Function to validate animation configuration
        validateConfig: function() {
            const issues = [];
            
            // Check if all elements have required properties
            this.getEnabledElements().forEach(element => {
                if (!element.config.animations) {
                    issues.push(`${element.category}.${element.name} missing animations`);
                }
                if (!element.config.animations?.intro) {
                    issues.push(`${element.category}.${element.name} missing intro animation`);
                }
            });
            
            return {
                valid: issues.length === 0,
                issues: issues
            };
        }
    }
};

// Export for use in template engine
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateAnimations;
} else {
    window.TemplateAnimations = TemplateAnimations;
}

// Console helper for debugging
if (typeof console !== 'undefined') {
    console.log('🎬 Template Animations Configuration Loaded');
    console.log(`📊 Enabled elements: ${TemplateAnimations.utils.getEnabledElements().length}`);
    console.log(`🎨 Available presets: ${Object.keys(TemplateAnimations.utils.getPresets()).length}`);
    console.log(`⏱️ Timeline duration: ${TemplateAnimations.global.timeline.duration}s`);
}