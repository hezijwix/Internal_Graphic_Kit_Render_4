// Enable Konva's text rendering fix for better kerning
Konva._fixTextRendering = true;

// Template Editor - Main Application
class TemplateEditor {
    constructor() {
        this.isPlaying = false;
        this.currentFrame = 0;
        this.totalFrames = 300;
        this.fps = 30;
        this.duration = 10; // seconds
        this.playhead = null;
        
        // Konva stage and layers
        this.stage = null;
        this.backgroundLayer = null;
        this.contentLayer = null;
        this.uiLayer = null;
        
        // Template objects - New structure matching Figma design
        this.templateObjects = {
            background: null,
            topIcon: null,
            topTitle: null,
            mainTitle: null,
            subtitle1: null,
            subtitle2: null,
            bottomIcons: []
        };
        
        // Base Position System for Animation Structure
        this.basePositions = {
            topIcon: { x: 960, y: 200, width: 56, height: 56 },
            topTitle: { x: 960, y: 280, width: 1490, height: 64 },
            mainTitle: { x: 960, y: 390, width: 1490, height: 180 },
            subtitle1: { x: 960, y: 520, width: 1490, height: 75 },
            subtitle2: { x: 960, y: 630, width: 1490, height: 40 },
            bottomIcons: { x: 960, y: 720, spacing: 260, iconSize: 40 }
        };
        
        // Animation Position States
        this.positionStates = {
            initial: {}, // Where elements start before animating in
            base: {},    // Final resting position (calculated dynamically)
            exit: {}     // Where elements move when animating out
        };
        
        // Position calculation settings
        this.layoutConfig = {
            canvasWidth: 1920,
            canvasHeight: 1080,
            contentWidth: 1490, // 1920 - (215px * 2)
            leftMargin: 215,
            rightMargin: 215,
            elementGap: 26,
            centerX: 960
        };
        
        // Layer visibility state - FORCE ICONS TO BE VISIBLE
        this.layerVisibility = {
            topIcon: true,      // FORCE VISIBLE
            topTitle: true,
            mainTitle: true,
            subtitle1: true,
            subtitle2: true,
            bottomIcons: true   // FORCE VISIBLE
        };
        
        // Ensure visibility is locked for icons
        console.log('🔒 Layer visibility initialized with icons FORCED visible');
        
        // Bottom icons configuration - unified circle icons
        this.bottomIconsConfig = {
            count: 4,
            spacing: 260,
            icons: ['circle', 'circle', 'circle', 'circle', 'circle', 'circle'] // Support up to 6 icons
        };
        
        // Top icon configuration
        this.topIconConfig = {
            type: 'circle' // Default circle for top icon
        };
        
        // Icon storage and management
        this.uploadedIcons = {
            top: null,
            bottom: [null, null, null, null, null, null] // Support up to 6 bottom icons
        };
        
        // Store current icon data for dynamic color updates
        this.currentTopIconData = null;
        this.currentBottomIconsData = [null, null, null, null, null, null]; // Store bottom icon data for color updates
        

        
        // GSAP Timeline
        this.timeline = null;
        this.animationDuration = 10; // seconds
        
        // ================================
        // NEW ANIMATION SYSTEM - MODERN CONTROL FRAMEWORK
        // ================================
        this.animationSystem = new AnimationSystem();
        
        // Background transparency
        this.backgroundTransparency = false;
        this.currentBackgroundColor = '#0D0D0D';
        
        // Initialize animation system with template elements (will be registered after elements are created)
        
        // Animation system helper methods
        this.registerAnimationElements = this.registerAnimationElements.bind(this);
        
        // Zoom and pan state
        this.zoomLevel = 50; // Changed from 100% to 50% default
        this.minZoom = 10;
        this.maxZoom = 400;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupCollapsibleSections();
        this.setupFormControls();
        this.setupPlaybackControls();
        this.setupTimelineInteraction();
        this.initializeZoom();
        this.renderDefaultTemplate();
        
        // Load project data if available
        setTimeout(() => this.loadProjectData(), 100);
        
        // Remove shadow from main title if it exists
        setTimeout(() => this.removeMainTitleShadow(), 200);
        
        console.log('Template Editor initialized successfully');
    }
    
    /**
     * Register all template elements with the animation system
     * This enables individual control over each element's animations
     */
    registerAnimationElements() {
        console.log('🎭 Registering elements with Animation System...');
        
        // Register text elements
        if (this.templateObjects.topTitle) {
            this.animationSystem.register('topTitle', this.templateObjects.topTitle, 'text');
        }
        if (this.templateObjects.mainTitle) {
            this.animationSystem.register('mainTitle', this.templateObjects.mainTitle, 'text');
        }
        if (this.templateObjects.subtitle1) {
            this.animationSystem.register('subtitle1', this.templateObjects.subtitle1, 'text');
        }
        if (this.templateObjects.subtitle2) {
            this.animationSystem.register('subtitle2', this.templateObjects.subtitle2, 'text');
        }
        
        // Register icon elements
        if (this.templateObjects.topIcon) {
            this.animationSystem.register('topIcon', this.templateObjects.topIcon, 'icon');
        }
        if (this.templateObjects.bottomIcons && Array.isArray(this.templateObjects.bottomIcons)) {
            this.templateObjects.bottomIcons.forEach((icon, index) => {
                if (icon) {
                    this.animationSystem.register(`bottomIcon${index}`, icon, 'icon');
                }
            });
        }
        
        console.log('✅ Animation System registration complete');
        console.log('📊 Animation System Stats:', this.animationSystem.getStats());
    }
    
    /**
     * Get animation controller for any element
     * @param {string} elementId - Element identifier
     * @returns {AnimationController|TextAnimator|IconAnimator}
     */
    getAnimator(elementId) {
        return this.animationSystem.get(elementId);
    }
    
    /**
     * Get text animator for text elements
     * @param {string} elementId - Text element identifier
     * @returns {TextAnimator}
     */
    getTextAnimator(elementId) {
        return this.animationSystem.getText(elementId);
    }
    
    /**
     * Get icon animator for icon elements
     * @param {string} elementId - Icon element identifier  
     * @returns {IconAnimator}
     */
    getIconAnimator(elementId) {
        return this.animationSystem.getIcon(elementId);
    }
    
    setupCanvas() {
        // Create Konva stage
        this.stage = new Konva.Stage({
            container: 'konva-container',
            width: 1920,
            height: 1080
        });
        
        // Create layers for better organization and performance
        this.backgroundLayer = new Konva.Layer();
        this.contentLayer = new Konva.Layer();
        this.uiLayer = new Konva.Layer();
        
        // Add layers to stage
        this.stage.add(this.backgroundLayer);
        this.stage.add(this.contentLayer);
        this.stage.add(this.uiLayer);
        
        // Initialize template objects
        this.createTemplateObjects();
        
        // Setup interaction handlers
        this.setupCanvasInteraction();
        
        // Create GSAP timeline
        this.createGSAPTimeline();
        
        console.log('Konva stage initialized: 1920x1080');
    }
    
    setupEventListeners() {
        // Header interactions - Export dropdown
        this.setupExportDropdown();
        
        // Template selection removed - editing specific template only
        
        // Color swatches
        const colorSwatches = document.querySelectorAll('.color-swatch');
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', (e) => this.selectColor(e.target));
        });
        
        // Icon presets
        const iconPresets = document.querySelectorAll('.icon-preset');
        iconPresets.forEach(icon => {
            icon.addEventListener('click', (e) => this.selectIcon(e.target.closest('.icon-preset')));
        });
        
        // Animation presets
        const presetCards = document.querySelectorAll('.preset-card');
        presetCards.forEach(card => {
            card.addEventListener('click', (e) => this.selectAnimation(e.target.closest('.preset-card')));
        });
        
        // Layer interactions - REMOVED (layer panels no longer in UI)
        /*
        const layerItems = document.querySelectorAll('.layer-item');
        layerItems.forEach(layer => {
            layer.addEventListener('click', (e) => this.selectLayer(e.target.closest('.layer-item')));
        });
        
        const layerVisibilityBtns = document.querySelectorAll('.layer-visibility');
        layerVisibilityBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLayerVisibility(e.target.closest('.layer-item'));
            });
        });
        
        const layerLockBtns = document.querySelectorAll('.layer-lock');
        layerLockBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLayerLock(e.target.closest('.layer-item'));
            });
        });
        */
        
        // Upload buttons
        const uploadBtn = document.querySelector('.upload-btn');
        uploadBtn.addEventListener('click', () => this.handleIconUpload('top'));
        
        // Bottom icon upload buttons (delegated event handling)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.upload-slot-icon')) {
                const slotButton = e.target.closest('.upload-slot-icon');
                const slotIndex = parseInt(slotButton.dataset.slot);
                this.handleIconUpload('bottom', slotIndex);
            }
        });
        

        
        // Project name editing
        const projectName = document.querySelector('.project-name');
        projectName.addEventListener('blur', () => this.saveProjectName(projectName.textContent));
        projectName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                projectName.blur();
            }
        });
        
        // Zoom and pan controls
        this.setupZoomControls();
        this.setupCanvasPanning();
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
                return;
            }
            
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePlayback();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousFrame();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextFrame();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToBeginning();
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToEnd();
                    break;
                case 's':
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        this.saveProject();
                    }
                    break;
                case 'e':
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        // Toggle export dropdown
                        const exportDropdown = document.querySelector('.export-dropdown');
                        exportDropdown.classList.toggle('open');
                        const exportBtn = document.querySelector('.export-btn');
                        const isOpen = exportDropdown.classList.contains('open');
                        exportBtn.setAttribute('aria-expanded', isOpen);
                    }
                    break;
                case '=':
                case '+':
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        this.zoomIn();
                    }
                    break;
                case '-':
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        this.zoomOut();
                    }
                    break;
                case '0':
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        this.fitToScreen();
                    }
                    break;
            }
        });
    }
    
    setupCollapsibleSections() {
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.closest('.panel-section');
                const toggle = header.querySelector('.section-toggle');
                const content = section.querySelector('.section-content');
                const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                
                toggle.setAttribute('aria-expanded', !isExpanded);
                content.classList.toggle('collapsed', isExpanded);
                
                // Smooth animation
                if (isExpanded) {
                    content.style.maxHeight = '0px';
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
    }
    
    setupFormControls() {
        // Text inputs for all layers
        const topTitleInput = document.getElementById('top-title');
        const mainTitleInput = document.getElementById('main-title');
        const subtitle1Input = document.getElementById('subtitle1');
        const subtitle2Input = document.getElementById('subtitle2');
        
        // Text input event listeners with width-based limiting
        if (topTitleInput) {
            topTitleInput.addEventListener('input', (e) => {
                const limitedValue = this.limitTextInputByWidth(e.target.value, 'topTitle');
                if (limitedValue !== e.target.value) {
                    e.target.value = limitedValue;
                }
                this.updateText('topTitle', limitedValue);
            });
        }
        if (mainTitleInput) {
            // Prevent manual line breaks
            mainTitleInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent manual line breaks
                }
            });
            
            // Handle input with cleaning and limiting
            mainTitleInput.addEventListener('input', (e) => {
                // Clean the input first
                const cleanedValue = e.target.value.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
                
                // Then limit by 2-line wrapping
                const limitedValue = this.limitMainTitleInput(cleanedValue);
                if (limitedValue !== e.target.value) {
                    e.target.value = limitedValue;
                }
                this.updateText('mainTitle', limitedValue);
            });
            
            // Handle paste events to clean up pasted content
            mainTitleInput.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const cleanedText = pastedText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
                mainTitleInput.value = cleanedText;
                this.updateText('mainTitle', cleanedText);
            });
        }
        if (subtitle1Input) {
            subtitle1Input.addEventListener('input', (e) => {
                const limitedValue = this.limitTextInputByWidth(e.target.value, 'subtitle1');
                if (limitedValue !== e.target.value) {
                    e.target.value = limitedValue;
                }
                this.updateText('subtitle1', limitedValue);
            });
        }
        if (subtitle2Input) {
            subtitle2Input.addEventListener('input', (e) => {
                const limitedValue = this.limitTextInputByWidth(e.target.value, 'subtitle2');
                if (limitedValue !== e.target.value) {
                    e.target.value = limitedValue;
                }
                this.updateText('subtitle2', limitedValue);
            });
        }
        
        // Layer visibility toggles
        this.setupVisibilityToggles();
        
        // Font controls
        const fontFamilySelect = document.getElementById('font-family');
        if (fontFamilySelect) {
            fontFamilySelect.addEventListener('change', () => this.updateFont('family', fontFamilySelect.value));
        }
        
        // Icon controls
        this.setupIconControls();
        
        // Zoom controls
        const zoomSelect = document.querySelector('.zoom-select');
        if (zoomSelect) {
            zoomSelect.addEventListener('change', () => this.setZoom(parseInt(zoomSelect.value)));
        }
    }
    
    setupVisibilityToggles() {
        const toggles = {
            'top-icon-visible': 'topIcon',
            'bottom-icons-visible': 'bottomIcons'
        };
        
        Object.entries(toggles).forEach(([id, layer]) => {
            const toggle = document.getElementById(id);
            if (toggle) {
                toggle.addEventListener('change', () => {
                    this.layerVisibility[layer] = toggle.checked;
                    this.updateLayerVisibility(layer);
                    this.repositionLayers();
                });
            }
        });
    }
    
    setupIconControls() {
        // Icon count slider
        const iconCountSlider = document.getElementById('icon-count');
        const iconCountValue = iconCountSlider?.nextElementSibling;
        
        if (iconCountSlider) {
            iconCountSlider.addEventListener('input', () => {
                this.bottomIconsConfig.count = parseInt(iconCountSlider.value);
                if (iconCountValue) {
                    iconCountValue.textContent = iconCountSlider.value;
                }
                this.updateIconSlots();
                // Recreate bottom icons with new count
                this.createBottomIconsExact();
                this.recalculateLayout();
                this.stage.batchDraw();
            });
        }
        
        // Icon selection buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.icon-option')) {
                const button = e.target.closest('.icon-option');
                const slot = button.closest('.icon-slot');
                const slotIndex = parseInt(slot.dataset.slot);
                const iconType = button.dataset.icon;
                
                // Update icon type in configuration
                this.bottomIconsConfig.icons[slotIndex] = iconType;
                
                // Update UI
                slot.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('active'));
                button.classList.add('active');
                
                // Update current icon display
                const currentIcon = slot.querySelector('.current-icon');
                currentIcon.innerHTML = button.innerHTML;
                
                // Recreate bottom icons with new configuration
                this.createBottomIconsExact();
                this.recalculateLayout();
                this.stage.batchDraw();
            }
        });
        
        // Top icon presets
        document.addEventListener('click', (e) => {
            if (e.target.closest('.icon-preset')) {
                const button = e.target.closest('.icon-preset');
                const iconType = button.dataset.icon;
                
                // Update active state
                document.querySelectorAll('.icon-preset').forEach(preset => preset.classList.remove('active'));
                button.classList.add('active');
                
                // Update top icon configuration and recreate
                this.topIconConfig.type = iconType;
                if (this.templateObjects.topIcon) {
                    this.templateObjects.topIcon.destroy();
                    this.createTopIconFromConfig(this.templateObjects.topIcon.y());
                    this.updateGSAPTimeline();
                    this.stage.batchDraw();
                }
            }
        });
    }
    
    setupPlaybackControls() {
        // Main play button
        const mainPlayBtn = document.querySelector('.play-btn');
        mainPlayBtn.addEventListener('click', () => this.togglePlayback());
        
        // Timeline controls
        const timelinePlayBtn = document.querySelector('.timeline-play');
        const beginningBtn = document.querySelector('.timeline-controls button:first-child');
        const prevFrameBtn = document.querySelector('.timeline-controls button:nth-child(2)');
        const nextFrameBtn = document.querySelector('.timeline-controls button:nth-child(4)');
        const endBtn = document.querySelector('.timeline-controls button:last-child');
        
        timelinePlayBtn.addEventListener('click', () => this.togglePlayback());
        beginningBtn.addEventListener('click', () => this.goToBeginning());
        prevFrameBtn.addEventListener('click', () => this.previousFrame());
        nextFrameBtn.addEventListener('click', () => this.nextFrame());
        endBtn.addEventListener('click', () => this.goToEnd());
    }
    
    setupTimelineInteraction() {
        const playheadHandle = document.querySelector('.playhead-handle');
        const timelineTrack = document.querySelector('.timeline-track');
        let isDragging = false;
        
        playheadHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = timelineTrack.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            // Convert percentage to frame and seek
            const targetFrame = Math.floor((percentage / 100) * this.totalFrames);
            this.seekToFrame(targetFrame);
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        // Click on timeline to jump
        timelineTrack.addEventListener('click', (e) => {
            if (e.target === playheadHandle) return;
            
            const rect = timelineTrack.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            // Convert percentage to frame and seek
            const targetFrame = Math.floor((percentage / 100) * this.totalFrames);
            this.seekToFrame(targetFrame);
        });
    }
    
    // Asset Management
    
    selectColor(colorSwatch) {
        const colorGroup = colorSwatch.closest('.color-group');
        colorGroup.querySelectorAll('.color-swatch').forEach(swatch => swatch.classList.remove('active'));
        colorSwatch.classList.add('active');
        
        const color = colorSwatch.dataset.color;
        const colorType = colorGroup.querySelector('label').textContent;
        
        this.updateColor(colorType, color);
        console.log(`Selected ${colorType}: ${color}`);
    }
    
    selectIcon(iconPreset) {
        document.querySelectorAll('.icon-preset').forEach(icon => icon.classList.remove('active'));
        iconPreset.classList.add('active');
        
        this.renderDefaultTemplate();
        console.log('Icon selected');
    }
    
    selectAnimation(presetCard) {
        document.querySelectorAll('.preset-card').forEach(card => card.classList.remove('active'));
        presetCard.classList.add('active');
        
        const animationName = presetCard.querySelector('.preset-name').textContent;
        console.log(`Selected animation: ${animationName}`);
    }
    
    // Timeline interaction removed - no longer needed since layer panels are removed
    /*
    selectLayer(layerItem) {
        document.querySelectorAll('.layer-item').forEach(layer => layer.classList.remove('active'));
        layerItem.classList.add('active');
        
        const layerName = layerItem.querySelector('.layer-name').textContent;
        console.log(`Selected layer: ${layerName}`);
    }
    
    toggleLayerVisibility(layerItem) {
        const visibilityBtn = layerItem.querySelector('.layer-visibility');
        const isVisible = visibilityBtn.getAttribute('aria-pressed') !== 'true';
        const layerType = layerItem.dataset.layer;
        
        visibilityBtn.setAttribute('aria-pressed', isVisible);
        visibilityBtn.style.opacity = isVisible ? '0.5' : '1';
        
        // Toggle Konva object visibility
        const layerMap = {
            'top-icon': this.templateObjects.topIcon,
            'top-title': this.templateObjects.topTitle,
            'main-title': this.templateObjects.mainTitle,
            'subtitle1': this.templateObjects.subtitle1,
            'subtitle2': this.templateObjects.subtitle2,
            'bottom-icons': this.templateObjects.bottomIcons
        };
        
        const object = layerMap[layerType];
        if (object) {
            if (Array.isArray(object)) {
                // Handle bottom icons array
                object.forEach(icon => icon.visible(!isVisible));
            } else {
                object.visible(!isVisible);
            }
        }
        
        if (this.stage) {
            this.stage.batchDraw();
        }
        
        console.log(`Layer ${layerType} visibility toggled: ${!isVisible}`);
    }
    
    toggleLayerLock(layerItem) {
        const lockBtn = layerItem.querySelector('.layer-lock');
        const isLocked = lockBtn.getAttribute('aria-pressed') !== 'true';
        
        lockBtn.setAttribute('aria-pressed', isLocked);
        lockBtn.style.opacity = isLocked ? '1' : '0.5';
        
        console.log('Layer lock toggled');
    }
    */
    
    // Content Updates
    updateText(type, value) {
        const textObject = this.templateObjects[type];
        if (textObject) {
            // Process text based on type (handle width constraints and line breaking)
            const processedText = this.processTextForWidth(type, value);
            
            // Apply dynamic font sizing for main title
            if (type === 'mainTitle') {
                const dynamicFontSize = this.calculateDynamicMainTitleFontSize(processedText);
                textObject.fontSize(dynamicFontSize);
                // Remove shadow from main title
                this.removeMainTitleShadow();
                console.log(`Main title font size updated to: ${dynamicFontSize}px for "${processedText.replace(/\n/g, ' ')}" (${processedText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().length} chars)`);
            }
            
            textObject.text(processedText);
            // Center text both horizontally and vertically
            // For fixed-width text, offsetX should be half of the fixed width (1490/2 = 745)
            textObject.offsetX(745); // Center within the 1490px width
            textObject.offsetY(textObject.height() / 2);
            
            // Auto-manage visibility based on text content
            const hasContent = processedText && processedText.trim().length > 0;
            this.layerVisibility[type] = hasContent;
            textObject.visible(hasContent);
            
            console.log(`${type} visibility auto-set to: ${hasContent} (content: "${processedText.trim()}")`);
            
            // Recalculate layout when text content changes (affects height and visibility)
            this.recalculateLayout();
            
            // Note: Bottom icons are now repositioned automatically by recalculateLayout()
            // No need for separate createBottomIconsExact() call here
            
            this.stage.batchDraw();
        }
        
        this.updateTemplateProperties();
        
        console.log(`Updated ${type} text: ${value}`);
    }
    
    processTextForWidth(type, text) {
        const maxWidth = 1490; // 1920 - (215px * 2)
        
        // For main title, enable automatic word wrapping and convert to uppercase
        if (type === 'mainTitle') {
            // Remove all manual line breaks and extra spaces first
            const cleanedText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
            const uppercaseText = cleanedText.toUpperCase();
            
            // Manual word wrapping with strict 2-line limit
            return this.wrapTextToTwoLines(uppercaseText, maxWidth);
        }
        
        // For other text types, just return the text as-is
        // Width limiting is handled by input field restrictions
        return text;
    }
    
    getFontSizeForType(type) {
        switch (type) {
            case 'topTitle': return 64;
            case 'mainTitle': return 180;
            case 'subtitle1': return 75;
            case 'subtitle2': return 40;
            default: return 40;
        }
    }
    
    getFontStyleForType(type) {
        switch (type) {
            case 'topTitle': return 'bold';
            case 'mainTitle': return '800';
            case 'subtitle1': return 'bold';
            case 'subtitle2': return 'normal';
            default: return 'normal';
        }
    }
    
    wrapTextToTwoLines(text, maxWidth) {
        // Calculate dynamic font size first
        const dynamicFontSize = this.calculateDynamicMainTitleFontSize(text);
        
        // Create a temporary text object for measurement with proper kerning and dynamic sizing
        const tempText = new Konva.Text({
            fontSize: dynamicFontSize,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: '800', // Back to original Figma extra bold
            letterSpacing: 0 // Let natural kerning work
        });
        
        const words = text.split(' ');
        let line1 = '';
        let line2 = '';
        let currentLine = 1;
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine === 1 ? 
                (line1 + (line1 ? ' ' : '') + word) : 
                (line2 + (line2 ? ' ' : '') + word);
            
            // Test the width of this line
            tempText.text(testLine);
            const lineWidth = tempText.width();
            
            if (lineWidth <= maxWidth) {
                // Word fits on current line
                if (currentLine === 1) {
                    line1 = testLine;
                } else {
                    line2 = testLine;
                }
            } else {
                // Word doesn't fit
                if (currentLine === 1) {
                    // Move to line 2
                    currentLine = 2;
                    line2 = word;
                } else {
                    // Already on line 2 and word doesn't fit - stop here
                    break;
                }
            }
        }
        
        tempText.destroy();
        
        // Return the result with at most 2 lines
        if (line2) {
            return line1 + '\n' + line2;
        } else {
            return line1;
        }
    }
    
    limitTextInputByWidth(text, type) {
        const maxWidth = 1490; // 1920 - (215px * 2)
        const fontSize = this.getFontSizeForType(type);
        const fontStyle = this.getFontStyleForType(type);
        
        // Create a temporary text object for measurement with proper kerning
        const tempText = new Konva.Text({
            text: text,
            fontSize: fontSize,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: fontStyle,
            letterSpacing: 0 // Let natural kerning work
        });
        
        // If text fits, return as-is
        if (tempText.width() <= maxWidth) {
            tempText.destroy();
            return text;
        }
        
        // If text is too wide, find the maximum characters that fit
        let limitedText = text;
        while (tempText.width() > maxWidth && limitedText.length > 0) {
            limitedText = limitedText.slice(0, -1);
            tempText.text(limitedText);
        }
        
        tempText.destroy();
        return limitedText;
    }
    
    limitMainTitleInput(text) {
        const maxWidth = 1490; // 1920 - (215px * 2)
        
        // Calculate dynamic font size first
        const dynamicFontSize = this.calculateDynamicMainTitleFontSize(text);
        
        // Create a temporary text object for measurement with proper kerning and dynamic sizing
        const tempText = new Konva.Text({
            fontSize: dynamicFontSize,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: '800', // Back to original Figma extra bold
            letterSpacing: 0 // Let natural kerning work
        });
        
        const words = text.split(' ');
        let allowedWords = [];
        let line1 = '';
        let line2 = '';
        let currentLine = 1;
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine === 1 ? 
                (line1 + (line1 ? ' ' : '') + word) : 
                (line2 + (line2 ? ' ' : '') + word);
            
            // Test the width of this line
            tempText.text(testLine);
            const lineWidth = tempText.width();
            
            if (lineWidth <= maxWidth) {
                // Word fits on current line
                allowedWords.push(word);
                if (currentLine === 1) {
                    line1 = testLine;
                } else {
                    line2 = testLine;
                }
            } else {
                // Word doesn't fit
                if (currentLine === 1) {
                    // Move to line 2
                    currentLine = 2;
                    line2 = word;
                    allowedWords.push(word);
                } else {
                    // Already on line 2 and word doesn't fit - stop here
                    break;
                }
            }
        }
        
        tempText.destroy();
        return allowedWords.join(' ');
    }
    
    updateLayerVisibility(layer) {
        const object = this.templateObjects[layer];
        if (object) {
            if (Array.isArray(object)) {
                // Handle bottom icons array
                object.forEach(icon => icon.visible(this.layerVisibility[layer]));
            } else {
                object.visible(this.layerVisibility[layer]);
            }
            
            // Recalculate layout to maintain proper spacing
            this.recalculateLayout();
            this.stage.batchDraw();
        }
    }
    
    repositionLayers() {
        // Simply recalculate the layout with current visibility settings
        this.recalculateLayout();
        this.stage.batchDraw();
    }
    
    createTemplateObjectsFromForm() {
        // Get current form values
        const topTitleText = document.getElementById('top-title')?.value || 'Top Title';
        const mainTitleText = document.getElementById('main-title')?.value.toUpperCase() || 'MAIN TITLE\nTWO LINES';
        const subtitle1Text = document.getElementById('subtitle1')?.value || 'Subtitle 1';
        const subtitle2Text = document.getElementById('subtitle2')?.value || 'Subtitle 2';
        
        // Base Y position and spacing for vertical arrangement
        const baseY = 140;
        let currentY = baseY;
        
        // Create top icon using configurable system (will be positioned by base position system)
        if (this.layerVisibility.topIcon) {
            // Create using configurable system with temporary Y position
            this.createTopIconFromConfig(100); // Temporary position, will be corrected by base position system
            currentY += 90;
        }
        
        // Create top title (64px, bold, "Top Title")
        this.templateObjects.topTitle = new Konva.Text({
            x: 960,
            y: currentY + (topTitleHeight / 2),
            text: 'Top Title',
            fontSize: 64,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: 'bold', // Back to original Figma weight
            fill: '#FFFFFF',
            align: 'center',
            width: 1490, // 1920 - (215px * 2) = content width
            letterSpacing: 0, // Let the font's natural kerning work
            listening: true
        });
        // Center the text horizontally and vertically (using fixed width centering)
        this.templateObjects.topTitle.offsetX(745); // Center within 1490px width
        this.templateObjects.topTitle.offsetY(this.templateObjects.topTitle.height() / 2);
        this.contentLayer.add(this.templateObjects.topTitle);
        console.log(`Top title created at Y=${this.templateObjects.topTitle.y()}`);
        currentY += topTitleHeight + elementGap;
        
        // Create main title (dynamic font size, extra bold, uppercase, 2 lines with shadow)
        // Using mainTitleText from form data already declared at method start
        const dynamicFontSize = this.calculateDynamicMainTitleFontSize(mainTitleText);
        
        this.templateObjects.mainTitle = new Konva.Text({
            x: 960,
            y: currentY + (mainTitleHeight / 2),
            text: mainTitleText,
            fontSize: dynamicFontSize,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: '800', // Back to original Figma extra bold
            fill: '#FFFFFF',
            align: 'center',
            width: 1490, // 1920 - (215px * 2) = content width
            wrap: 'word', // Enable word wrapping
            letterSpacing: 0, // Let the font's natural kerning work
            lineHeight: 0.9,
            listening: true
        });
        
        console.log(`Main title created with dynamic font size: ${dynamicFontSize}px for "${mainTitleText.replace(/\n/g, ' ')}" (${mainTitleText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().length} chars)`);
        // Center the text horizontally and vertically (using fixed width centering)
        this.templateObjects.mainTitle.offsetX(745); // Center within 1490px width
        this.templateObjects.mainTitle.offsetY(this.templateObjects.mainTitle.height() / 2);
        this.contentLayer.add(this.templateObjects.mainTitle);
        console.log(`Main title created at Y=${this.templateObjects.mainTitle.y()}`);
        currentY += mainTitleHeight + elementGap;
        
        // Create subtitle 1 (75px, bold)
        this.templateObjects.subtitle1 = new Konva.Text({
            x: 960,
            y: currentY + (subtitle1Height / 2),
            text: 'Subtitle 1',
            fontSize: 75,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: 'bold', // Back to original Figma weight
            fill: '#FFFFFF',
            align: 'center',
            width: 1490, // 1920 - (215px * 2) = content width
            letterSpacing: 0, // Let the font's natural kerning work
            listening: true
        });
        // Center the text horizontally and vertically (using fixed width centering)
        this.templateObjects.subtitle1.offsetX(745); // Center within 1490px width
        this.templateObjects.subtitle1.offsetY(this.templateObjects.subtitle1.height() / 2);
        this.contentLayer.add(this.templateObjects.subtitle1);
        console.log(`Subtitle 1 created at Y=${this.templateObjects.subtitle1.y()}`);
        currentY += subtitle1Height + elementGap;
        
        // Create subtitle 2 (40px, regular)
        this.templateObjects.subtitle2 = new Konva.Text({
            x: 960,
            y: currentY + (subtitle2Height / 2),
            text: 'Subtitle 2',
            fontSize: 40,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: 'normal', // Back to original Figma weight
            fill: '#FFFFFF',
            align: 'center',
            width: 1490, // 1920 - (215px * 2) = content width
            letterSpacing: 0, // Let the font's natural kerning work
            listening: true
        });
        // Center the text horizontally and vertically (using fixed width centering)
        this.templateObjects.subtitle2.offsetX(745); // Center within 1490px width
        this.templateObjects.subtitle2.offsetY(this.templateObjects.subtitle2.height() / 2);
        this.contentLayer.add(this.templateObjects.subtitle2);
        console.log(`Subtitle 2 created at Y=${this.templateObjects.subtitle2.y()}`);
        currentY += subtitle2Height + elementGap;
        
        // Store the bottom icons Y position for the createBottomIconsExact method
        this.bottomIconsY = currentY + (bottomIconHeight / 2);
        
        // Create bottom icons (4 icons spaced 260px apart)
        this.createBottomIconsExact();
        
        // Skip setting initial hidden positions - let icons stay visible
        // this.setInitialPositions(); // COMMENTED OUT to prevent hiding icons
        
        // Initialize text-based visibility
        this.initializeTextVisibility();
        
        // Recalculate layout with actual text heights
        this.recalculateLayout();
        
        // Initial render
        this.stage.batchDraw();
        console.log('Template objects creation complete - matches Figma design');
        
        // EMERGENCY: Force icons visible immediately after creation
        setTimeout(() => {
            console.log('🚨 Emergency icon visibility check in createTemplateObjectsFromForm...');
            this.forceIconsVisible();
        }, 100);
    }
    
    updateIconSlots() {
        const iconSlotsContainer = document.querySelector('.icon-slots');
        if (!iconSlotsContainer) return;
        
        // Clear existing slots
        iconSlotsContainer.innerHTML = '';
        
        // Create the required number of icon slots dynamically
        for (let i = 0; i < this.bottomIconsConfig.count; i++) {
            const iconSlot = this.createIconSlot(i);
            iconSlotsContainer.appendChild(iconSlot);
        }
        
        console.log(`Created ${this.bottomIconsConfig.count} icon configuration slots`);
    }
    
    createIconSlot(slotIndex) {
        const iconConfig = this.bottomIconsConfig.icons[slotIndex];
        const currentIconType = iconConfig ? iconConfig.type : 'circle';
        
        const slot = document.createElement('div');
        slot.className = 'icon-slot active';
        slot.setAttribute('data-slot', slotIndex);
        
        slot.innerHTML = `
            <div class="slot-header">
                <span class="slot-number">${slotIndex + 1}</span>
                <button class="remove-icon" aria-label="Remove icon">×</button>
            </div>
            <div class="icon-picker">
                <div class="current-icon">
                    ${this.getIconSVG(currentIconType, '24')}
                </div>
                <div class="icon-options">
                    <button class="icon-option ${currentIconType === 'star' ? 'active' : ''}" data-icon="star">
                        ${this.getIconSVG('star', '16')}
                    </button>
                    <button class="icon-option ${currentIconType === 'circle' ? 'active' : ''}" data-icon="circle">
                        ${this.getIconSVG('circle', '16')}
                    </button>
                    <button class="icon-option ${currentIconType === 'arrow' ? 'active' : ''}" data-icon="arrow">
                        ${this.getIconSVG('arrow', '16')}
                    </button>
                    <button class="icon-option ${currentIconType === 'heart' ? 'active' : ''}" data-icon="heart">
                        ${this.getIconSVG('heart', '16')}
                    </button>
                    <button class="icon-option ${currentIconType === 'diamond' ? 'active' : ''}" data-icon="diamond">
                        ${this.getIconSVG('diamond', '16')}
                    </button>
                    <button class="icon-option ${currentIconType === 'triangle' ? 'active' : ''}" data-icon="triangle">
                        ${this.getIconSVG('triangle', '16')}
                    </button>
                </div>
            </div>
        `;
        
        return slot;
    }
    
    getIconSVG(iconType, size) {
        const svgSize = size || '16';
        
        switch (iconType) {
            case 'star':
                return `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L10.06 5.51L15 6L11.5 9.5L12.12 14.5L8 12.51L3.88 14.5L4.5 9.5L1 6L5.94 5.51L8 1Z" fill="currentColor"/>
                </svg>`;
            case 'circle':
                return `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                </svg>`;
            case 'arrow':
                return `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
            case 'heart':
                return `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="none">
                    <path d="M13.89 3.07A3.67 3.67 0 0 0 11 1.35A3.67 3.67 0 0 0 8 3.97A3.67 3.67 0 0 0 5 1.35A3.67 3.67 0 0 0 2.11 3.07C1.39 5.23 3.19 8.65 8 12.79C12.81 8.65 14.61 5.23 13.89 3.07Z" fill="currentColor"/>
                </svg>`;
            case 'diamond':
                return `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L14 6L8 15L2 6L8 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>`;
            case 'triangle':
                return `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L14 14H2L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>`;
            default:
                return `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                </svg>`;
        }
    }
    
    updateTopIcon(iconType) {
        if (!this.templateObjects.topIcon) return;
        
        if (iconType === 'uploaded' && this.uploadedIcons.top) {
            this.updateTopIconWithUpload(this.uploadedIcons.top);
        } else {
            // Handle preset icons
            this.updateTopIconWithPreset(iconType);
        }
        
        console.log(`Top icon updated to: ${iconType}`);
    }
    
    updateTopIconWithUpload(iconData) {
        if (!iconData || !this.templateObjects.topIcon) return;
        
        // Remove existing top icon
        this.templateObjects.topIcon.destroy();
        
        if (iconData.type === 'image/svg+xml') {
            this.createSVGTopIcon(iconData);
        } else {
            this.createImageTopIcon(iconData);
        }
    }
    
    updateTopIconWithPreset(iconType) {
        if (!this.templateObjects.topIcon) return;
        
        // Remove existing top icon
        this.templateObjects.topIcon.destroy();
        
        // Create new preset icon
        this.createPresetTopIcon(iconType);
    }
    
    createSVGTopIcon(iconData) {
        // For SVG icons, we'll create a Konva.Image from the SVG data
        const img = new Image();
        img.onload = () => {
            // Use base position system if available, otherwise use default Y
            let iconY = 200;
            if (this.positionStates.base && this.positionStates.base.topIcon) {
                iconY = this.positionStates.base.topIcon.y;
            }
            
            this.templateObjects.topIcon = new Konva.Image({
                x: 960,
                y: iconY,
                image: img,
                width: 56,
                height: 56,
                offsetX: 28,
                offsetY: 28,
                listening: true
            });
            
            // Apply current text color to icon
            const currentTextColor = this.getCurrentTextColor();
            this.applyColorToSVGIcon(this.templateObjects.topIcon, currentTextColor);
            
            this.contentLayer.add(this.templateObjects.topIcon);
            this.stage.batchDraw();
            this.updateGSAPTimeline();
        };
        img.src = iconData.data;
    }
    
    createImageTopIcon(iconData) {
        // For PNG/GIF icons
        const img = new Image();
        img.onload = () => {
            // Use base position system if available, otherwise use default Y
            let iconY = 200;
            if (this.positionStates.base && this.positionStates.base.topIcon) {
                iconY = this.positionStates.base.topIcon.y;
            }
            
            this.templateObjects.topIcon = new Konva.Image({
                x: 960,
                y: iconY,
                image: img,
                width: 56,
                height: 56,
                offsetX: 28,
                offsetY: 28,
                listening: true
            });
            
            this.contentLayer.add(this.templateObjects.topIcon);
            this.stage.batchDraw();
            this.updateGSAPTimeline();
        };
        img.src = iconData.data;
    }
    
    createPresetTopIcon(iconType) {
        // Create preset icons using Konva shapes
        let icon;
        const currentTextColor = this.getCurrentTextColor();
        
        // Use base position system if available, otherwise use default Y
        let iconY = 200;
        if (this.positionStates.base && this.positionStates.base.topIcon) {
            iconY = this.positionStates.base.topIcon.y;
        }
        
        switch (iconType) {
            case 'circle':
                icon = new Konva.Circle({
                    x: 960,
                    y: iconY,
                    radius: 28,
                    stroke: currentTextColor,
                    strokeWidth: 2,
                    listening: true
                });
                break;
            case 'star':
                icon = new Konva.Star({
                    x: 960,
                    y: iconY,
                    numPoints: 5,
                    innerRadius: 16,
                    outerRadius: 28,
                    fill: currentTextColor,
                    listening: true
                });
                break;
            case 'heart':
                // Create a heart shape using path
                icon = new Konva.Path({
                    x: 960,
                    y: iconY,
                    data: 'M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z',
                    fill: currentTextColor,
                    scaleX: 2,
                    scaleY: 2,
                    offsetX: 12,
                    offsetY: 12,
                    listening: true
                });
                break;
            default:
                // Default ellipse
                icon = new Konva.Ellipse({
                    x: 960,
                    y: iconY,
                    radiusX: 35,
                    radiusY: 28,
                    stroke: currentTextColor,
                    strokeWidth: 2,
                    listening: true
                });
        }
        
        this.templateObjects.topIcon = icon;
        this.contentLayer.add(this.templateObjects.topIcon);
        this.stage.batchDraw();
        this.updateGSAPTimeline();
    }
    
    updateBottomIconWithUpload(iconData, slotIndex) {
        if (!iconData || slotIndex >= this.templateObjects.bottomIcons.length) return;
        
        // Remove existing icon at this slot
        if (this.templateObjects.bottomIcons[slotIndex]) {
            this.templateObjects.bottomIcons[slotIndex].destroy();
        }
        
        if (iconData.type === 'image/svg+xml') {
            this.createSVGBottomIcon(iconData, slotIndex);
        } else {
            this.createImageBottomIcon(iconData, slotIndex);
        }
    }
    
    createSVGBottomIcon(iconData, slotIndex) {
        const img = new Image();
        img.onload = () => {
            const iconPositions = this.calculateIconPositions(this.bottomIconsConfig.count);
            let iconY = this.bottomIconsY || 820;
            
            // Use dynamic position from base position system if available
            if (this.positionStates.base && this.positionStates.base.bottomIcons) {
                iconY = this.positionStates.base.bottomIcons.y;
            }
            
            const icon = new Konva.Image({
                x: iconPositions[slotIndex],
                y: iconY,
                image: img,
                width: 40,
                height: 40,
                offsetX: 20,
                offsetY: 20,
                listening: true
            });
            
            // Apply current text color to icon
            const currentTextColor = this.getCurrentTextColor();
            this.applyColorToSVGIcon(icon, currentTextColor);
            
            this.templateObjects.bottomIcons[slotIndex] = icon;
            this.contentLayer.add(icon);
            this.stage.batchDraw();
            this.updateGSAPTimeline();
        };
        img.src = iconData.data;
    }
    
    createImageBottomIcon(iconData, slotIndex) {
        const img = new Image();
        img.onload = () => {
            const iconPositions = this.calculateIconPositions(this.bottomIconsConfig.count);
            let iconY = this.bottomIconsY || 820;
            
            // Use dynamic position from base position system if available
            if (this.positionStates.base && this.positionStates.base.bottomIcons) {
                iconY = this.positionStates.base.bottomIcons.y;
            }
            
            const icon = new Konva.Image({
                x: iconPositions[slotIndex],
                y: iconY,
                image: img,
                width: 40,
                height: 40,
                offsetX: 20,
                offsetY: 20,
                listening: true
            });
            
            this.templateObjects.bottomIcons[slotIndex] = icon;
            this.contentLayer.add(icon);
            this.stage.batchDraw();
            this.updateGSAPTimeline();
        };
        img.src = iconData.data;
    }
    
    getCurrentTextColor() {
        // Get the current text color from the active color swatch or default to white
        const activeColorSwatch = document.querySelector('.color-group:first-child .color-swatch.active');
        return activeColorSwatch ? activeColorSwatch.dataset.color : '#FFFFFF';
    }
    
    createTopIconFromConfig(y) {
        const currentTextColor = this.getCurrentTextColor();
        const iconType = this.topIconConfig.type;
        
        // Use base position system if available, otherwise use provided Y
        let iconY = y;
        if (this.positionStates.base && this.positionStates.base.topIcon) {
            iconY = this.positionStates.base.topIcon.y;
            console.log(`🎯 Using dynamic Y position from base position system: ${iconY}`);
        } else {
            console.log(`⚠️ Using provided Y position: ${iconY}`);
        }
        
        this.templateObjects.topIcon = this.createIconShape(iconType, 960, iconY, 28, currentTextColor);
        
        // Ensure icon is visible by default
        this.templateObjects.topIcon.opacity(1);
        this.templateObjects.topIcon.visible(true);
        
        this.contentLayer.add(this.templateObjects.topIcon);
        console.log(`✅ Top icon created and set to visible at Y=${iconY}`);
    }
    
    createBottomIcon(iconType, x, y, color) {
        return this.createIconShape(iconType, x, y, 20, color);
    }
    
    createIconShape(type, x, y, size, color) {
        switch (type) {
            case 'star':
                return new Konva.Star({
                    x: x,
                    y: y,
                    numPoints: 5,
                    innerRadius: size * 0.6,
                    outerRadius: size,
                    fill: color,
                    listening: true
                });
            case 'circle':
                return new Konva.Circle({
                    x: x,
                    y: y,
                    radius: size,
                    stroke: color,
                    strokeWidth: 2,
                    listening: true
                });
            case 'arrow':
                return new Konva.RegularPolygon({
                    x: x,
                    y: y,
                    sides: 3,
                    radius: size,
                    fill: color,
                    rotation: 90,
                    listening: true
                });
            case 'heart':
                return new Konva.Path({
                    x: x,
                    y: y,
                    data: 'M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z',
                    fill: color,
                    scaleX: size / 24,
                    scaleY: size / 24,
                    offsetX: 12,
                    offsetY: 12,
                    listening: true
                });
            case 'diamond':
                return new Konva.RegularPolygon({
                    x: x,
                    y: y,
                    sides: 4,
                    radius: size,
                    fill: color,
                    rotation: 45,
                    listening: true
                });
            case 'triangle':
                return new Konva.RegularPolygon({
                    x: x,
                    y: y,
                    sides: 3,
                    radius: size,
                    fill: color,
                    listening: true
                });
            default:
                return new Konva.Circle({
                    x: x,
                    y: y,
                    radius: size,
                    stroke: color,
                    strokeWidth: 2,
                    listening: true
                });
        }
    }
    
    applyColorToSVGIcon(iconKonvaObject, color) {
        // Apply CSS filters to colorize SVG icons properly
        // This method works with Konva.Image objects that contain SVG data
        if (!iconKonvaObject) return;
        
        console.log('🎨 Applying color to SVG icon:', color);
        
        try {
            // Convert hex color to RGB for filter calculations
            const rgb = this.hexToRgb(color);
            if (!rgb) {
                console.warn('Invalid color format:', color);
                return;
            }
            
            // Create CSS filter that converts black SVG to desired color
            // This works for both stroke and fill based SVGs
            const filter = this.createColorFilter(rgb);
            
            // Apply the filter to the Konva image object
            iconKonvaObject.filters([Konva.Filters.CSS]);
            iconKonvaObject.cssFilter(filter);
            
            console.log('✅ Color filter applied:', filter);
            
        } catch (error) {
            console.error('❌ Failed to apply color to SVG icon:', error);
        }
    }
    
    // Helper method to convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // Method to directly colorize SVG content before rendering
    colorizeReferenceSVG(svgContent, color) {
        try {
            console.log('🎨 Colorizing SVG with color:', color);
            
            // Replace black strokes and fills with the desired color
            let colorizedSVG = svgContent
                // Replace stroke="black" with desired color
                .replace(/stroke="black"/g, `stroke="${color}"`)
                // Replace fill="black" with desired color  
                .replace(/fill="black"/g, `fill="${color}"`)
                // Replace stroke="#000000" with desired color
                .replace(/stroke="#000000"/g, `stroke="${color}"`)
                // Replace fill="#000000" with desired color
                .replace(/fill="#000000"/g, `fill="${color}"`)
                // Replace stroke="#000" with desired color
                .replace(/stroke="#000"/g, `stroke="${color}"`)
                // Replace fill="#000" with desired color
                .replace(/fill="#000"/g, `fill="${color}"`);
            
            console.log('🔄 SVG color replacements completed');
            return colorizedSVG;
            
        } catch (error) {
            console.error('❌ Failed to colorize SVG:', error);
            return svgContent; // Return original if colorization fails
        }
    }
    
    // Helper method to create CSS filter for colorizing black SVGs (backup method)
    createColorFilter(rgb) {
        // Convert RGB values to 0-1 range
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        
        // For white (#FFFFFF), use a simple invert
        if (rgb.r === 255 && rgb.g === 255 && rgb.b === 255) {
            return 'invert(1) brightness(1)';
        }
        
        // For other colors, calculate appropriate filter values
        const brightness = Math.max(r, g, b);
        const saturation = brightness > 0 ? 1 - Math.min(r, g, b) / brightness : 0;
        
        // Calculate hue (simplified)
        let hue = 0;
        if (brightness > 0) {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            
            if (delta > 0) {
                if (max === r) {
                    hue = ((g - b) / delta) % 6;
                } else if (max === g) {
                    hue = (b - r) / delta + 2;
                } else {
                    hue = (r - g) / delta + 4;
                }
                hue = Math.round(hue * 60);
                if (hue < 0) hue += 360;
            }
        }
        
        return `invert(1) sepia(1) saturate(${Math.round(saturation * 500)}%) hue-rotate(${hue}deg) brightness(${brightness})`;
    }
    

    
    updateFont(property, value) {
        if (property === 'family') {
            if (this.templateObjects.topTitle) this.templateObjects.topTitle.fontFamily(value);
            if (this.templateObjects.mainTitle) this.templateObjects.mainTitle.fontFamily(value);
            if (this.templateObjects.subtitle1) this.templateObjects.subtitle1.fontFamily(value);
            if (this.templateObjects.subtitle2) this.templateObjects.subtitle2.fontFamily(value);
        }
        // Note: Weight and size are now handled individually per text element through the form controls
        
        this.updateTemplateProperties();
        
        console.log(`Updated font ${property}: ${value}`);
    }

    removeMainTitleShadow() {
        if (this.templateObjects.mainTitle) {
            // Remove all shadow properties from the main title
            this.templateObjects.mainTitle.shadowColor(null);
            this.templateObjects.mainTitle.shadowBlur(0);
            this.templateObjects.mainTitle.shadowOffset({ x: 0, y: 0 });
            console.log('Main title shadow removed');
        }
    }
    
    updateColor(type, color) {
        if (type === 'Text Color') {
            if (this.templateObjects.topTitle) this.templateObjects.topTitle.fill(color);
            if (this.templateObjects.mainTitle) {
                this.templateObjects.mainTitle.fill(color);
                // Remove shadow if it exists
                this.removeMainTitleShadow();
            }
            if (this.templateObjects.subtitle1) this.templateObjects.subtitle1.fill(color);
            if (this.templateObjects.subtitle2) this.templateObjects.subtitle2.fill(color);
            // Update top icon color to inherit text color
            if (this.templateObjects.topIcon) {
                // If the icon came from gallery, recreate it with new color
                if (this.currentTopIconData) {
                    console.log('🔄 Recreating top icon from gallery with new color:', color);
                    this.updateTopIconFromGallery(this.currentTopIconData);
                } else {
                    // For other icons, apply color filter
                    this.applyColorToSVGIcon(this.templateObjects.topIcon, color);
                }
            }
            // Update bottom icons color to inherit text color
            this.templateObjects.bottomIcons.forEach((icon, index) => {
                if (icon) {
                    // If the icon came from gallery, recreate it with new color
                    if (this.currentBottomIconsData && this.currentBottomIconsData[index]) {
                        console.log(`🔄 Recreating bottom icon ${index + 1} from gallery with new color:`, color);
                        this.updateBottomIconFromGallery(this.currentBottomIconsData[index], index);
                    } else {
                        // For other icons, apply direct color changes
                        if (icon.fill) icon.fill(color);
                        if (icon.stroke) icon.stroke(color);
                    }
                }
            });
            // Ensure stage is redrawn with new colors
            this.stage.batchDraw();
        } else if (type === 'Background Color') {
            if (color === 'transparent') {
                // Set transparency mode
                this.setBackgroundTransparency(true);
            } else {
                // Set background color mode
                this.setBackgroundTransparency(false);
                this.currentBackgroundColor = color;
                if (this.templateObjects.background) {
                    this.templateObjects.background.fill(color);
                }
            }
            
            // Refresh timeline to current position without disrupting animation
            this.refreshTimelinePosition();
        }
        
        this.updateTemplateProperties();
        
        console.log(`Updated ${type}: ${color}`);
    }
    
    setBackgroundTransparency(isTransparent) {
        const canvasContainer = document.getElementById('canvas-container');
        const konvaContainer = document.getElementById('konva-container');
        
        // Store the current state
        this.isTransparent = isTransparent;
        
        if (isTransparent) {
            // Set background to be invisible for export/animation
            if (this.templateObjects.background) {
                this.templateObjects.background.visible(false);
            }
            
            // Make canvas transparent and show checkerboard immediately
            konvaContainer.style.backgroundColor = 'transparent';
            canvasContainer.classList.add('transparency-preview');
            
            // Force immediate redraw to apply changes
            this.stage.batchDraw();
            
        } else {
            // Set background to be visible for export/animation
            if (this.templateObjects.background) {
                this.templateObjects.background.visible(true);
            }
            
            // Restore canvas background and hide checkerboard immediately
            konvaContainer.style.backgroundColor = '';
            canvasContainer.classList.remove('transparency-preview');
            
            // Force immediate redraw to apply changes
            this.stage.batchDraw();
        }
        
        console.log(`Background transparency: ${isTransparent ? 'enabled' : 'disabled'}`);
    }
    
    refreshTimelinePosition() {
        if (this.timeline) {
            // Get current timeline progress
            const currentProgress = this.timeline.progress();
            const currentTime = this.timeline.time();
            
            // Only redraw if not currently playing
            if (!this.isPlaying) {
                this.stage.batchDraw();
            }
            
            // Maintain current position without disrupting playback
            if (this.isPlaying) {
                // Let the animation continue naturally
                return;
            } else {
                // Update to current frame position
                this.timeline.progress(currentProgress);
                this.stage.batchDraw();
            }
        }
    }
    
    setupZoomControls() {
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const fitBtn = document.getElementById('fit-to-screen');
        const zoomSelect = document.querySelector('.zoom-select');
        
        zoomInBtn.addEventListener('click', () => this.zoomIn());
        zoomOutBtn.addEventListener('click', () => this.zoomOut());
        fitBtn.addEventListener('click', () => this.fitToScreen());
        
        // Mouse wheel zoom
        const canvasContainer = document.getElementById('canvas-container');
        canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -10 : 10;
            this.setZoom(this.zoomLevel + delta);
        }, { passive: false });
    }
    
    setupCanvasPanning() {
        const canvasContainer = document.getElementById('canvas-container');
        const canvasWrapper = document.getElementById('canvas-wrapper');
        
        canvasContainer.addEventListener('mousedown', (e) => {
            // Only enable panning when zoomed and not clicking on a Konva object
            if (this.zoomLevel > 100 && e.target === canvasContainer) {
                this.isDragging = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                canvasContainer.classList.add('zoomed');
                e.preventDefault();
            }
        });
        
        // Also handle mousedown on canvas wrapper but not on Konva canvas itself
        canvasWrapper.addEventListener('mousedown', (e) => {
            // Check if click is on the wrapper but not on Konva canvas content
            if (this.zoomLevel > 100 && (e.target === canvasWrapper || e.target === canvasContainer)) {
                this.isDragging = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                canvasContainer.classList.add('zoomed');
                e.preventDefault();
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.zoomLevel > 100) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                
                this.panX += deltaX;
                this.panY += deltaY;
                
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                
                this.updateCanvasTransform();
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                canvasContainer.classList.remove('zoomed');
            }
        });
    }
    
    zoomIn() {
        const newZoom = Math.min(this.maxZoom, this.zoomLevel + 25);
        this.setZoom(newZoom);
    }
    
    zoomOut() {
        const newZoom = Math.max(this.minZoom, this.zoomLevel - 25);
        this.setZoom(newZoom);
    }
    
    setZoom(zoomLevel) {
        this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, zoomLevel));
        
        // Update zoom select
        const zoomSelect = document.querySelector('.zoom-select');
        
        // Check if the exact zoom level exists as an option
        const exactOption = zoomSelect.querySelector(`option[value="${this.zoomLevel}"]`);
        
        if (exactOption) {
            // Exact match exists, select it
            zoomSelect.value = this.zoomLevel.toString();
        } else {
            // No exact match - this happens with custom zoom levels from fitToScreen
            // Find the closest option or indicate it's a custom zoom
            const options = Array.from(zoomSelect.options).map(opt => parseInt(opt.value));
            const closest = options.reduce((prev, curr) => 
                Math.abs(curr - this.zoomLevel) < Math.abs(prev - this.zoomLevel) ? curr : prev
            );
            
            // For now, select the closest option but we could also show custom text
            zoomSelect.value = closest.toString();
            console.log(`Custom zoom ${this.zoomLevel}% - selected closest option ${closest}%`);
        }
        
        // Update button states
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        
        zoomInBtn.disabled = this.zoomLevel >= this.maxZoom;
        zoomOutBtn.disabled = this.zoomLevel <= this.minZoom;
        
        // Reset pan when zooming out to or below 100%
        if (this.zoomLevel <= 100) {
            this.panX = 0;
            this.panY = 0;
        }
        
        // Ensure Konva stage always stays at 1:1 scale
        if (this.stage) {
            this.stage.scale({ x: 1, y: 1 });
            this.stage.position({ x: 0, y: 0 });
        }
        
        this.updateCanvasTransform();
        console.log(`Zoom updated to: ${this.zoomLevel}%`);
    }
    
    initializeZoom() {
        // Ensure Konva stage is at 1:1 scale and centered
        if (this.stage) {
            this.stage.scale({ x: 1, y: 1 });
            this.stage.position({ x: 0, y: 0 });
            this.stage.batchDraw();
        }
        
        // Set initial zoom transform (only affects CSS)
        this.updateCanvasTransform();
        
        // Update button states
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        
        if (zoomInBtn && zoomOutBtn) {
            zoomInBtn.disabled = this.zoomLevel >= this.maxZoom;
            zoomOutBtn.disabled = this.zoomLevel <= this.minZoom;
        }
    }
    
    fitToScreen() {
        const container = document.getElementById('canvas-container');
        if (!container) {
            console.error('Canvas container not found!');
            return;
        }
        
        const containerRect = container.getBoundingClientRect();
        console.log('Container dimensions:', containerRect.width, 'x', containerRect.height);
        
        // Account for padding and borders
        const availableWidth = containerRect.width - 40; // 20px padding on each side
        const availableHeight = containerRect.height - 40;
        console.log('Available space:', availableWidth, 'x', availableHeight);
        
        // Calculate scale to fit canvas in container
        const scaleX = availableWidth / 1920;
        const scaleY = availableHeight / 1080;
        const scale = Math.min(scaleX, scaleY);
        console.log('Scale calculations - X:', scaleX, 'Y:', scaleY, 'Final:', scale);
        
        // Convert to percentage and ensure it's within bounds
        const fitZoom = Math.max(this.minZoom, Math.min(this.maxZoom, Math.round(scale * 100)));
        
        // Reset pan position
        this.panX = 0;
        this.panY = 0;
        
        console.log(`Setting zoom from ${this.zoomLevel}% to fit zoom: ${fitZoom}%`);
        this.setZoom(fitZoom);
        console.log(`Fit to screen complete: ${fitZoom}%`);
    }
    
    updateCanvasTransform() {
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const container = document.getElementById('canvas-container');
        
        const scale = this.zoomLevel / 100;
        
        // Calculate canvas dimensions at current zoom
        const scaledWidth = 1920 * scale;
        const scaledHeight = 1080 * scale;
        
        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        
        // Constrain pan to keep canvas visible
        const maxPanX = Math.max(0, (scaledWidth - containerRect.width) / 2);
        const maxPanY = Math.max(0, (scaledHeight - containerRect.height) / 2);
        
        this.panX = Math.max(-maxPanX, Math.min(maxPanX, this.panX));
        this.panY = Math.max(-maxPanY, Math.min(maxPanY, this.panY));
        
        // ONLY apply transform to wrapper - NOT to Konva stage
        // This keeps the Konva coordinate system intact (1920x1080)
        // while only affecting the visual preview
        canvasWrapper.style.transform = `scale(${scale}) translate(${this.panX / scale}px, ${this.panY / scale}px)`;
        
        // Update container class for cursor styling
        if (this.zoomLevel > 100) {
            container.classList.add('zoomed');
        } else {
            container.classList.remove('zoomed');
        }
    }
    
    // Playback Controls
    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        
        const playIcons = document.querySelectorAll('.play-icon');
        const pauseIcons = document.querySelectorAll('.pause-icon');
        
        playIcons.forEach(icon => icon.classList.toggle('hidden', this.isPlaying));
        pauseIcons.forEach(icon => icon.classList.toggle('hidden', !this.isPlaying));
        
        if (this.isPlaying) {
            this.startGSAPPlayback();
        } else {
            this.stopGSAPPlayback();
        }
        
        console.log(`GSAP Playback ${this.isPlaying ? 'started' : 'stopped'}`);
    }
    
    startGSAPPlayback() {
        if (this.timeline) {
            // If at the end, restart from beginning
            if (this.timeline.progress() >= 1) {
                this.timeline.restart();
            } else {
                this.timeline.play();
            }
            
            // Update timeline position during playback
            this.updateTimelinePosition();
        }
    }
    
    stopGSAPPlayback() {
        if (this.timeline) {
            this.timeline.pause();
        }
        
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
    }
    
    updateTimelinePosition() {
        this.playbackInterval = setInterval(() => {
            if (!this.timeline || !this.isPlaying) return;
            
            const progress = this.timeline.progress();
            const currentTime = this.timeline.time();
            
            // Convert GSAP time to frame number
            this.currentFrame = Math.floor((currentTime / this.animationDuration) * this.totalFrames);
            
            // Update UI
            this.updatePlayheadPosition(progress * 100);
            this.updateFrameDisplay();
            this.stage.batchDraw();
            
            // Check if animation completed
            if (progress >= 1) {
                this.isPlaying = false;
                
                const playIcons = document.querySelectorAll('.play-icon');
                const pauseIcons = document.querySelectorAll('.pause-icon');
                
                playIcons.forEach(icon => icon.classList.remove('hidden'));
                pauseIcons.forEach(icon => icon.classList.add('hidden'));
                
                this.stopGSAPPlayback();
                console.log('GSAP Animation completed');
            }
        }, 1000 / this.fps);
    }
    
    previousFrame() {
        this.currentFrame = Math.max(0, this.currentFrame - 1);
        this.seekToFrame(this.currentFrame);
    }
    
    nextFrame() {
        this.currentFrame = Math.min(this.totalFrames - 1, this.currentFrame + 1);
        this.seekToFrame(this.currentFrame);
    }
    
    goToBeginning() {
        this.currentFrame = 0;
        this.seekToFrame(this.currentFrame);
    }
    
    goToEnd() {
        this.currentFrame = this.totalFrames - 1;
        this.seekToFrame(this.currentFrame);
    }
    
    seekToFrame(frameNumber) {
        this.currentFrame = frameNumber;
        
        // Convert frame to GSAP timeline time
        const timelineTime = (frameNumber / this.totalFrames) * this.animationDuration;
        
        // Seek GSAP timeline to specific time
        if (this.timeline) {
            this.timeline.seek(timelineTime);
            this.stage.batchDraw();
        }
        
        // Update UI
        this.updatePlayheadPosition((frameNumber / this.totalFrames) * 100);
        this.updateFrameDisplay();
    }
    
    // Timeline Updates
    updatePlayheadPosition(percentage) {
        const playhead = document.querySelector('.playhead');
        playhead.style.left = `${percentage}%`;
    }
    
    updateFrameDisplay() {
        const currentFrameDisplay = document.querySelector('.current-frame');
        const timeDisplay = document.querySelector('.time-display');
        
        const frameNumber = String(this.currentFrame + 1).padStart(3, '0');
        const seconds = this.currentFrame / this.fps;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        const frames = Math.floor((seconds % 1) * this.fps);
        
        currentFrameDisplay.textContent = `Frame: ${frameNumber}`;
        timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}:${String(Math.floor(seconds)).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
    }
    
    createTemplateObjects() {
        console.log('Creating template objects to match Figma design...');
        
        // Create background (black)
        this.templateObjects.background = new Konva.Rect({
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            fill: '#000000'
        });
        this.backgroundLayer.add(this.templateObjects.background);
        console.log('Background created');
        
        // Calculate total height and center the design vertically
        const canvasHeight = 1080;
        const elementGap = 26;
        
        // Calculate heights of all elements (will be recalculated dynamically later)
        const topIconHeight = 58; // (radiusY * 2)
        const topTitleHeight = 64; // Approximate, will be updated after text creation
        const mainTitleHeight = 180; // Single line initially, will be updated after text creation
        const subtitle1Height = 75; // Approximate, will be updated after text creation
        const subtitle2Height = 40; // Approximate, will be updated after text creation
        const bottomIconHeight = 57;
        
        // Calculate initial design height (will be recalculated after objects are created)
        const totalHeight = topIconHeight + topTitleHeight + mainTitleHeight + subtitle1Height + subtitle2Height + bottomIconHeight + (elementGap * 5);
        
        // Start Y position to center the entire design
        let currentY = (canvasHeight - totalHeight) / 2;
        
        console.log(`Centering design: total height ${totalHeight}px, starting at Y=${currentY}`);
        
        // Create top icon using configurable system
        if (this.layerVisibility.topIcon) {
            this.createTopIconFromConfig(currentY + (topIconHeight / 2));
            console.log(`Top icon created at Y=${this.templateObjects.topIcon.y()}`);
            currentY += topIconHeight + elementGap;
        }
        
        // Create top title (64px, bold, "Top Title")
        this.templateObjects.topTitle = new Konva.Text({
            x: 960,
            y: currentY + (topTitleHeight / 2),
            text: 'Top Title',
            fontSize: 64,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: 'bold', // Back to original Figma weight
            fill: '#FFFFFF',
            align: 'center',
            width: 1490, // 1920 - (215px * 2) = content width
            letterSpacing: 0, // Let the font's natural kerning work
            listening: true
        });
        // Center the text horizontally and vertically (using fixed width centering)
        this.templateObjects.topTitle.offsetX(745); // Center within 1490px width
        this.templateObjects.topTitle.offsetY(this.templateObjects.topTitle.height() / 2);
        this.contentLayer.add(this.templateObjects.topTitle);
        console.log(`Top title created at Y=${this.templateObjects.topTitle.y()}`);
        currentY += topTitleHeight + elementGap;
        
        // Create main title (dynamic font size, extra bold, uppercase, 2 lines with shadow)
        const defaultMainTitleText = 'MAIN TITLE\nTWO LINES';
        const dynamicFontSize = this.calculateDynamicMainTitleFontSize(defaultMainTitleText);
        
        this.templateObjects.mainTitle = new Konva.Text({
            x: 960,
            y: currentY + (mainTitleHeight / 2),
            text: defaultMainTitleText,
            fontSize: dynamicFontSize,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: '800', // Back to original Figma extra bold
            fill: '#FFFFFF',
            align: 'center',
            width: 1490, // 1920 - (215px * 2) = content width
            wrap: 'word', // Enable word wrapping
            letterSpacing: 0, // Let the font's natural kerning work
            lineHeight: 0.9,
            listening: true
        });
        
        console.log(`Main title created with dynamic font size: ${dynamicFontSize}px for "${defaultMainTitleText.replace(/\n/g, ' ')}" (${defaultMainTitleText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim().length} chars)`);
        // Center the text horizontally and vertically (using fixed width centering)
        this.templateObjects.mainTitle.offsetX(745); // Center within 1490px width
        this.templateObjects.mainTitle.offsetY(this.templateObjects.mainTitle.height() / 2);
        this.contentLayer.add(this.templateObjects.mainTitle);
        console.log(`Main title created at Y=${this.templateObjects.mainTitle.y()}`);
        currentY += mainTitleHeight + elementGap;
        
        // Create subtitle 1 (75px, bold)
        this.templateObjects.subtitle1 = new Konva.Text({
            x: 960,
            y: currentY + (subtitle1Height / 2),
            text: 'Subtitle 1',
            fontSize: 75,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: 'bold', // Back to original Figma weight
            fill: '#FFFFFF',
            align: 'center',
            width: 1490, // 1920 - (215px * 2) = content width
            letterSpacing: 0, // Let the font's natural kerning work
            listening: true
        });
        // Center the text horizontally and vertically (using fixed width centering)
        this.templateObjects.subtitle1.offsetX(745); // Center within 1490px width
        this.templateObjects.subtitle1.offsetY(this.templateObjects.subtitle1.height() / 2);
        this.contentLayer.add(this.templateObjects.subtitle1);
        console.log(`Subtitle 1 created at Y=${this.templateObjects.subtitle1.y()}`);
        currentY += subtitle1Height + elementGap;
        
        // Create subtitle 2 (40px, regular)
        this.templateObjects.subtitle2 = new Konva.Text({
            x: 960,
            y: currentY + (subtitle2Height / 2),
            text: 'Subtitle 2',
            fontSize: 40,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: 'normal', // Back to original Figma weight
            fill: '#FFFFFF',
            align: 'center',
            width: 1490, // 1920 - (215px * 2) = content width
            letterSpacing: 0, // Let the font's natural kerning work
            listening: true
        });
        // Center the text horizontally and vertically (using fixed width centering)
        this.templateObjects.subtitle2.offsetX(745); // Center within 1490px width
        this.templateObjects.subtitle2.offsetY(this.templateObjects.subtitle2.height() / 2);
        this.contentLayer.add(this.templateObjects.subtitle2);
        console.log(`Subtitle 2 created at Y=${this.templateObjects.subtitle2.y()}`);
        currentY += subtitle2Height + elementGap;
        
        // Store the bottom icons Y position for the createBottomIconsExact method
        this.bottomIconsY = currentY + (bottomIconHeight / 2);
        
        // Create bottom icons (4 icons spaced 260px apart)
        this.createBottomIconsExact();
        
        // Calculate base positions for animation system
        this.calculateBasePositions();
        
        // Skip setting initial hidden positions - let icons stay visible
        // this.setInitialPositions(); // COMMENTED OUT to prevent hiding icons
        
        // Initialize text-based visibility
        this.initializeTextVisibility();
        
        // Recalculate layout with actual text heights
        this.recalculateLayout();
        
        // Initial render
        this.stage.batchDraw();
        console.log('Template objects creation complete - matches Figma design');
        
        // EMERGENCY: Force icons visible immediately after creation
        setTimeout(() => {
            console.log('🚨 Emergency icon visibility check in createTemplateObjects...');
            this.forceIconsVisible();
        }, 100);
    }
    
    createBottomIconsExact() {
        // Clear existing bottom icons
        this.templateObjects.bottomIcons.forEach(icon => icon.destroy());
        this.templateObjects.bottomIcons = [];
        
        if (!this.layerVisibility.bottomIcons || this.bottomIconsConfig.count === 0) {
            return;
        }
        
        console.log('Creating bottom icons with proper spacing...');
        
        // Use the dynamically calculated Y position from base position system
        let iconY = this.bottomIconsY || 820; // Fallback value
        
        // If base positions are calculated, use the dynamic position
        if (this.positionStates.base && this.positionStates.base.bottomIcons) {
            iconY = this.positionStates.base.bottomIcons.y;
            console.log(`🎯 Using dynamic Y position from base position system: ${iconY}`);
        } else {
            console.log(`⚠️ Using fallback Y position: ${iconY}`);
        }
        
        // Get current text color for icons to inherit
        const currentTextColor = this.getCurrentTextColor();
        
        // Calculate dynamic positions based on main title width
        const iconPositions = this.calculateIconPositions(this.bottomIconsConfig.count);
        
        // Create icons based on configuration array
        for (let i = 0; i < this.bottomIconsConfig.count; i++) {
            const iconType = this.bottomIconsConfig.icons[i] || 'circle'; // Default to circle
            const icon = this.createBottomIcon(iconType, iconPositions[i], iconY, currentTextColor);
            
            if (icon) {
                // Ensure icon is visible by default
                icon.opacity(1);
                icon.visible(true);
                icon.scaleX(1);
                icon.scaleY(1);
                
                this.templateObjects.bottomIcons.push(icon);
                this.contentLayer.add(icon);
                console.log(`✅ Bottom icon ${i + 1} (${iconType}) created and set to visible at x:${iconPositions[i]}, y:${iconY}`);
            }
        }
        
        // Update GSAP timeline to include new icons (this will handle initial positions)
        this.updateGSAPTimeline();
    }
    
    calculateIconPositions(iconCount) {
        if (iconCount === 0) return [];
        
        // Get the width of the longest line in the main title
        const longestLineWidth = this.getMainTitleLongestLineWidth();
        
        // Calculate the start and end positions based on the longest line width
        const centerX = 960; // Canvas center
        const leftEdge = centerX - (longestLineWidth / 2);
        const rightEdge = centerX + (longestLineWidth / 2);
        
        console.log(`Distributing ${iconCount} icons across longest line width: ${longestLineWidth}px (${leftEdge} to ${rightEdge})`);
        
        if (iconCount === 1) {
            // Single icon at center
            return [centerX];
        } else if (iconCount === 2) {
            // Two icons at the edges
            return [leftEdge, rightEdge];
        } else {
            // Multiple icons evenly distributed
            const positions = [];
            const spacing = (rightEdge - leftEdge) / (iconCount - 1);
            
            for (let i = 0; i < iconCount; i++) {
                positions.push(leftEdge + (spacing * i));
            }
            
            return positions;
        }
    }
    
    getMainTitleLongestLineWidth() {
        if (!this.templateObjects.mainTitle || !this.templateObjects.mainTitle.visible()) {
            // If main title is not visible, use a default width
            return 800; // Default fallback width
        }
        
        const mainTitleText = this.templateObjects.mainTitle.text();
        const lines = mainTitleText.split('\n');
        
        // Get the current dynamic font size from the main title object
        const currentFontSize = this.templateObjects.mainTitle.fontSize();
        
        // Create a temporary text object to measure each line with proper kerning and current font size
        const tempText = new Konva.Text({
            fontSize: currentFontSize,
            fontFamily: '"Wix Madefor Display"',
            fontStyle: '800', // Back to original Figma extra bold
            letterSpacing: 0 // Let natural kerning work
        });
        
        let longestWidth = 0;
        
        lines.forEach(line => {
            tempText.text(line.trim());
            const lineWidth = tempText.width();
            if (lineWidth > longestWidth) {
                longestWidth = lineWidth;
            }
        });
        
        tempText.destroy();
        
        // Ensure minimum width for icon distribution
        return Math.max(longestWidth, 400);
    }
    
    createIconShape(type, x, y, size) {
        switch (type) {
            case 'star':
                return new Konva.Star({
                    x: x,
                    y: y,
                    numPoints: 5,
                    innerRadius: size * 0.4,
                    outerRadius: size * 0.7,
                    fill: '#FFFFFF'
                });
            case 'circle':
                return new Konva.Circle({
                    x: x,
                    y: y,
                    radius: size * 0.6,
                    stroke: '#FFFFFF',
                    strokeWidth: 2
                });
            case 'arrow':
                return new Konva.RegularPolygon({
                    x: x,
                    y: y,
                    sides: 3,
                    radius: size * 0.6,
                    fill: '#FFFFFF',
                    rotation: 90
                });
            case 'heart':
                // Create a heart shape using path
                return new Konva.Path({
                    x: x,
                    y: y,
                    data: 'M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z',
                    fill: '#FFFFFF',
                    scaleX: size / 50,
                    scaleY: size / 50,
                    offsetX: 12,
                    offsetY: 12
                });
            default:
                return new Konva.Circle({
                    x: x,
                    y: y,
                    radius: size * 0.6,
                    fill: '#FFFFFF'
                });
        }
    }
    
    setInitialPositions() {
        console.log('📥 Setting initial positions for animations using base position system...');
        
        // Use the base position system to set initial positions
        this.setElementsToInitialPositions();
        
        console.log('✅ Initial positions set for animations using base position system');
    }
    
    initializeTextVisibility() {
        // Set initial visibility based on text content
        const topTitleInput = document.getElementById('top-title');
        const mainTitleInput = document.getElementById('main-title');
        const subtitle1Input = document.getElementById('subtitle1');
        const subtitle2Input = document.getElementById('subtitle2');
        
        if (topTitleInput && this.templateObjects.topTitle) {
            const hasContent = topTitleInput.value && topTitleInput.value.trim().length > 0;
            this.layerVisibility.topTitle = hasContent;
            this.templateObjects.topTitle.visible(hasContent);
            console.log(`Top title initial visibility: ${hasContent}`);
        }
        
        if (mainTitleInput && this.templateObjects.mainTitle) {
            const hasContent = mainTitleInput.value && mainTitleInput.value.trim().length > 0;
            this.layerVisibility.mainTitle = hasContent;
            this.templateObjects.mainTitle.visible(hasContent);
            console.log(`Main title initial visibility: ${hasContent}`);
        }
        
        if (subtitle1Input && this.templateObjects.subtitle1) {
            const hasContent = subtitle1Input.value && subtitle1Input.value.trim().length > 0;
            this.layerVisibility.subtitle1 = hasContent;
            this.templateObjects.subtitle1.visible(hasContent);
            console.log(`Subtitle 1 initial visibility: ${hasContent}`);
        }
        
        if (subtitle2Input && this.templateObjects.subtitle2) {
            const hasContent = subtitle2Input.value && subtitle2Input.value.trim().length > 0;
            this.layerVisibility.subtitle2 = hasContent;
            this.templateObjects.subtitle2.visible(hasContent);
            console.log(`Subtitle 2 initial visibility: ${hasContent}`);
        }
    }
    
    updateTextCentering() {
        // Update text centering based on fixed width (215px margins = 1490px content width)
        const centerX = 745; // Half of 1490px content width
        
        if (this.templateObjects.topTitle) {
            this.templateObjects.topTitle.offsetX(centerX);
            this.templateObjects.topTitle.offsetY(this.templateObjects.topTitle.height() / 2);
        }
        
        if (this.templateObjects.mainTitle) {
            this.templateObjects.mainTitle.offsetX(centerX);
            this.templateObjects.mainTitle.offsetY(this.templateObjects.mainTitle.height() / 2);
        }
        
        if (this.templateObjects.subtitle1) {
            this.templateObjects.subtitle1.offsetX(centerX);
            this.templateObjects.subtitle1.offsetY(this.templateObjects.subtitle1.height() / 2);
        }
        
        if (this.templateObjects.subtitle2) {
            this.templateObjects.subtitle2.offsetX(centerX);
            this.templateObjects.subtitle2.offsetY(this.templateObjects.subtitle2.height() / 2);
        }
    }
    
    // ================================
    // BASE POSITION SYSTEM METHODS
    // ================================
    
    /**
     * Calculate base positions for all elements based on current layout
     * This creates the "resting" positions that elements animate to/from
     */
    calculateBasePositions() {
        console.log('🎯 Calculating base positions for animation system...');
        
        // Get current element heights for dynamic calculation
        const elementHeights = {
            topIcon: 58,
            topTitle: this.templateObjects.topTitle ? this.templateObjects.topTitle.height() : 64,
            mainTitle: this.templateObjects.mainTitle ? this.templateObjects.mainTitle.height() : 180,
            subtitle1: this.templateObjects.subtitle1 ? this.templateObjects.subtitle1.height() : 75,
            subtitle2: this.templateObjects.subtitle2 ? this.templateObjects.subtitle2.height() : 40,
            bottomIcons: 57
        };
        
        // Get list of visible elements for centering calculation
        const visibleElements = [];
        let totalHeight = 0;
        
        if (this.layerVisibility.topIcon) {
            visibleElements.push({ name: 'topIcon', height: elementHeights.topIcon });
            totalHeight += elementHeights.topIcon;
        }
        if (this.layerVisibility.topTitle) {
            visibleElements.push({ name: 'topTitle', height: elementHeights.topTitle });
            totalHeight += elementHeights.topTitle;
        }
        if (this.layerVisibility.mainTitle) {
            visibleElements.push({ name: 'mainTitle', height: elementHeights.mainTitle });
            totalHeight += elementHeights.mainTitle;
        }
        if (this.layerVisibility.subtitle1) {
            visibleElements.push({ name: 'subtitle1', height: elementHeights.subtitle1 });
            totalHeight += elementHeights.subtitle1;
        }
        if (this.layerVisibility.subtitle2) {
            visibleElements.push({ name: 'subtitle2', height: elementHeights.subtitle2 });
            totalHeight += elementHeights.subtitle2;
        }
        if (this.layerVisibility.bottomIcons) {
            visibleElements.push({ name: 'bottomIcons', height: elementHeights.bottomIcons });
            totalHeight += elementHeights.bottomIcons;
        }
        
        // Add gaps between visible elements
        const gapsNeeded = Math.max(0, visibleElements.length - 1);
        totalHeight += gapsNeeded * this.layoutConfig.elementGap;
        
        // Calculate starting Y position to center the design
        let currentY = (this.layoutConfig.canvasHeight - totalHeight) / 2;
        
        // Clear previous base positions
        this.positionStates.base = {};
        
        // Calculate base position for each visible element
        visibleElements.forEach((element, index) => {
            const yPosition = currentY + (element.height / 2);
            
            // Store base position
            this.positionStates.base[element.name] = {
                x: this.layoutConfig.centerX,
                y: yPosition,
                width: element.name === 'topIcon' ? 56 : 
                       element.name === 'bottomIcons' ? 40 :
                       this.layoutConfig.contentWidth,
                height: element.height,
                visible: true
            };
            
            // Special handling for bottom icons
            if (element.name === 'bottomIcons') {
                this.positionStates.base[element.name].spacing = this.calculateIconSpacing();
                this.positionStates.base[element.name].count = this.bottomIconsConfig.count;
            }
            
            console.log(`📍 Base position set for ${element.name}:`, this.positionStates.base[element.name]);
            
            // Move to next position
            currentY += element.height + (index < visibleElements.length - 1 ? this.layoutConfig.elementGap : 0);
        });
        
        // Calculate initial positions (where elements start before animating in)
        this.calculateInitialPositions();
        
        // Calculate exit positions (where elements move when animating out)
        this.calculateExitPositions();
        
        console.log('✅ Base position calculation complete');
        return this.positionStates.base;
    }
    
    /**
     * Calculate initial positions for animation-in effects
     */
    calculateInitialPositions() {
        this.positionStates.initial = {};
        
        Object.keys(this.positionStates.base).forEach(elementName => {
            const basePos = this.positionStates.base[elementName];
            
            // Default: start 100px to the left and invisible
            this.positionStates.initial[elementName] = {
                x: basePos.x - 100,
                y: basePos.y,
                opacity: 0,
                scale: 0.8,
                rotation: 0
            };
            
            // Customize initial positions based on element type
            switch (elementName) {
                case 'topIcon':
                    this.positionStates.initial[elementName] = {
                        x: basePos.x,
                        y: basePos.y - 50,
                        opacity: 0,
                        scale: 0.3,
                        rotation: -45
                    };
                    break;
                    
                case 'mainTitle':
                    this.positionStates.initial[elementName] = {
                        x: basePos.x,
                        y: basePos.y + 30,
                        opacity: 0,
                        scale: 0.9,
                        rotation: 0
                    };
                    break;
                    
                case 'bottomIcons':
                    this.positionStates.initial[elementName] = {
                        x: basePos.x,
                        y: basePos.y + 80,
                        opacity: 0,
                        scale: 0.1,
                        rotation: 180
                    };
                    break;
            }
        });
        
        console.log('📥 Initial positions calculated for animation-in');
    }
    
    /**
     * Calculate exit positions for animation-out effects
     */
    calculateExitPositions() {
        this.positionStates.exit = {};
        
        Object.keys(this.positionStates.base).forEach(elementName => {
            const basePos = this.positionStates.base[elementName];
            
            // Default: fade out in place
            this.positionStates.exit[elementName] = {
                x: basePos.x,
                y: basePos.y,
                opacity: 0,
                scale: 0.8,
                rotation: 0
            };
            
            // Customize exit positions based on element type
            switch (elementName) {
                case 'topIcon':
                    this.positionStates.exit[elementName] = {
                        x: basePos.x,
                        y: basePos.y - 100,
                        opacity: 0,
                        scale: 1.5,
                        rotation: 45
                    };
                    break;
                    
                case 'bottomIcons':
                    this.positionStates.exit[elementName] = {
                        x: basePos.x,
                        y: basePos.y + 50,
                        opacity: 0,
                        scale: 0,
                        rotation: -180
                    };
                    break;
            }
        });
        
        console.log('📤 Exit positions calculated for animation-out');
    }
    
    /**
     * Calculate optimal icon spacing based on main title width
     */
    calculateIconSpacing() {
        if (!this.templateObjects.mainTitle || !this.layerVisibility.mainTitle) {
            return 260; // Default spacing
        }
        
        const longestLineWidth = this.getMainTitleLongestLineWidth();
        return Math.max(200, Math.min(400, longestLineWidth / Math.max(1, this.bottomIconsConfig.count - 1)));
    }
    
    /**
     * Set all elements to their base positions
     */
    setElementsToBasePositions() {
        console.log('🎯 Setting all elements to base positions...');
        
        Object.keys(this.positionStates.base).forEach(elementName => {
            const basePos = this.positionStates.base[elementName];
            const element = this.templateObjects[elementName];
            
            if (elementName === 'bottomIcons' && Array.isArray(element)) {
                // Handle bottom icons array
                element.forEach((icon, index) => {
                    if (icon && index < basePos.count) {
                        const iconPositions = this.calculateIconPositions(basePos.count);
                        icon.x(iconPositions[index]);
                        icon.y(basePos.y);
                        icon.opacity(1);
                        icon.scaleX(1);
                        icon.scaleY(1);
                        icon.rotation(0);
                    }
                });
            } else if (element) {
                // Handle single elements
                element.x(basePos.x);
                element.y(basePos.y);
                element.opacity(1);
                element.scaleX(1);
                element.scaleY(1);
                element.rotation(0);
                
                // Handle text centering
                if (element.getClassName() === 'Text') {
                    element.offsetX(this.layoutConfig.contentWidth / 2);
                    element.offsetY(element.height() / 2);
                }
            }
        });
        
        this.stage.batchDraw();
        console.log('✅ All elements set to base positions');
    }
    
    /**
     * Set all elements to their initial positions (before animation)
     */
    setElementsToInitialPositions() {
        console.log('📥 Setting all elements to initial positions...');
        
        Object.keys(this.positionStates.initial).forEach(elementName => {
            const initialPos = this.positionStates.initial[elementName];
            const element = this.templateObjects[elementName];
            
            if (elementName === 'bottomIcons' && Array.isArray(element)) {
                // Handle bottom icons array
                element.forEach((icon, index) => {
                    if (icon) {
                        const iconPositions = this.calculateIconPositions(this.bottomIconsConfig.count);
                        icon.x(iconPositions[index] + (initialPos.x - this.positionStates.base[elementName].x));
                        icon.y(initialPos.y);
                        icon.opacity(initialPos.opacity);
                        icon.scaleX(initialPos.scale);
                        icon.scaleY(initialPos.scale);
                        icon.rotation(initialPos.rotation);
                    }
                });
            } else if (element) {
                // Handle single elements
                element.x(initialPos.x);
                element.y(initialPos.y);
                element.opacity(initialPos.opacity);
                element.scaleX(initialPos.scale);
                element.scaleY(initialPos.scale);
                element.rotation(initialPos.rotation);
            }
        });
        
        this.stage.batchDraw();
        console.log('✅ All elements set to initial positions');
    }
    
    /**
     * Get base position for a specific element
     */
    getBasePosition(elementName) {
        return this.positionStates.base[elementName] || null;
    }
    
    /**
     * Get initial position for a specific element
     */
    getInitialPosition(elementName) {
        return this.positionStates.initial[elementName] || null;
    }
    
    /**
     * Get exit position for a specific element
     */
    getExitPosition(elementName) {
        return this.positionStates.exit[elementName] || null;
    }
    
    // ================================
    // ANIMATION SYSTEM METHODS
    // ================================
    
    /**
     * Get animation configuration for a specific element
     */
    getAnimationConfig(elementName) {
        return this.animationSystem.elements[elementName] || null;
    }
    
    /**
     * Set animation configuration for a specific element
     */
    setElementAnimation(elementName, animationProps) {
        if (!this.animationSystem.elements[elementName]) {
            console.warn(`Element '${elementName}' not found in animation system`);
            return;
        }
        
        // Deep merge animation properties
        this.animationSystem.elements[elementName] = {
            ...this.animationSystem.elements[elementName],
            ...animationProps
        };
        
        console.log(`🎬 Updated animation for ${elementName}:`, animationProps);
        
        // Recreate timeline with new configuration
        this.updateGSAPTimeline();
    }
    
    /**
     * PHASE CONTROL METHODS - NEW
     */
    
    /**
     * Enable/Disable animate-in phase globally
     */
    setAnimateInEnabled(enabled) {
        this.animationSystem.global.phaseControls.enableAnimateIn = enabled;
        console.log(`🎬 Animate-in phase: ${enabled ? 'ENABLED' : 'DISABLED'}`);
        this.updateGSAPTimeline();
    }
    
    /**
     * Enable/Disable animate-out phase globally
     */
    setAnimateOutEnabled(enabled) {
        this.animationSystem.global.phaseControls.enableAnimateOut = enabled;
        console.log(`🚪 Animate-out phase: ${enabled ? 'ENABLED' : 'DISABLED'}`);
        this.updateGSAPTimeline();
    }
    
    /**
     * Enable/Disable hold phase globally
     */
    setHoldEnabled(enabled) {
        this.animationSystem.global.phaseControls.enableHold = enabled;
        console.log(`⏸️ Hold phase: ${enabled ? 'ENABLED' : 'DISABLED'}`);
        this.updateGSAPTimeline();
    }
    
    /**
     * Set animate-in enabled/disabled for specific element
     */
    setElementAnimateIn(elementName, enabled) {
        if (!this.animationSystem.elements[elementName]) {
            console.warn(`Element '${elementName}' not found in animation system`);
            return;
        }
        
        this.animationSystem.elements[elementName].animateIn.enabled = enabled;
        console.log(`🎬 ${elementName} animate-in: ${enabled ? 'ENABLED' : 'DISABLED'}`);
        this.updateGSAPTimeline();
    }
    
    /**
     * Set animate-out enabled/disabled for specific element
     */
    setElementAnimateOut(elementName, enabled) {
        if (!this.animationSystem.elements[elementName]) {
            console.warn(`Element '${elementName}' not found in animation system`);
            return;
        }
        
        this.animationSystem.elements[elementName].animateOut.enabled = enabled;
        console.log(`🚪 ${elementName} animate-out: ${enabled ? 'ENABLED' : 'DISABLED'}`);
        this.updateGSAPTimeline();
    }
    
    /**
     * Disable all animate-out animations (as requested)
     */
    disableAllAnimateOut() {
        console.log('🚪 Disabling ALL animate-out animations...');
        
        // Disable global animate-out phase
        this.animationSystem.global.phaseControls.enableAnimateOut = false;
        
        // Disable animate-out for each element
        Object.keys(this.animationSystem.elements).forEach(elementName => {
            this.animationSystem.elements[elementName].animateOut.enabled = false;
        });
        
        console.log('✅ All animate-out animations disabled');
        this.updateGSAPTimeline();
    }
    
    /**
     * Enable all animate-out animations
     */
    enableAllAnimateOut() {
        console.log('🚪 Enabling ALL animate-out animations...');
        
        // Enable global animate-out phase
        this.animationSystem.global.phaseControls.enableAnimateOut = true;
        
        // Enable animate-out for each element
        Object.keys(this.animationSystem.elements).forEach(elementName => {
            this.animationSystem.elements[elementName].animateOut.enabled = true;
        });
        
        console.log('✅ All animate-out animations enabled');
        this.updateGSAPTimeline();
    }
    
    /**
     * Get phase control status
     */
    getPhaseControls() {
        return {
            ...this.animationSystem.global.phaseControls,
            elements: Object.keys(this.animationSystem.elements).reduce((acc, elementName) => {
                const element = this.animationSystem.elements[elementName];
                acc[elementName] = {
                    animateIn: element.animateIn.enabled,
                    animateOut: element.animateOut.enabled
                };
                return acc;
            }, {})
        };
    }
    
    /**
     * Set animation preset (changes all elements) - UPDATED
     */
    setAnimationPreset(presetName) {
        if (!this.animationSystem.presets[presetName]) {
            console.warn(`Animation preset '${presetName}' not found`);
            return;
        }
        
        const preset = this.animationSystem.presets[presetName];
        this.animationSystem.presets.current = presetName;
        
        console.log(`🎭 Applying animation preset: ${preset.name}`);
        
        // Apply preset overrides
        if (preset.overrides && preset.overrides.all) {
            // Apply to all elements
            Object.keys(this.animationSystem.elements).forEach(elementName => {
                // Handle both old 'intro' and new 'animateIn' naming
                if (preset.overrides.all.intro) {
                    this.animationSystem.elements[elementName].animateIn = {
                        ...this.animationSystem.elements[elementName].animateIn,
                        ...preset.overrides.all.intro
                    };
                }
                if (preset.overrides.all.animateIn) {
                    this.animationSystem.elements[elementName].animateIn = {
                        ...this.animationSystem.elements[elementName].animateIn,
                        ...preset.overrides.all.animateIn
                    };
                }
            });
        }
        
        // Apply specific element overrides
        if (preset.overrides) {
            Object.keys(preset.overrides).forEach(elementName => {
                if (elementName !== 'all' && this.animationSystem.elements[elementName]) {
                    if (preset.overrides[elementName].intro) {
                        this.animationSystem.elements[elementName].animateIn = {
                            ...this.animationSystem.elements[elementName].animateIn,
                            ...preset.overrides[elementName].intro
                        };
                    }
                    if (preset.overrides[elementName].animateIn) {
                        this.animationSystem.elements[elementName].animateIn = {
                            ...this.animationSystem.elements[elementName].animateIn,
                            ...preset.overrides[elementName].animateIn
                        };
                    }
                }
            });
        }
        
        // Recreate timeline with new preset
        this.updateGSAPTimeline();
        
        console.log(`✅ Animation preset '${preset.name}' applied successfully`);
    }
    
    /**
     * Get available animation presets
     */
    getAnimationPresets() {
        return Object.keys(this.animationSystem.presets)
            .filter(key => key !== 'current')
            .map(key => ({
                id: key,
                ...this.animationSystem.presets[key]
            }));
    }
    
    /**
     * Get current animation preset
     */
    getCurrentAnimationPreset() {
        return this.animationSystem.presets.current;
    }
    
    /**
     * Convert relative position to absolute position based on base position
     */
    convertToAbsolutePosition(relativeProps, basePosition) {
        const absolute = { ...relativeProps };
        
        if (relativeProps.x !== undefined) {
            absolute.x = basePosition.x + relativeProps.x;
        }
        if (relativeProps.y !== undefined) {
            absolute.y = basePosition.y + relativeProps.y;
        }
        
        return absolute;
    }
    
    /**
     * Check if element is visible and should be animated
     */
    isElementVisible(elementName) {
        return this.layerVisibility[elementName] && this.templateObjects[elementName];
    }
    
    /**
     * Get element object for animation
     */
    getElementObject(elementName) {
        return this.templateObjects[elementName];
    }
    
    /**
     * Create intro animations using animation system configuration - UPDATED
     */
    createIntroAnimationsFromSystem() {
        console.log('🎬 Creating intro animations from animation system...');
        
        // Check if animate-in phase is globally enabled
        if (!this.animationSystem.global.phaseControls.enableAnimateIn) {
            console.log('⚠️ Animate-in phase is globally disabled, skipping...');
            return;
        }
        
        const elements = this.animationSystem.elements;
        const timing = this.animationSystem.global.timing;
        
        // Sort elements by animation order and filter by enabled status
        const sortedElements = Object.keys(elements)
            .filter(elementName => {
                const isVisible = this.isElementVisible(elementName);
                const isEnabled = elements[elementName].animateIn.enabled;
                return isVisible && isEnabled;
            })
            .sort((a, b) => elements[a].animateIn.order - elements[b].animateIn.order);
        
        sortedElements.forEach(elementName => {
            const elementConfig = elements[elementName];
            const element = this.getElementObject(elementName);
            
            if (elementName === 'bottomIcons') {
                this.animateBottomIconsFromSystem(elementConfig, element);
            } else {
                this.animateElementFromSystem(elementName, elementConfig, element);
            }
        });
        
        console.log(`✅ Created intro animations for ${sortedElements.length} elements`);
    }
    
    /**
     * Animate single element using animation system configuration - UPDATED
     */
    animateElementFromSystem(elementName, config, element) {
        const basePos = this.getBasePosition(elementName);
        const delay = config.animateIn.order * this.animationSystem.global.timing.elementDelay;
        
        // Convert relative positions to absolute positions
        const fromProps = this.convertToAbsolutePosition(config.animateIn.from, basePos);
        const toProps = this.convertToAbsolutePosition(config.animateIn.to, basePos);
        
        // Set initial position safely
        if (fromProps.x !== undefined) element.x(fromProps.x);
        if (fromProps.y !== undefined) element.y(fromProps.y);
        if (fromProps.opacity !== undefined) element.opacity(fromProps.opacity);
        if (fromProps.scale !== undefined) {
            element.scaleX(fromProps.scale);
            element.scaleY(fromProps.scale);
        }
        if (fromProps.rotation !== undefined) element.rotation(fromProps.rotation);
        
        // Create safe animation properties
        const animProps = {
            duration: config.animateIn.duration,
            ease: config.animateIn.ease
        };
        
        if (toProps.x !== undefined) animProps.x = toProps.x;
        if (toProps.y !== undefined) animProps.y = toProps.y;
        if (toProps.opacity !== undefined) animProps.opacity = toProps.opacity;
        if (toProps.scale !== undefined) {
            animProps.scaleX = toProps.scale;
            animProps.scaleY = toProps.scale;
        }
        if (toProps.rotation !== undefined) animProps.rotation = toProps.rotation;
        
        // Always ensure final values for missing properties
        if (animProps.opacity === undefined) animProps.opacity = 1;
        if (animProps.scaleX === undefined) {
            animProps.scaleX = 1;
            animProps.scaleY = 1;
        }
        if (animProps.rotation === undefined) animProps.rotation = 0;
        
        // Animate to final position
        this.timeline.to(element, animProps, delay);
        
        console.log(`🎭 Animated ${elementName} with delay ${delay}s`);
    }
    
    /**
     * Animate bottom icons with stagger using animation system configuration - UPDATED
     */
    animateBottomIconsFromSystem(config, iconsArray) {
        if (!Array.isArray(iconsArray) || iconsArray.length === 0) return;
        
        const basePos = this.getBasePosition('bottomIcons');
        const iconPositions = this.calculateIconPositions(basePos.count);
        const baseDelay = config.animateIn.order * this.animationSystem.global.timing.elementDelay;
        
        iconsArray.forEach((icon, index) => {
            if (icon && index < basePos.count) {
                // Convert relative positions to absolute for this icon
                const fromProps = this.convertToAbsolutePosition(config.animateIn.from, {
                    x: iconPositions[index],
                    y: basePos.y
                });
                
                // Set initial position
                icon.x(fromProps.x);
                icon.y(fromProps.y);
                icon.opacity(fromProps.opacity || 0);
                icon.scaleX(fromProps.scale || 1);
                icon.scaleY(fromProps.scale || 1);
                icon.rotation(fromProps.rotation || 0);
                
                // Animate to final position
                this.timeline.to(icon, {
                    x: iconPositions[index],
                    y: basePos.y,
                    opacity: 1,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    duration: config.animateIn.duration,
                    ease: config.animateIn.ease
                }, baseDelay + (index * config.animateIn.stagger));
            }
        });
        
        console.log(`🎭 Animated ${iconsArray.length} bottom icons with stagger`);
    }
    
    /**
     * Create exit animations using animation system configuration - UPDATED
     */
    createExitAnimationsFromSystem() {
        console.log('🚪 Creating exit animations from animation system...');
        
        // Check if animate-out phase is globally enabled
        if (!this.animationSystem.global.phaseControls.enableAnimateOut) {
            console.log('⚠️ Animate-out phase is globally disabled, skipping...');
            return;
        }
        
        const visibleElements = [];
        Object.keys(this.animationSystem.elements).forEach(elementName => {
            const elementConfig = this.animationSystem.elements[elementName];
            
            // Check if element is visible and animate-out is enabled for this element
            if (this.isElementVisible(elementName) && elementConfig.animateOut.enabled) {
                const element = this.getElementObject(elementName);
                if (elementName === 'bottomIcons' && Array.isArray(element)) {
                    visibleElements.push(...element.filter(icon => icon));
                } else if (element) {
                    visibleElements.push(element);
                }
            }
        });
        
        if (visibleElements.length > 0) {
            this.timeline.to(visibleElements, {
                opacity: 0,
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 1.5,
                ease: this.animationSystem.global.defaultEasing.exit,
                stagger: this.animationSystem.global.timing.exitStagger
            }, this.animationSystem.global.phases.exit.start);
        }
        
        console.log(`✅ Created exit animations for ${visibleElements.length} elements`);
    }
    
    // ================================
    // ANIMATION SYSTEM QUICK ACCESS & DEBUGGING
    // ================================
    
    /**
     * Quick access to animation system for console debugging
     */
    getAnimationSystemConfig() {
        return this.animationSystem;
    }
    
    /**
     * Debug animation system state
     */
    debugAnimationSystem() {
        console.log('🎬 === ANIMATION SYSTEM DEBUG ===');
        console.log('Current Preset:', this.getCurrentAnimationPreset());
        console.log('Available Presets:', this.getAnimationPresets().map(p => p.name));
        console.log('Global Config:', this.animationSystem.global);
        console.log('Phase Controls:', this.getPhaseControls());
        console.log('Element Visibility:');
        Object.keys(this.animationSystem.elements).forEach(element => {
            console.log(`  ${element}: visible=${this.isElementVisible(element)}`);
        });
        console.log('Base Positions:', this.positionStates.base);
        console.log('=================================');
    }
    
    /**
     * Quick animation preset switching with feedback
     */
    quickPreset(presetName) {
        const available = this.getAnimationPresets().map(p => p.id);
        if (!available.includes(presetName)) {
            console.error(`❌ Preset '${presetName}' not found. Available: ${available.join(', ')}`);
            return;
        }
        
        this.setAnimationPreset(presetName);
        console.log(`✅ Switched to '${presetName}' preset`);
    }
    
    /**
     * Quick element animation modification
     */
    quickElementAnim(elementName, properties) {
        if (!this.animationSystem.elements[elementName]) {
            console.error(`❌ Element '${elementName}' not found`);
            return;
        }
        
        this.setElementAnimation(elementName, properties);
        console.log(`✅ Updated animation for '${elementName}'`);
    }
    
    /**
     * QUICK PHASE CONTROL METHODS - NEW
     */
    
    /**
     * Quick toggle animate-in globally
     */
    quickAnimateIn(enabled) {
        this.setAnimateInEnabled(enabled);
        console.log(`🎬 Quick toggle: Animate-in ${enabled ? 'ON' : 'OFF'}`);
    }
    
    /**
     * Quick toggle animate-out globally
     */
    quickAnimateOut(enabled) {
        this.setAnimateOutEnabled(enabled);
        console.log(`🚪 Quick toggle: Animate-out ${enabled ? 'ON' : 'OFF'}`);
    }
    
    /**
     * Quick disable all animate-out (as requested)
     */
    quickDisableAnimateOut() {
        this.disableAllAnimateOut();
        console.log(`🚪 Quick action: All animate-out disabled`);
    }
    
    /**
     * Quick enable all animate-out
     */
    quickEnableAnimateOut() {
        this.enableAllAnimateOut();
        console.log(`🚪 Quick action: All animate-out enabled`);
    }
    
    /**
     * Show current phase status
     */
    quickPhaseStatus() {
        const status = this.getPhaseControls();
        console.log('🎭 === PHASE STATUS ===');
        console.log(`Global Animate-In: ${status.enableAnimateIn ? '✅ ON' : '❌ OFF'}`);
        console.log(`Global Animate-Out: ${status.enableAnimateOut ? '✅ ON' : '❌ OFF'}`);
        console.log(`Global Hold: ${status.enableHold ? '✅ ON' : '❌ OFF'}`);
        console.log('Element Controls:');
        Object.keys(status.elements).forEach(element => {
            const el = status.elements[element];
            console.log(`  ${element}: In=${el.animateIn ? '✅' : '❌'} Out=${el.animateOut ? '✅' : '❌'}`);
        });
        console.log('=====================');
    }
    
    /**
     * Reset to default animation system
     */
    resetAnimationSystem() {
        console.log('🔄 Resetting animation system to defaults...');
        
        // Reset to slideInLeft preset
        this.setAnimationPreset('slideInLeft');
        
        // Reset phase controls to defaults
        this.animationSystem.global.phaseControls.enableAnimateIn = true;
        this.animationSystem.global.phaseControls.enableAnimateOut = true;
        this.animationSystem.global.phaseControls.enableHold = true;
        
        // Reset all element phase controls
        Object.keys(this.animationSystem.elements).forEach(elementName => {
            this.animationSystem.elements[elementName].animateIn.enabled = true;
            this.animationSystem.elements[elementName].animateOut.enabled = true;
        });
        
        this.updateGSAPTimeline();
        
        console.log('✅ Animation system reset to defaults');
    }
    
    // ================================
    // LAYOUT RECALCULATION (UPDATED)
    // ================================
    
    recalculateLayout() {
        console.log('Recalculating layout with base position system...');
        
        // Calculate base positions first
        this.calculateBasePositions();
        
        // Apply base positions to actual elements
        this.setElementsToBasePositions();
        
        // Update bottom icons positioning
        if (this.layerVisibility.bottomIcons && this.templateObjects.bottomIcons.length > 0) {
            this.createBottomIconsExact();
        }
        
        console.log('Layout recalculation complete with base position system');
    }
    
    createGSAPTimeline() {
        console.log('🎬 Creating GSAP timeline using Template Animation Configuration...');
        
        try {
            // Ensure base positions are calculated first
            if (!this.positionStates.base || Object.keys(this.positionStates.base).length === 0) {
                console.log('📐 Calculating base positions...');
                this.calculateBasePositions();
            }
            
            // Use Template Animation Configuration
            const animConfig = window.TemplateAnimations || {};
            console.log('🎛️ Template Animation config structure:', {
                hasConfig: !!animConfig.global,
                hasDuration: !!animConfig.global?.timeline?.duration,
                hasPhases: !!animConfig.global?.phases,
                enabledElements: animConfig.utils?.getEnabledElements()?.length || 0,
                currentPreset: animConfig.presets?.current
            });
            
            // Use template animation duration with fallback
            const timelineDuration = animConfig.global?.timeline?.duration || this.animationDuration || 10;
            
            this.timeline = gsap.timeline({ 
                paused: true,
                duration: timelineDuration,
                ease: "power2.inOut"
            });
            
            console.log('⏱️ GSAP timeline created successfully!');
            console.log(`   Duration: ${timelineDuration} seconds`);
            console.log(`   Animation phases:`, animConfig.global?.phases || 'Using fallback phases');
            
            // Apply animations from configuration
            if (animConfig.utils && animConfig.utils.getEnabledElements) {
                console.log('🎬 Applying animations from Template Animation Configuration...');
                this.applyTemplateAnimations(animConfig);
            } else {
                console.warn('⚠️ Template Animation Configuration not available, using fallback');
                this.applyFallbackMainTitleAnimation();
            }
            
            // Hold middle section - elements stay at base positions
            const holdStart = animConfig.global?.phases?.hold?.start || 2;
            const holdEnd = animConfig.global?.phases?.hold?.end || 8;
            const holdDuration = holdEnd - holdStart;
            
            this.timeline.to({}, { 
                duration: holdDuration 
            }, holdStart);
            
            console.log(`📍 Hold section: ${holdStart}s - ${holdEnd}s (${holdDuration}s duration)`);
            
            // DISABLED: Create exit animations (blank timeline approach)
            // console.log('🚪 Creating exit animations...');
            // this.createExitAnimationsFromSystem();
            
            console.log(`✅ GSAP Timeline created using Template Animation Configuration`);
            console.log(`🎭 Current preset: ${animConfig.presets?.current || 'default'}`);
            console.log(`📊 Animation phases:`, animConfig.global?.phases || 'using fallbacks');
            console.log(`⏱️ Timeline duration: ${this.timeline.duration()}s`);
            console.log(`🎬 Template animations applied: ${animConfig.utils ? 'SUCCESS' : 'FALLBACK'}`);
            
            // Emergency fix: Ensure icons are visible if timeline doesn't auto-play
            setTimeout(() => {
                if (this.timeline && this.timeline.progress() === 0) {
                    console.log('🔧 Timeline not playing, ensuring icons are visible...');
                    this.forceIconsVisible();
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ Error creating GSAP timeline:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                animationSystem: !!this.animationSystem,
                templateObjects: Object.keys(this.templateObjects),
                basePositions: Object.keys(this.positionStates?.base || {})
            });
            // Fallback to a simple timeline if animation system fails
            this.createFallbackTimeline();
        }
        
        // Add global debugging methods
        window.forceIconsVisible = () => this.forceIconsVisible();
        window.debugIconStates = () => this.debugIconStates();
    }
    
    /**
     * Apply template animations from configuration
     * @param {Object} animConfig - Template animation configuration
     */
    applyTemplateAnimations(animConfig) {
        console.log('🎬 Applying template animations from configuration...');
        
        try {
            // Calculate dynamic delays for title elements
            const dynamicDelays = animConfig.utils.calculateDynamicDelays ? 
                animConfig.utils.calculateDynamicDelays() : {};
            
            const enabledElements = animConfig.utils.getEnabledElements();
            console.log(`📊 Found ${enabledElements.length} enabled elements to animate`);
            
            enabledElements.forEach((elementInfo, index) => {
                const { category, name, config } = elementInfo;
                console.log(`🎯 Processing ${category}.${name} (${index + 1}/${enabledElements.length})`);
                
                // Get the actual Konva element
                const element = this.getTemplateElement(name);
                if (!element) {
                    console.warn(`⚠️ Element ${name} not found in template objects`);
                    return;
                }
                
                // Apply intro animation with dynamic delay for title elements
                if (config.animations?.intro) {
                    const animationConfig = { ...config.animations.intro };
                    
                    // Override delay for title elements using dynamic stagger system
                    if (category === 'text' && dynamicDelays[name] !== undefined) {
                        animationConfig.delay = dynamicDelays[name];
                        console.log(`🕐 Using dynamic delay for ${name}: ${dynamicDelays[name].toFixed(3)}s`);
                        console.log(`🔍 Animation config before applying:`, animationConfig);
                    }
                    
                    this.applyElementAnimation(element, name, animationConfig, 'intro');
                }
                
                // Apply exit animation (if enabled in future)
                // if (config.animations?.exit) {
                //     this.applyElementAnimation(element, name, config.animations.exit, 'exit');
                // }
            });
            
            console.log('✅ All template animations applied successfully with dynamic stagger timing');
            
        } catch (error) {
            console.error('❌ Error applying template animations:', error);
            console.log('🔧 Falling back to basic main title animation');
            this.applyFallbackMainTitleAnimation();
        }
    }
    
    /**
     * Get template element by name with mapping
     * @param {string} name - Element name from configuration
     * @returns {Konva.Node|null} - Konva element or null
     */
    getTemplateElement(name) {
        // Direct mapping for most elements
        if (this.templateObjects[name]) {
            return this.templateObjects[name];
        }
        
        // Special cases for bottom icons
        if (name === 'bottomIcons' && Array.isArray(this.templateObjects.bottomIcons)) {
            return this.templateObjects.bottomIcons; // Return array for batch processing
        }
        
        return null;
    }
    
    /**
     * Apply animation to a specific element
     * @param {Konva.Node|Array} element - Konva element or array of elements
     * @param {string} elementName - Element name for logging
     * @param {Object} animConfig - Animation configuration
     * @param {string} phase - Animation phase (intro, exit)
     */
    applyElementAnimation(element, elementName, animConfig, phase) {
        if (!element || !animConfig) return;
        
        console.log(`🎬 Applying ${phase} animation to ${elementName}`);
        console.log(`   Config:`, {
            from: animConfig.from,
            to: animConfig.to,
            duration: animConfig.duration,
            ease: animConfig.ease,
            delay: animConfig.delay
        });
        
        try {
            // Handle arrays (like bottom icons)
            if (Array.isArray(element)) {
                this.applyArrayElementAnimation(element, elementName, animConfig, phase);
                return;
            }
            
            // Get base position for relative animations
            const basePosition = this.positionStates.base?.[elementName];
            
            // Set initial state from 'from' properties
            if (animConfig.from) {
                this.setElementState(element, animConfig.from, basePosition);
            }
            
            // Force redraw to show initial state
            this.stage.batchDraw();
            
            // Create GSAP animation properties
            const toProps = this.processAnimationProperties(animConfig.to || {}, basePosition);
            
            // Add animation to timeline
            const timelinePosition = animConfig.delay || 0;
            
            const animationTween = this.timeline.to(element, {
                ...toProps,
                duration: animConfig.duration || 1,
                ease: animConfig.ease || "power2.out",
                onStart: () => {
                    console.log(`▶️ ${elementName} ${phase} animation started`);
                },
                onComplete: () => {
                    console.log(`✅ ${elementName} ${phase} animation completed`);
                }
            }, timelinePosition);
            
            console.log(`✅ ${elementName} ${phase} animation added to timeline at ${timelinePosition}s`);
            
        } catch (error) {
            console.error(`❌ Error applying animation to ${elementName}:`, error);
        }
    }
    
    /**
     * Apply animation to array of elements (like bottom icons)
     * @param {Array} elements - Array of Konva elements
     * @param {string} elementName - Element name for logging
     * @param {Object} animConfig - Animation configuration
     * @param {string} phase - Animation phase
     */
    applyArrayElementAnimation(elements, elementName, animConfig, phase) {
        console.log(`🎬 Applying ${phase} animation to ${elements.length} ${elementName}`);
        
        elements.forEach((element, index) => {
            if (!element) return;
            
            // Calculate stagger delay
            const staggerDelay = (animConfig.stagger || 0) * index;
            const totalDelay = (animConfig.delay || 0) + staggerDelay;
            
            // Set initial state
            if (animConfig.from) {
                this.setElementState(element, animConfig.from);
            }
            
            // Create animation properties
            const toProps = this.processAnimationProperties(animConfig.to || {});
            
            // Add to timeline with stagger
            this.timeline.to(element, {
                ...toProps,
                duration: animConfig.duration || 1,
                ease: animConfig.ease || "power2.out",
                onStart: () => {
                    console.log(`▶️ ${elementName}[${index}] ${phase} animation started`);
                },
                onComplete: () => {
                    console.log(`✅ ${elementName}[${index}] ${phase} animation completed`);
                }
            }, totalDelay);
        });
        
        this.stage.batchDraw();
    }
    
    /**
     * Set element state from animation properties
     * @param {Konva.Node} element - Konva element
     * @param {Object} props - Properties to set
     * @param {Object} basePosition - Base position for relative calculations
     */
    setElementState(element, props, basePosition = null) {
        Object.entries(props).forEach(([prop, value]) => {
            if (typeof element[prop] === 'function') {
                let finalValue = value;
                
                // Handle relative values (strings starting with +/-)
                if (typeof value === 'string' && (value.startsWith('+') || value.startsWith('-'))) {
                    const offset = parseFloat(value);
                    if (basePosition && basePosition[prop] !== undefined) {
                        finalValue = basePosition[prop] + offset;
                    } else if (element[prop]() !== undefined) {
                        finalValue = element[prop]() + offset;
                    }
                }
                
                element[prop](finalValue);
            }
        });
    }
    
    /**
     * Process animation properties for GSAP
     * @param {Object} props - Animation properties
     * @param {Object} basePosition - Base position for relative calculations
     * @returns {Object} - Processed properties for GSAP
     */
    processAnimationProperties(props, basePosition = null) {
        const processed = {};
        
        Object.entries(props).forEach(([prop, value]) => {
            let finalValue = value;
            
            // Handle relative values and base position references
            if (typeof value === 'string') {
                if (value.startsWith('+') || value.startsWith('-')) {
                    // Relative offset from base position
                    const offset = parseFloat(value);
                    if (basePosition && basePosition[prop] !== undefined) {
                        finalValue = basePosition[prop] + offset;
                    } else {
                        finalValue = value; // Let GSAP handle relative values
                    }
                } else if (value === "0" && basePosition && basePosition[prop] !== undefined) {
                    // "0" means base position
                    finalValue = basePosition[prop];
                }
            }
            
            processed[prop] = finalValue;
        });
        
        return processed;
    }
    
    /**
     * Fallback main title animation for when config is not available
     */
    applyFallbackMainTitleAnimation() {
        console.log('🔧 Applying fallback main title animation...');
        
        if (!this.templateObjects.mainTitle) {
            console.warn('⚠️ Main title element not found for fallback animation');
            return;
        }
        
        const mainTitleBase = this.positionStates.base?.mainTitle;
        if (mainTitleBase) {
            const startY = mainTitleBase.y + 100;
            
            this.templateObjects.mainTitle.y(startY);
            this.templateObjects.mainTitle.opacity(0);
            this.stage.batchDraw();
            
            this.timeline.to(this.templateObjects.mainTitle, {
                y: mainTitleBase.y,
                opacity: 1,
                duration: 3,
                ease: "expo.out",
                onStart: () => console.log('▶️ Fallback main title animation started'),
                onComplete: () => console.log('✅ Fallback main title animation completed')
            }, 0.5);
            
            console.log('✅ Fallback main title animation applied');
        } else {
            console.error('❌ Cannot apply fallback animation - no base position');
        }
    }
    
    /**
     * Fallback timeline creation if animation system fails
     */
    createFallbackTimeline() {
        console.log('🔧 Creating fallback timeline...');
        
        this.timeline = gsap.timeline({ 
            paused: true,
            duration: 10,
            ease: "power2.inOut"
        });
        
        // Simple fade in for all visible elements
        const visibleElements = [];
        Object.keys(this.templateObjects).forEach(key => {
            const obj = this.templateObjects[key];
            if (obj && this.layerVisibility[key]) {
                if (Array.isArray(obj)) {
                    visibleElements.push(...obj.filter(item => item));
                } else {
                    visibleElements.push(obj);
                }
            }
        });
        
        if (visibleElements.length > 0) {
            // DISABLED: Set initial opacity to 0 (prevents elements from disappearing)
            // visibleElements.forEach(el => el.opacity(0));
            
            // Fade in over 2 seconds
            this.timeline.to(visibleElements, {
                opacity: 1,
                duration: 2,
                stagger: 0.1
            }, 0);
            
            // Hold for 6 seconds
            this.timeline.to({}, { duration: 6 }, 2);
            
            // Fade out over 2 seconds
            this.timeline.to(visibleElements, {
                opacity: 0,
                duration: 2,
                stagger: 0.05
            }, 8);
        }
        
        console.log(`✅ Fallback timeline created with ${visibleElements.length} elements`);
    }
    
    /**
     * Test timeline functionality
     */
    testTimeline() {
        console.log('🧪 Testing timeline functionality...');
        
        if (!this.timeline) {
            console.error('❌ No timeline found');
            return;
        }
        
        console.log('⏱️ Timeline duration:', this.timeline.duration());
        console.log('📊 Timeline progress:', this.timeline.progress());
        console.log('🎮 Timeline paused:', this.timeline.paused());
        
        // Test basic seek
        this.timeline.seek(1);
        console.log('✅ Seek to 1 second - OK');
        
        // Test play for 1 second then pause
        this.timeline.play();
        setTimeout(() => {
            this.timeline.pause();
            console.log('✅ Play/pause test - OK');
        }, 1000);
    }
    
    // Emergency function to fix icon visibility issues - ENHANCED VERSION
    forceIconsVisible() {
        console.log('🚨 Emergency: Forcing icons to be visible...');
        
        // Force top icon visible
        if (this.templateObjects.topIcon) {
            this.templateObjects.topIcon.opacity(1);
            this.templateObjects.topIcon.visible(true);
            console.log('✅ Top icon forced visible');
        } else {
            console.log('❌ No top icon object found');
        }
        
        // Force bottom icons visible
        if (this.templateObjects.bottomIcons && Array.isArray(this.templateObjects.bottomIcons)) {
            this.templateObjects.bottomIcons.forEach((icon, index) => {
                if (icon) {
                    icon.opacity(1);
                    icon.visible(true);
                    icon.scaleX(1);
                    icon.scaleY(1);
                    console.log(`✅ Bottom icon ${index + 1} forced visible`);
                } else {
                    console.log(`❌ Bottom icon ${index + 1} not found`);
                }
            });
        } else {
            console.log('❌ No bottom icons array found');
        }
        
        // Force redraw
        this.stage.batchDraw();
        console.log('✅ Stage redrawn with forced visible icons');
    }
    
    // Debug method to check icon states
    debugIconStates() {
        console.log('🔍 Debugging icon states...');
        
        if (this.templateObjects.topIcon) {
            console.log('Top Icon:', {
                x: this.templateObjects.topIcon.x(),
                y: this.templateObjects.topIcon.y(),
                opacity: this.templateObjects.topIcon.opacity(),
                visible: this.templateObjects.topIcon.visible(),
                scaleX: this.templateObjects.topIcon.scaleX(),
                scaleY: this.templateObjects.topIcon.scaleY()
            });
        } else {
            console.log('❌ Top icon not found');
        }
        
        if (this.templateObjects.bottomIcons) {
            console.log(`Bottom Icons (${this.templateObjects.bottomIcons.length} total):`);
            this.templateObjects.bottomIcons.forEach((icon, index) => {
                if (icon) {
                    console.log(`  Icon ${index + 1}:`, {
                        x: icon.x(),
                        y: icon.y(),
                        opacity: icon.opacity(),
                        visible: icon.visible(),
                        scaleX: icon.scaleX(),
                        scaleY: icon.scaleY()
                    });
                } else {
                    console.log(`  Icon ${index + 1}: ❌ null/undefined`);
                }
            });
        } else {
            console.log('❌ Bottom icons array not found');
        }
        
        console.log('Layer visibility settings:', this.layerVisibility);
    }
    
    updateGSAPTimeline() {
        // Preserve current timeline state before recreation
        const currentProgress = this.timeline ? this.timeline.progress() : 0;
        const wasPlaying = this.isPlaying;
        
        // Recreate the timeline with new objects
        this.createGSAPTimeline();
        
        // Restore timeline position and state
        if (this.timeline && currentProgress > 0) {
            this.timeline.progress(currentProgress);
            this.stage.batchDraw();
            
            // Resume playback if it was playing
            if (wasPlaying) {
                this.timeline.play();
                this.updateTimelinePosition();
            }
        }
    }
    
    setupCanvasInteraction() {
        // Make objects selectable
        const selectableObjects = [
            this.templateObjects.topIcon,
            this.templateObjects.topTitle,
            this.templateObjects.mainTitle,
            this.templateObjects.subtitle1,
            this.templateObjects.subtitle2,
            ...this.templateObjects.bottomIcons
        ].filter(obj => obj); // Filter out null objects
        
        selectableObjects.forEach(obj => {
            obj.on('click', () => {
                this.selectCanvasObject(obj);
            });
            
            obj.on('mouseenter', () => {
                this.stage.container().style.cursor = 'pointer';
            });
            
            obj.on('mouseleave', () => {
                this.stage.container().style.cursor = 'default';
            });
        });
    }
    
    selectCanvasObject(object) {
        // Remove previous selection
        this.clearSelection();
        
        // Add selection indicator
        const selectionRect = new Konva.Rect({
            x: object.x() - 5,
            y: object.y() - 5,
            width: object.width() + 10,
            height: object.height() + 10,
            stroke: '#0066FF',
            strokeWidth: 2,
            dash: [5, 5],
            listening: false,
            name: 'selection'
        });
        
        this.uiLayer.add(selectionRect);
        this.stage.batchDraw();
        
        // Layer selection in timeline - REMOVED (layer panels no longer in UI)
        /*
        if (object === this.templateObjects.topIcon) {
            this.selectLayer(document.querySelector('.layer-item[data-layer="top-icon"]'));
        } else if (object === this.templateObjects.topTitle) {
            this.selectLayer(document.querySelector('.layer-item[data-layer="top-title"]'));
        } else if (object === this.templateObjects.mainTitle) {
            this.selectLayer(document.querySelector('.layer-item[data-layer="main-title"]'));
        } else if (object === this.templateObjects.subtitle1) {
            this.selectLayer(document.querySelector('.layer-item[data-layer="subtitle1"]'));
        } else if (object === this.templateObjects.subtitle2) {
            this.selectLayer(document.querySelector('.layer-item[data-layer="subtitle2"]'));
        } else if (this.templateObjects.bottomIcons.includes(object)) {
            this.selectLayer(document.querySelector('.layer-item[data-layer="bottom-icons"]'));
        }
        */
        
        console.log('Canvas object selected:', object.getClassName());
    }
    
    clearSelection() {
        // Remove selection indicators
        this.uiLayer.find('.selection').forEach(node => node.destroy());
        this.stage.batchDraw();
    }
    
    // Rendering
    renderDefaultTemplate() {
        // GSAP now handles all animations, just trigger a redraw
        if (this.stage) {
            this.stage.batchDraw();
        }
    }
    
    updateTemplateProperties() {
        if (!this.stage) return;
        
        // Update font family for all text objects
        const fontFamily = document.getElementById('font-family')?.value || 'Wix Madefor Display';
        
        // Update font family for all text objects
        if (this.templateObjects.topTitle) {
            this.templateObjects.topTitle.fontFamily(fontFamily);
        }
        if (this.templateObjects.mainTitle) {
            this.templateObjects.mainTitle.fontFamily(fontFamily);
        }
        if (this.templateObjects.subtitle1) {
            this.templateObjects.subtitle1.fontFamily(fontFamily);
        }
        if (this.templateObjects.subtitle2) {
            this.templateObjects.subtitle2.fontFamily(fontFamily);
        }
        
        // Update offset for center alignment
        this.updateTextCentering();
        
        // Redraw stage
        this.stage.batchDraw();
        
        console.log('Template properties updated');
    }
    
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    // File Operations
    handleIconUpload(targetType = 'top', slotIndex = null) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.png,.svg,.gif';
        input.style.display = 'none';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processIconUpload(file, targetType, slotIndex);
            }
        });
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
    
    processIconUpload(file, targetType, slotIndex) {
        // Validate file
        if (!this.validateIconFile(file)) {
            return;
        }
        
        console.log(`Processing icon upload: ${file.name} for ${targetType}${slotIndex !== null ? ` slot ${slotIndex}` : ''}`);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const iconData = {
                name: file.name,
                type: file.type,
                data: e.target.result,
                size: file.size
            };
            
            // Store the uploaded icon
            if (targetType === 'top') {
                this.uploadedIcons.top = iconData;
                this.updateTopIconWithUpload(iconData);
            } else if (targetType === 'bottom' && slotIndex !== null) {
                this.uploadedIcons.bottom[slotIndex] = iconData;
                this.updateBottomIconWithUpload(iconData, slotIndex);
            }
            
            // Update the UI to show the uploaded icon
            this.updateIconPreview(targetType, slotIndex, iconData);
        };
        
        reader.readAsDataURL(file);
    }
    
    validateIconFile(file) {
        const maxSize = 2 * 1024 * 1024; // 2MB
        const allowedTypes = ['image/png', 'image/svg+xml', 'image/gif'];
        
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PNG, SVG, or GIF file.');
            return false;
        }
        
        if (file.size > maxSize) {
            alert('File size must be less than 2MB.');
            return false;
        }
        
        return true;
    }
    
    updateIconPreview(targetType, slotIndex, iconData) {
        if (targetType === 'top') {
            // Find and update the top icon preview area
            const previewArea = document.querySelector('.icon-presets');
            if (previewArea) {
                // Add uploaded icon to preset gallery or create a special uploaded section
                this.addUploadedIconToPresets(iconData, 'top');
            }
        } else if (targetType === 'bottom') {
            // Update the specific bottom icon slot
            const slot = document.querySelector(`[data-slot="${slotIndex}"] .current-icon`);
            if (slot && iconData.type === 'image/svg+xml') {
                // For SVG, we can display directly
                fetch(iconData.data)
                    .then(response => response.text())
                    .then(svgContent => {
                        slot.innerHTML = svgContent;
                    });
            } else if (slot) {
                // For PNG/GIF, create an img element
                slot.innerHTML = `<img src="${iconData.data}" alt="${iconData.name}" style="width: 24px; height: 24px; object-fit: contain;">`;
            }
        }
    }
    
    addUploadedIconToPresets(iconData, targetType) {
        const presetGrid = document.querySelector('.icon-grid');
        if (!presetGrid) return;
        
        // Remove existing uploaded icon if any
        const existingUploaded = presetGrid.querySelector('.icon-preset[data-uploaded="true"]');
        if (existingUploaded) {
            existingUploaded.remove();
        }
        
        // Create new uploaded icon preset
        const uploadedPreset = document.createElement('button');
        uploadedPreset.className = 'icon-preset';
        uploadedPreset.setAttribute('data-icon', 'uploaded');
        uploadedPreset.setAttribute('data-uploaded', 'true');
        uploadedPreset.setAttribute('aria-label', `Uploaded: ${iconData.name}`);
        
        if (iconData.type === 'image/svg+xml') {
            // For SVG, we can embed directly
            fetch(iconData.data)
                .then(response => response.text())
                .then(svgContent => {
                    uploadedPreset.innerHTML = svgContent;
                });
        } else {
            // For PNG/GIF, use img element
            uploadedPreset.innerHTML = `<img src="${iconData.data}" alt="${iconData.name}" style="width: 24px; height: 24px; object-fit: contain;">`;
        }
        
        // Add click handler
        uploadedPreset.addEventListener('click', () => {
            // Clear other selections
            document.querySelectorAll('.icon-preset').forEach(preset => preset.classList.remove('active'));
            uploadedPreset.classList.add('active');
            
            // Update the icon
            if (targetType === 'top') {
                this.updateTopIconWithUpload(iconData);
            }
        });
        
        // Add to preset grid
        presetGrid.appendChild(uploadedPreset);
    }

    // Icon Gallery Integration Methods
    updateTopIconFromGallery(iconData) {
        console.log('🎨 Updating top icon from gallery:', iconData);
        
        if (!iconData) {
            console.warn('❌ Cannot update top icon - missing icon data');
            return;
        }
        
        // Store the icon data for future color updates
        this.currentTopIconData = iconData;
        
        // Remove existing top icon if it exists
        if (this.templateObjects.topIcon) {
            this.templateObjects.topIcon.destroy();
            this.templateObjects.topIcon = null;
        }
        
        // Create new icon from SVG file
        this.createSVGTopIconFromGallery(iconData);
    }
    
    updateBottomIconFromGallery(iconData, slotIndex) {
        console.log(`🎨 Updating bottom icon ${slotIndex + 1} from gallery:`, iconData);
        
        if (!iconData || slotIndex < 0) {
            console.warn('❌ Cannot update bottom icon - missing data or invalid slot');
            return;
        }
        
        // Store the icon data for future color updates
        if (!this.currentBottomIconsData) {
            this.currentBottomIconsData = [null, null, null, null, null, null];
        }
        this.currentBottomIconsData[slotIndex] = iconData;
        
        // Ensure bottom icons array exists and has enough slots
        if (!this.templateObjects.bottomIcons) {
            this.templateObjects.bottomIcons = [];
        }
        
        // Extend array if needed
        while (this.templateObjects.bottomIcons.length <= slotIndex) {
            this.templateObjects.bottomIcons.push(null);
        }
        
        // Remove existing icon at this slot
        if (this.templateObjects.bottomIcons[slotIndex]) {
            this.templateObjects.bottomIcons[slotIndex].destroy();
            this.templateObjects.bottomIcons[slotIndex] = null;
        }
        
        // Create new icon from SVG file
        this.createSVGBottomIconFromGallery(iconData, slotIndex);
    }
    
    async createSVGTopIconFromGallery(iconData) {
        console.log('🔧 Creating top icon from gallery:', iconData.fullPath);
        
        try {
            // Load SVG content
            const response = await fetch(iconData.fullPath);
            if (!response.ok) {
                throw new Error(`Failed to load icon: ${response.status}`);
            }
            
            const svgContent = await response.text();
            console.log('📄 SVG content loaded, length:', svgContent.length);
            
            // Get current text color
            const currentTextColor = this.getCurrentTextColor();
            console.log('🎨 Current text color:', currentTextColor);
            
            // Modify SVG content to use the desired color
            const colorizedSVG = this.colorizeReferenceSVG(svgContent, currentTextColor);
            console.log('🖌️ SVG colorized');
            
            // Create blob URL for the colorized SVG
            const blob = new Blob([colorizedSVG], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            console.log('🔗 Blob URL created:', url);
            
            // Create image element and load
            const img = new Image();
            img.onload = () => {
                console.log('🖼️ Image loaded successfully, creating Konva object...');
                
                // Use base position system if available, otherwise use default Y
                let iconY = 200;
                if (this.positionStates.base && this.positionStates.base.topIcon) {
                    iconY = this.positionStates.base.topIcon.y;
                    console.log(`🎯 Using dynamic Y position from base position system: ${iconY}`);
                } else {
                    console.log(`⚠️ Using fallback Y position: ${iconY}`);
                }
                
                this.templateObjects.topIcon = new Konva.Image({
                    x: 960,
                    y: iconY,
                    image: img,
                    width: 56,
                    height: 56,
                    offsetX: 28,
                    offsetY: 28,
                    listening: true
                });
                
                console.log('📝 Adding to layer and updating stage...');
                this.contentLayer.add(this.templateObjects.topIcon);
                this.stage.batchDraw();
                this.updateGSAPTimeline();
                
                // Clean up blob URL
                URL.revokeObjectURL(url);
                
                console.log(`✅ Top icon updated with ${iconData.originalName}`);
            };
            
            img.onerror = (e) => {
                console.error(`❌ Failed to load top icon image: ${iconData.originalName}`, e);
                URL.revokeObjectURL(url);
            };
            
            console.log('🚀 Setting image source...');
            img.src = url;
            
        } catch (error) {
            console.error('❌ Failed to create top icon from gallery:', error);
        }
    }
    
    async createSVGBottomIconFromGallery(iconData, slotIndex) {
        try {
            // Load SVG content
            const response = await fetch(iconData.fullPath);
            if (!response.ok) {
                throw new Error(`Failed to load icon: ${response.status}`);
            }
            
            const svgContent = await response.text();
            
            // Get current text color
            const currentTextColor = this.getCurrentTextColor();
            
            // Modify SVG content to use the desired color
            const colorizedSVG = this.colorizeReferenceSVG(svgContent, currentTextColor);
            
            // Create blob URL for the colorized SVG
            const blob = new Blob([colorizedSVG], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            // Create image element and load
            const img = new Image();
            img.onload = () => {
                const iconPositions = this.calculateIconPositions(this.bottomIconsConfig.count);
                let iconY = this.bottomIconsY || 820;
                
                // Use dynamic position from base position system if available
                if (this.positionStates.base && this.positionStates.base.bottomIcons) {
                    iconY = this.positionStates.base.bottomIcons.y;
                }
                
                const icon = new Konva.Image({
                    x: iconPositions[slotIndex],
                    y: iconY,
                    image: img,
                    width: 40,
                    height: 40,
                    offsetX: 20,
                    offsetY: 20,
                    listening: true
                });
                
                this.templateObjects.bottomIcons[slotIndex] = icon;
                this.contentLayer.add(icon);
                this.stage.batchDraw();
                this.updateGSAPTimeline();
                
                // Clean up blob URL
                URL.revokeObjectURL(url);
                
                console.log(`✅ Bottom icon ${slotIndex + 1} updated with ${iconData.originalName}`);
            };
            
            img.onerror = () => {
                console.error(`❌ Failed to load bottom icon image: ${iconData.originalName}`);
                URL.revokeObjectURL(url);
            };
            
            img.src = url;
            
        } catch (error) {
            console.error(`❌ Failed to create bottom icon ${slotIndex + 1} from gallery:`, error);
        }
    }
    
    saveProject() {
        const projectData = {
            name: document.querySelector('.project-name').textContent,
            template: document.querySelector('.template-badge').textContent,
            mainText: document.getElementById('main-text').value,
            subtitle: document.getElementById('subtitle-text').value,
            fontSize: document.getElementById('font-size').value,
            fontFamily: document.getElementById('font-family').value,
            fontWeight: document.getElementById('font-weight').value,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('wix-video-project', JSON.stringify(projectData));
        
        // Update save indicator
        const saveStatus = document.querySelector('.save-status');
        saveStatus.textContent = 'Saving...';
        
        setTimeout(() => {
            saveStatus.textContent = 'Auto-saved';
        }, 1000);
        
        console.log('Project saved', projectData);
    }
    
    saveProjectName(name) {
        console.log(`Project name updated: ${name}`);
        this.saveProject();
    }
    
    setupExportDropdown() {
        const exportBtn = document.querySelector('.export-btn');
        const exportDropdown = document.querySelector('.export-dropdown');
        const exportOptions = document.querySelectorAll('.export-option');
        const exportModal = document.getElementById('export-modal');
        const exportModalClose = document.querySelector('.export-modal-close');
        const exportCancelBtn = document.getElementById('export-cancel-btn');
        const exportStartBtn = document.getElementById('export-start-btn');
        
        // Toggle dropdown
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = exportDropdown.classList.contains('open');
            exportDropdown.classList.toggle('open', !isOpen);
            exportBtn.setAttribute('aria-expanded', !isOpen);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            exportDropdown.classList.remove('open');
            exportBtn.setAttribute('aria-expanded', 'false');
        });
        
        // Handle export format selection
        exportOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const format = option.dataset.format;
                this.openExportModal(format);
                exportDropdown.classList.remove('open');
                exportBtn.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Modal close handlers
        exportModalClose.addEventListener('click', () => this.closeExportModal());
        exportCancelBtn.addEventListener('click', () => this.closeExportModal());
        exportStartBtn.addEventListener('click', () => this.startExport());
        
        // Close modal on backdrop click
        exportModal.addEventListener('click', (e) => {
            if (e.target === exportModal) {
                this.closeExportModal();
            }
        });
        
        // Prevent modal content clicks from closing modal
        document.querySelector('.export-modal-content').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    openExportModal(format) {
        this.currentExportFormat = format;
        const modal = document.getElementById('export-modal');
        const formatIcon = document.getElementById('export-format-icon');
        const formatTitle = document.getElementById('export-format-title');
        const formatDescription = document.getElementById('export-format-description');
        const formatSpec = document.getElementById('export-spec-format');
        
        // Reset modal state
        document.getElementById('export-progress').style.display = 'none';
        document.getElementById('export-complete').style.display = 'none';
        document.querySelector('.export-format-info').style.display = 'flex';
        document.querySelector('.export-modal-footer').style.display = 'flex';
        
        // Update modal content based on format
        if (format === 'mp4') {
            formatIcon.innerHTML = `
                <rect x="2" y="3" width="20" height="12" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                <path d="M15 11L13 9.5L12 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            `;
            formatTitle.textContent = 'Export as MP4';
            formatDescription.textContent = 'High-quality video file perfect for social media, presentations, and web use.';
            formatSpec.textContent = '30 FPS • H.264';
        } else {
            formatIcon.innerHTML = `
                <path d="M6 2h12v20H6z" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M9 8h6M9 11h6M9 14h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M2 6v12l4-6-4-6z" fill="currentColor"/>
            `;
            formatTitle.textContent = 'Export PNG Sequence';
            formatDescription.textContent = 'Individual frame images with transparency support, perfect for compositing and editing.';
            formatSpec.textContent = '300 Frames • Alpha Channel';
        }
        
        // Show modal
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        document.getElementById('export-start-btn').focus();
    }
    
    closeExportModal() {
        const modal = document.getElementById('export-modal');
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        
        // Cancel any ongoing export
        if (this.exportCancelled !== undefined) {
            this.exportCancelled = true;
        }
    }
    
    async startExport() {
        // Hide initial UI and show progress
        document.querySelector('.export-format-info').style.display = 'none';
        document.querySelector('.export-modal-footer').style.display = 'none';
        document.getElementById('export-progress').style.display = 'block';
        
        this.exportCancelled = false;
        
        try {
            if (this.currentExportFormat === 'mp4') {
                await this.exportMP4();
            } else {
                await this.exportPNGSequence();
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showExportError(error.message);
        }
    }
    
    async exportMP4() {
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        const progressFrame = document.querySelector('.progress-frame');
        const progressEta = document.querySelector('.progress-eta');
        const progressLabel = document.querySelector('.progress-label');
        
        progressLabel.textContent = 'Rendering video frames...';
        
        // Create offscreen canvas for rendering
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1920;
        canvas.height = 1080;
        
        // MediaRecorder setup for WebM (browsers don't support MP4 recording directly)
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });
        
        const chunks = [];
        let startTime = Date.now();
        
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            this.downloadBlob(blob, 'wix-video-export.webm');
            this.showExportComplete('Your video has been exported as WebM format.');
        };
        
        mediaRecorder.start();
        
        // Render each frame
        for (let frame = 0; frame < this.totalFrames; frame++) {
            if (this.exportCancelled) {
                mediaRecorder.stop();
                return;
            }
            
            // Update timeline to current frame
            const timelineTime = (frame / this.totalFrames) * this.animationDuration;
            this.timeline.seek(timelineTime);
            
            // Render stage to canvas
            const stageCanvas = this.stage.getCanvas()._canvas;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(stageCanvas, 0, 0);
            
            // Update progress
            const progress = ((frame + 1) / this.totalFrames) * 100;
            progressFill.style.width = `${progress}%`;
            progressPercentage.textContent = `${Math.round(progress)}%`;
            progressFrame.textContent = `Frame ${frame + 1} of ${this.totalFrames}`;
            
            // Calculate ETA
            const elapsed = Date.now() - startTime;
            const eta = (elapsed / (frame + 1)) * (this.totalFrames - frame - 1);
            progressEta.textContent = `Estimated time remaining: ${this.formatTime(eta)}`;
            
            // Allow UI to update
            await new Promise(resolve => setTimeout(resolve, 1));
        }
        
        mediaRecorder.stop();
    }
    
    async exportPNGSequence() {
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        const progressFrame = document.querySelector('.progress-frame');
        const progressEta = document.querySelector('.progress-eta');
        const progressLabel = document.querySelector('.progress-label');
        
        progressLabel.textContent = 'Generating PNG frames...';
        
        // Use JSZip to create a zip file
        const JSZip = window.JSZip || await this.loadJSZip();
        const zip = new JSZip();
        
        let startTime = Date.now();
        
        // Render each frame
        for (let frame = 0; frame < this.totalFrames; frame++) {
            if (this.exportCancelled) {
                return;
            }
            
            // Update timeline to current frame
            const timelineTime = (frame / this.totalFrames) * this.animationDuration;
            this.timeline.seek(timelineTime);
            this.stage.batchDraw();
            
            // Get canvas data URL with alpha channel
            const dataURL = this.stage.toDataURL({
                mimeType: 'image/png',
                quality: 1,
                pixelRatio: 1
            });
            
            // Convert data URL to blob and add to zip
            const response = await fetch(dataURL);
            const blob = await response.blob();
            const filename = `frame_${String(frame + 1).padStart(4, '0')}.png`;
            zip.file(filename, blob);
            
            // Update progress
            const progress = ((frame + 1) / this.totalFrames) * 100;
            progressFill.style.width = `${progress}%`;
            progressPercentage.textContent = `${Math.round(progress)}%`;
            progressFrame.textContent = `Frame ${frame + 1} of ${this.totalFrames}`;
            
            // Calculate ETA
            const elapsed = Date.now() - startTime;
            const eta = (elapsed / (frame + 1)) * (this.totalFrames - frame - 1);
            progressEta.textContent = `Estimated time remaining: ${this.formatTime(eta)}`;
            
            // Allow UI to update every 10 frames
            if (frame % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        // Generate and download zip file
        progressLabel.textContent = 'Creating download package...';
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.downloadBlob(zipBlob, 'wix-video-frames.zip');
        this.showExportComplete('Your PNG sequence has been exported with alpha channel support.');
    }
    
    async loadJSZip() {
        // Load JSZip dynamically
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = () => resolve(window.JSZip);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    showExportComplete(message) {
        document.getElementById('export-progress').style.display = 'none';
        document.getElementById('export-complete').style.display = 'block';
        document.getElementById('export-complete-message').textContent = message;
        
        // Setup download button (in case user wants to download again)
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.onclick = () => {
            this.closeExportModal();
        };
    }
    
    showExportError(message) {
        // Reset to initial state and show error
        document.getElementById('export-progress').style.display = 'none';
        document.querySelector('.export-format-info').style.display = 'flex';
        document.querySelector('.export-modal-footer').style.display = 'flex';
        
        alert(`Export failed: ${message}`);
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }
    
    // Load saved project on initialization
    loadProject() {
        const savedProject = localStorage.getItem('wix-video-project');
        if (savedProject) {
            const projectData = JSON.parse(savedProject);
            
            document.querySelector('.project-name').textContent = projectData.name || 'Untitled Project';
            document.getElementById('main-text').value = projectData.mainText || 'Welcome to Wix';
            document.getElementById('subtitle-text').value = projectData.subtitle || 'Create Amazing Videos';
            document.getElementById('font-size').value = projectData.fontSize || '72';
            document.getElementById('font-family').value = projectData.fontFamily || 'Wix Madefor Text';
            document.getElementById('font-weight').value = projectData.fontWeight || '600';
            
            // Update slider display
            document.querySelector('.slider-value').textContent = projectData.fontSize + 'px' || '72px';
            
            console.log('Project loaded', projectData);
        }
    }
    
    calculateDynamicMainTitleFontSize(text) {
        // Remove line breaks and count actual characters
        const cleanText = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
        const charCount = cleanText.length;
        
        let fontSize;
        
        // Character-based scaling with distinct size tiers
        if (charCount <= 1) {
            // Single character - maximum impact
            fontSize = 450;
        } else if (charCount <= 2) {
            // Two characters - very large
            fontSize = 400;
        } else if (charCount <= 3) {
            // Three characters - large
            fontSize = 350;
        } else if (charCount <= 5) {
            // Short words (4-5 chars) - medium-large
            fontSize = 280;
        } else if (charCount <= 8) {
            // Medium words (6-8 chars) - medium
            fontSize = 220;
        } else if (charCount <= 12) {
            // Longer words (9-12 chars) - smaller
            fontSize = 180;
        } else if (charCount <= 16) {
            // Long phrases (13-16 chars) - small
            fontSize = 150;
        } else if (charCount <= 20) {
            // Very long phrases (17-20 chars) - very small
            fontSize = 130;
        } else {
            // Extra long text (21+ chars) - minimum readable
            fontSize = 120;
        }
        
        console.log(`Character count: ${charCount} → Font size: ${fontSize}px`);
        
        return fontSize;
    }

    // Project integration method
    loadProjectData() {
        const projectIntegration = window.projectIntegration;
        if (!projectIntegration || !projectIntegration.currentProject) {
            console.log('No project integration or project available');
            return;
        }

        const project = projectIntegration.currentProject;
        console.log('Loading project data:', project.name, 'Version:', project.config?.version || 'unknown');

        // Wait for template objects to be ready
        if (!this.templateObjects || !this.templateObjects.mainTitle) {
            console.log('Template objects not ready, retrying in 200ms...');
            setTimeout(() => this.loadProjectData(), 200);
            return;
        }

        try {
            if (!project.config) {
                console.warn('Project has no config data');
                return;
            }

            console.log('Loading project config:', project.config);

            // Load text values first (form inputs)
            if (project.config.texts) {
                const inputs = {
                    topTitle: document.getElementById('top-title'),
                    mainTitle: document.getElementById('main-title'),
                    subtitle1: document.getElementById('subtitle1'),
                    subtitle2: document.getElementById('subtitle2')
                };

                // Update form inputs
                Object.keys(inputs).forEach(key => {
                    if (inputs[key] && project.config.texts[key]) {
                        inputs[key].value = project.config.texts[key];
                        console.log(`Loaded ${key}:`, project.config.texts[key]);
                    }
                });

                // Update template objects with proper delay to ensure rendering
                setTimeout(() => {
                    Object.keys(project.config.texts).forEach(key => {
                        if (project.config.texts[key]) {
                            this.updateText(key, project.config.texts[key]);
                        }
                    });
                    
                    // Force redraw after text updates
                    this.stage.batchDraw();
                }, 100);
            }

            // Load colors with correct method names
            if (project.config.colors) {
                if (project.config.colors.text) {
                    console.log('Loading text color:', project.config.colors.text);
                    this.updateColor('Text Color', project.config.colors.text);
                    
                    // Also update the UI color swatch
                    const textColorSwatch = document.querySelector(`[data-color="${project.config.colors.text}"]`);
                    if (textColorSwatch) {
                        // Remove active from all text color swatches
                        document.querySelectorAll('.color-group:first-child .color-swatch').forEach(s => s.classList.remove('active'));
                        textColorSwatch.classList.add('active');
                    }
                }
                if (project.config.colors.background) {
                    console.log('Loading background color:', project.config.colors.background);
                    this.updateColor('Background Color', project.config.colors.background);
                    
                    // Update background color swatch
                    const bgColorSwatch = document.querySelector(`.color-group:last-child [data-color="${project.config.colors.background}"]`);
                    if (bgColorSwatch) {
                        document.querySelectorAll('.color-group:last-child .color-swatch').forEach(s => s.classList.remove('active'));
                        bgColorSwatch.classList.add('active');
                    }
                }
            }

            // Load visibility settings
            if (project.config.visibility) {
                Object.keys(project.config.visibility).forEach(layer => {
                    this.layerVisibility[layer] = project.config.visibility[layer];
                    this.updateLayerVisibility(layer);
                    
                    // Update visibility toggle UI
                    const toggle = document.querySelector(`[data-layer="${layer}"]`);
                    if (toggle && toggle.type === 'checkbox') {
                        toggle.checked = project.config.visibility[layer];
                    }
                });
            }

            // Load icon configurations with new structure
            if (project.config.iconConfig) {
                if (project.config.iconConfig.topIcon) {
                    this.topIconConfig = { ...this.topIconConfig, ...project.config.iconConfig.topIcon };
                }
                if (project.config.iconConfig.bottomIcons) {
                    this.bottomIconsConfig = { ...this.bottomIconsConfig, ...project.config.iconConfig.bottomIcons };
                    
                    // Update UI slider if exists
                    const iconCountSlider = document.getElementById('icon-count');
                    if (iconCountSlider && project.config.iconConfig.bottomIcons.count) {
                        iconCountSlider.value = project.config.iconConfig.bottomIcons.count;
                        const valueDisplay = iconCountSlider.nextElementSibling;
                        if (valueDisplay) valueDisplay.textContent = project.config.iconConfig.bottomIcons.count;
                    }
                }
            }

            // Load editor state
            if (project.config.editorState) {
                if (typeof project.config.editorState.isTransparent !== 'undefined') {
                    this.setBackgroundTransparency(project.config.editorState.isTransparent);
                }
                if (project.config.editorState.currentFrame) {
                    this.currentFrame = project.config.editorState.currentFrame;
                }
                if (project.config.editorState.zoomLevel) {
                    this.zoomLevel = project.config.editorState.zoomLevel;
                }
            }

            // Final refresh after all data is loaded
            setTimeout(() => {
                this.recalculateLayout();
                this.stage.batchDraw();
                console.log('✅ Project data loaded successfully');
            }, 200);

            // Schedule auto-save for future changes (only once)
            if (projectIntegration.scheduleAutoSave && !this._autoSaveSetup) {
                const formInputs = document.querySelectorAll('#top-title, #main-title, #subtitle1, #subtitle2');
                formInputs.forEach(input => {
                    input.addEventListener('input', projectIntegration.scheduleAutoSave);
                });
                
                // Add color swatch listeners for auto-save
                const colorSwatches = document.querySelectorAll('.color-swatch');
                colorSwatches.forEach(swatch => {
                    swatch.addEventListener('click', projectIntegration.scheduleAutoSave);
                });
                
                this._autoSaveSetup = true; // Prevent duplicate event listeners
                console.log('Auto-save listeners setup complete');
            }

        } catch (error) {
            console.error('❌ Failed to load project data:', error);
        }
    }

    // Note: Thumbnail generation is now handled directly in the save function
    // using simple canvas capture - see template_001.html saveCurrentProject()
    
    // Emergency function to fix icon visibility issues
    forceIconsVisible() {
        console.log('🚨 Emergency: Forcing icons to be visible...');
        
        // Force top icon visible
        if (this.templateObjects.topIcon) {
            this.templateObjects.topIcon.opacity(1);
            this.templateObjects.topIcon.visible(true);
            console.log('✅ Top icon forced visible');
        } else {
            console.log('❌ No top icon object found');
        }
        
        // Force bottom icons visible
        if (this.templateObjects.bottomIcons && Array.isArray(this.templateObjects.bottomIcons)) {
            this.templateObjects.bottomIcons.forEach((icon, index) => {
                if (icon) {
                    icon.opacity(1);
                    icon.visible(true);
                    icon.scaleX(1);
                    icon.scaleY(1);
                    console.log(`✅ Bottom icon ${index + 1} forced visible`);
                } else {
                    console.log(`❌ Bottom icon ${index + 1} not found`);
                }
            });
        } else {
            console.log('❌ No bottom icons array found');
        }
        
        // Force redraw
        this.stage.batchDraw();
        console.log('✅ Stage redrawn with forced visible icons');
    }
    
    // Debug method to check icon states
    debugIconStates() {
        console.log('🔍 Debugging icon states...');
        
        if (this.templateObjects.topIcon) {
            console.log('Top Icon:', {
                x: this.templateObjects.topIcon.x(),
                y: this.templateObjects.topIcon.y(),
                opacity: this.templateObjects.topIcon.opacity(),
                visible: this.templateObjects.topIcon.visible(),
                scaleX: this.templateObjects.topIcon.scaleX(),
                scaleY: this.templateObjects.topIcon.scaleY()
            });
        } else {
            console.log('❌ Top icon not found');
        }
        
        if (this.templateObjects.bottomIcons) {
            console.log(`Bottom Icons (${this.templateObjects.bottomIcons.length} total):`);
            this.templateObjects.bottomIcons.forEach((icon, index) => {
                if (icon) {
                    console.log(`  Icon ${index + 1}:`, {
                        x: icon.x(),
                        y: icon.y(),
                        opacity: icon.opacity(),
                        visible: icon.visible(),
                        scaleX: icon.scaleX(),
                        scaleY: icon.scaleY()
                    });
                } else {
                    console.log(`  Icon ${index + 1}: ❌ null/undefined`);
                }
            });
        } else {
            console.log('❌ Bottom icons array not found');
        }
        
        console.log('Layer visibility settings:', this.layerVisibility);
    }
}

// Initialize the application when DOM is loaded with proper font loading
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing fonts with kerning support...');
    
    try {
        // Load fonts with specific weights and enable kerning
        await document.fonts.load('normal 400 64px "Wix Madefor Display"');
        await document.fonts.load('normal 800 180px "Wix Madefor Display"');
        await document.fonts.load('normal 700 75px "Wix Madefor Display"');
        await document.fonts.load('normal 400 40px "Wix Madefor Display"');
        await document.fonts.ready;
        
        // Verify fonts are loaded with proper weights
        const fontChecks = [
            document.fonts.check('400 64px "Wix Madefor Display"'),
            document.fonts.check('800 180px "Wix Madefor Display"'),
            document.fonts.check('700 75px "Wix Madefor Display"'),
            document.fonts.check('400 40px "Wix Madefor Display"')
        ];
        console.log('Font loading status:', fontChecks);
        
        // Enhanced pre-rendering with kerning support
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set proper text baseline and alignment for consistent rendering
        tempCtx.textBaseline = 'alphabetic';
        tempCtx.textAlign = 'left';
        
        // Pre-render different font weights to ensure Canvas recognizes them
        const testTexts = ['COMPANY', 'AWESOME', 'MAIN TITLE'];
        const fontConfigs = [
            { weight: '400', size: '64px' },
            { weight: '700', size: '75px' },
            { weight: '800', size: '180px' }
        ];
        
        fontConfigs.forEach(config => {
            tempCtx.font = `${config.weight} ${config.size} "Wix Madefor Display"`;
            testTexts.forEach(text => {
                tempCtx.fillText(text, 0, 0);
            });
        });
        
        // Longer delay to ensure proper font registration
        await new Promise(resolve => setTimeout(resolve, 300));
        tempCanvas.remove();
        
        console.log('Fonts with kerning loaded and pre-rendered successfully');
        
        const editor = new TemplateEditor();
        
        // Expose globally for project integration
        window.templateEditor = editor;
        
        // Remove old auto-save and project loading - handled by project integration now
        console.log('Template Editor exposed globally');
        
    } catch (error) {
        console.error('Enhanced font loading failed:', error);
        // Continue anyway with fallback fonts
        const editor = new TemplateEditor();
        
        // Expose globally for project integration
        window.templateEditor = editor;
        console.log('Template Editor exposed globally (fallback)');
    }
}); 

// NOTE FOR CLAUDE: Save Preset functionality - connect this to backend when ready
// This button should capture the current template state and save it as a preset
// that can be loaded later. Include: text content, colors, icon uploads, visibility states

// Save Preset Event Listener - Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const savePresetBtn = document.getElementById('save-preset-btn');
    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', handleSavePreset);
    }
});

function handleSavePreset() {
    // TODO: Connect to backend - this function should:
    // 1. Collect current template state (text, colors, icons, settings)
    // 2. Prompt user for preset name and description
    // 3. Send to backend API to save preset
    // 4. Show success/error feedback
    
    console.log('Save Preset clicked - functionality to be implemented');
    
    // Temporary: Collect current state for demo
    const currentState = {
        templateId: 'template_001',
        name: 'Custom Preset ' + new Date().toLocaleString(),
        settings: {
            topTitle: document.getElementById('top-title')?.value || '',
            mainTitle: document.getElementById('main-title')?.value || '',
            subtitle1: document.getElementById('subtitle1')?.value || '',
            subtitle2: document.getElementById('subtitle2')?.value || '',
            fontFamily: document.getElementById('font-family')?.value || 'Wix Madefor Display',
            topIconColor: document.getElementById('top-icon-color')?.value || '#FFFFFF',
            // Add icon uploads, colors, visibility states etc.
            layerVisibility: {
                topIcon: document.getElementById('top-icon-visible')?.checked || true,
                bottomIcons: document.getElementById('bottom-icons-visible')?.checked || true
            }
        },
        timestamp: new Date().toISOString()
    };
    
    // Temporary: Save to localStorage until backend is ready
    const savedPresets = JSON.parse(localStorage.getItem('wix-video-presets') || '[]');
    savedPresets.push(currentState);
    localStorage.setItem('wix-video-presets', JSON.stringify(savedPresets));
    
    // Show user feedback
    showPresetSavedNotification();
    
    // TODO: Replace with proper modal/toast notification
    // TODO: Add preset management UI
    // TODO: Connect to backend API endpoints
}

function showPresetSavedNotification() {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'preset-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#22c55e" stroke-width="2" fill="none"/>
                <path d="M5 8l2 2 4-4" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Preset saved locally! (Backend integration pending)</span>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-secondary);
        border: 1px solid #22c55e;
        border-radius: var(--border-radius);
        padding: 12px 16px;
        color: var(--text-primary);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Helper function to get current template state
function getCurrentTemplateState() {
    // This should collect all current form values, canvas state, etc.
    // and return a complete state object that can recreate the template
    
    // TODO: Implementation needed when connecting to backend
    // Should include:
    // - All text field values
    // - Color selections
    // - Icon uploads (base64 data)
    // - Layer visibility states
    // - Icon configurations
    // - Animation settings
    
    return {
        // Implementation needed when connecting to backend
    };
}

// Helper function to load preset state
function loadPresetState(presetData) {
    // This should restore all form values, canvas state, etc.
    // from a saved preset
    
    // TODO: Implementation needed when connecting to backend
    // Should restore:
    // - All text field values
    // - Color selections
    // - Icon uploads and display
    // - Layer visibility states
    // - Icon configurations
    // - Trigger canvas redraw
}

// Add CSS animation styles for notification
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .preset-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
    }
`;
document.head.appendChild(notificationStyles);