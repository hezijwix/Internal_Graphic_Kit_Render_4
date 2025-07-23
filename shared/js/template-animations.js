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
                intro: {
                    from: { y: "+50", opacity: 0 },      // Start 50px below base position
                    to: { y: "0", opacity: 1 },          // End at base position
                    duration: 3,                         // 3 seconds
                    ease: "expo.out",                    // Exponential ease out
                    delay: 0.5                           // Start at 0.5s
                }
            }
        },

        topTitle: {
            name: "Top Title",
            enabled: true,
            animations: {
                intro: {
                    from: { y: "+50", opacity: 0 },      // Start 50px below base position
                    to: { y: "0", opacity: 1 },          // End at base position
                    duration: 3,                         // 3 seconds
                    ease: "expo.out",                    // Exponential ease out
                    delay: 0.2                           // Start at 0.2s (before mainTitle)
                }
            }
        },

        subtitle1: {
            name: "Subtitle 1",
            enabled: true,
            animations: {
                intro: {
                    from: { y: "+50", opacity: 0 },      // Start 50px below base position
                    to: { y: "0", opacity: 1 },          // End at base position
                    duration: 3,                         // 3 seconds
                    ease: "expo.out",                    // Exponential ease out
                    delay: 0.8                           // Start at 0.8s (after mainTitle)
                }
            }
        },

        subtitle2: {
            name: "Subtitle 2", 
            enabled: true,
            animations: {
                intro: {
                    from: { y: "+50", opacity: 0 },      // Start 50px below base position
                    to: { y: "0", opacity: 1 },          // End at base position
                    duration: 3,                         // 3 seconds
                    ease: "expo.out",                    // Exponential ease out
                    delay: 1.1                           // Start at 1.1s (last in sequence)
                }
            }
        }
    },

    // ===================================
    // ICON ELEMENTS ANIMATIONS  
    // ===================================
    icons: {
        topIcon: {
            name: "Top Icon",
            enabled: false
        },

        bottomIcons: {
            name: "Bottom Icons",
            enabled: false
        }
    },

    // ===================================
    // BACKGROUND ANIMATIONS
    // ===================================
    background: {
        main: {
            name: "Background",
            enabled: false
        }
    },

    // ===================================
    // ANIMATION PRESETS
    // ===================================
    presets: {
        current: "default",
        
        default: {
            name: "Default",
            description: "Main title animation only",
            overrides: {}
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