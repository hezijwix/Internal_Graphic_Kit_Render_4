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
        
        // Layer visibility state
        this.layerVisibility = {
            topIcon: true,
            topTitle: true,
            mainTitle: true,
            subtitle1: true,
            subtitle2: true,
            bottomIcons: true
        };
        
        // Bottom icons configuration
        this.bottomIconsConfig = {
            count: 4,
            spacing: 260,
            icons: ['star', 'circle', 'arrow', 'arrow'] // Default icons
        };
        
        // Icon storage and management
        this.uploadedIcons = {
            top: null,
            bottom: [null, null, null, null] // Support up to 4 bottom icons
        };
        

        
        // GSAP Timeline
        this.timeline = null;
        this.animationDuration = 10; // seconds
        
        // Background transparency
        this.currentBackgroundColor = '#0D0D0D';
        this.isTransparent = false;
        
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
        
        console.log('Template Editor initialized successfully');
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
        
        // Layer interactions
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
                
                // Update icon type
                this.bottomIconsConfig.icons[slotIndex] = iconType;
                
                // Update UI
                slot.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('active'));
                button.classList.add('active');
                
                // Update current icon display
                const currentIcon = slot.querySelector('.current-icon');
                currentIcon.innerHTML = button.innerHTML;
                
                // Recreate bottom icons
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
                
                // Update top icon
                this.updateTopIcon(iconType);
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
            
            // If main title changed, update icon positions to match new width
            if (type === 'mainTitle' && this.layerVisibility.bottomIcons) {
                this.createBottomIconsExact();
            }
            
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
        
        // Create top icon
        if (this.layerVisibility.topIcon) {
            this.templateObjects.topIcon = new Konva.Ellipse({
                x: 960,
                y: 100,
                radiusX: 62,
                radiusY: 29,
                stroke: '#FFFFFF',
                strokeWidth: 2,
                fill: 'transparent',
                listening: true,
                visible: true
            });
            this.contentLayer.add(this.templateObjects.topIcon);
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
            shadowColor: 'rgba(0,0,0,0.25)',
            shadowBlur: 4,
            shadowOffset: { x: 0, y: 4 },
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
        
        // Set initial animation positions (everything starts hidden)
        this.setInitialPositions();
        
        // Initialize text-based visibility
        this.initializeTextVisibility();
        
        // Recalculate layout with actual text heights
        this.recalculateLayout();
        
        // Initial render
        this.stage.batchDraw();
        console.log('Template objects creation complete - matches Figma design');
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
            this.templateObjects.topIcon = new Konva.Image({
                x: 960,
                y: 200,
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
            this.templateObjects.topIcon = new Konva.Image({
                x: 960,
                y: 200,
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
        
        switch (iconType) {
            case 'circle':
                icon = new Konva.Circle({
                    x: 960,
                    y: 200,
                    radius: 28,
                    stroke: currentTextColor,
                    strokeWidth: 2,
                    listening: true
                });
                break;
            case 'star':
                icon = new Konva.Star({
                    x: 960,
                    y: 200,
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
                    y: 200,
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
                    y: 200,
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
            const iconY = this.bottomIconsY || 820;
            
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
            const iconY = this.bottomIconsY || 820;
            
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
    
    applyColorToSVGIcon(iconKonvaObject, color) {
        // For SVG icons, we can apply color filters to simulate color changes
        // This is a simplified approach - in a more advanced implementation,
        // you might want to parse and modify the SVG directly
        if (iconKonvaObject && typeof iconKonvaObject.fill === 'function') {
            iconKonvaObject.fill(color);
        }
        if (iconKonvaObject && typeof iconKonvaObject.stroke === 'function') {
            iconKonvaObject.stroke(color);
        }
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
    
    updateColor(type, color) {
        if (type === 'Text Color') {
            if (this.templateObjects.topTitle) this.templateObjects.topTitle.fill(color);
            if (this.templateObjects.mainTitle) this.templateObjects.mainTitle.fill(color);
            if (this.templateObjects.subtitle1) this.templateObjects.subtitle1.fill(color);
            if (this.templateObjects.subtitle2) this.templateObjects.subtitle2.fill(color);
            // Update top icon color to inherit text color
            if (this.templateObjects.topIcon) {
                this.applyColorToSVGIcon(this.templateObjects.topIcon, color);
            }
            // Update bottom icons color to inherit text color
            this.templateObjects.bottomIcons.forEach(icon => {
                if (icon.fill) icon.fill(color);
                if (icon.stroke) icon.stroke(color);
            });
            // Recreate bottom icons to ensure they use the new color
            this.createBottomIconsExact();
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
        
        // Create top icon (oval shape matching Figma exactly)
        if (this.layerVisibility.topIcon) {
            this.templateObjects.topIcon = new Konva.Ellipse({
                x: 960, // Center X
                y: currentY + (topIconHeight / 2),
                radiusX: 62,
                radiusY: 29,
                stroke: '#FFFFFF',
                strokeWidth: 2,
                fill: 'transparent',
                listening: true,
                visible: true
            });
            this.contentLayer.add(this.templateObjects.topIcon);
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
            shadowColor: 'rgba(0,0,0,0.25)',
            shadowBlur: 4,
            shadowOffset: { x: 0, y: 4 },
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
        
        // Set initial animation positions (everything starts hidden)
        this.setInitialPositions();
        
        // Initialize text-based visibility
        this.initializeTextVisibility();
        
        // Recalculate layout with actual text heights
        this.recalculateLayout();
        
        // Initial render
        this.stage.batchDraw();
        console.log('Template objects creation complete - matches Figma design');
    }
    
    createBottomIconsExact() {
        // Clear existing bottom icons
        this.templateObjects.bottomIcons.forEach(icon => icon.destroy());
        this.templateObjects.bottomIcons = [];
        
        if (!this.layerVisibility.bottomIcons || this.bottomIconsConfig.count === 0) {
            return;
        }
        
        console.log('Creating bottom icons with proper spacing...');
        
        // Use the calculated Y position from the layout
        const iconY = this.bottomIconsY || 820; // Fallback to 820 if not calculated
        
        // Get current text color for icons to inherit
        const currentTextColor = this.getCurrentTextColor();
        
        // Calculate dynamic positions based on main title width
        const iconPositions = this.calculateIconPositions(this.bottomIconsConfig.count);
        
        // Create icons based on Figma design
        for (let i = 0; i < Math.min(this.bottomIconsConfig.count, 4); i++) {
            let icon;
            
            switch (i) {
                case 0: // First icon - star/asterisk
                    icon = new Konva.Star({
                        x: iconPositions[i],
                        y: iconY,
                        numPoints: 8,
                        innerRadius: 20,
                        outerRadius: 28,
                        fill: currentTextColor,
                        listening: true
                    });
                    break;
                    
                case 1: // Second icon - oval/circle  
                    icon = new Konva.Ellipse({
                        x: iconPositions[i],
                        y: iconY,
                        radiusX: 31.5,
                        radiusY: 20,
                        stroke: currentTextColor,
                        strokeWidth: 2,
                        listening: true
                    });
                    break;
                    
                case 2: // Third icon - oval/circle (same as second)
                    icon = new Konva.Ellipse({
                        x: iconPositions[i],
                        y: iconY,
                        radiusX: 31.5,
                        radiusY: 20,
                        stroke: currentTextColor,
                        strokeWidth: 2,
                        listening: true
                    });
                    break;
                    
                case 3: // Fourth icon - oval/circle (same as second)
                    icon = new Konva.Ellipse({
                        x: iconPositions[i],
                        y: iconY,
                        radiusX: 31.5,
                        radiusY: 20,
                        stroke: currentTextColor,
                        strokeWidth: 2,
                        listening: true
                    });
                    break;
            }
            
            if (icon) {
                this.templateObjects.bottomIcons.push(icon);
                this.contentLayer.add(icon);
                console.log(`Bottom icon ${i + 1} created at x:${iconPositions[i]}, y:${iconY}`);
            }
        }
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
        // Set starting positions for animations - all objects start invisible for fade in
        if (this.templateObjects.topIcon) {
            this.templateObjects.topIcon.opacity(0);
        }
        
        if (this.templateObjects.topTitle) {
            this.templateObjects.topTitle.opacity(0);
        }
        
        if (this.templateObjects.mainTitle) {
            this.templateObjects.mainTitle.opacity(0);
        }
        
        if (this.templateObjects.subtitle1) {
            this.templateObjects.subtitle1.opacity(0);
        }
        
        if (this.templateObjects.subtitle2) {
            this.templateObjects.subtitle2.opacity(0);
        }
        
        // Bottom icons start invisible
        this.templateObjects.bottomIcons.forEach((icon) => {
            icon.opacity(0);
        });
        
        console.log('Initial positions set for animations');
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
    
    recalculateLayout() {
        console.log('Recalculating layout with current visibility settings...');
        
        const canvasHeight = 1080;
        const elementGap = 26;
        
        // Define element heights (dynamically calculated for text elements)
        const elementHeights = {
            topIcon: 58,
            topTitle: this.templateObjects.topTitle ? this.templateObjects.topTitle.height() : 64,
            mainTitle: this.templateObjects.mainTitle ? this.templateObjects.mainTitle.height() : 180,
            subtitle1: this.templateObjects.subtitle1 ? this.templateObjects.subtitle1.height() : 75,
            subtitle2: this.templateObjects.subtitle2 ? this.templateObjects.subtitle2.height() : 40,
            bottomIcons: 57
        };
        
        console.log('Dynamic heights:', {
            topTitle: elementHeights.topTitle,
            mainTitle: elementHeights.mainTitle,
            subtitle1: elementHeights.subtitle1,
            subtitle2: elementHeights.subtitle2
        });
        
        // Get list of visible elements and their heights
        const visibleElements = [];
        let totalHeight = 0;
        
        if (this.layerVisibility.topIcon && this.templateObjects.topIcon) {
            visibleElements.push({ name: 'topIcon', height: elementHeights.topIcon, object: this.templateObjects.topIcon });
            totalHeight += elementHeights.topIcon;
        }
        
        if (this.layerVisibility.topTitle && this.templateObjects.topTitle) {
            visibleElements.push({ name: 'topTitle', height: elementHeights.topTitle, object: this.templateObjects.topTitle });
            totalHeight += elementHeights.topTitle;
        }
        
        if (this.layerVisibility.mainTitle && this.templateObjects.mainTitle) {
            visibleElements.push({ name: 'mainTitle', height: elementHeights.mainTitle, object: this.templateObjects.mainTitle });
            totalHeight += elementHeights.mainTitle;
        }
        
        if (this.layerVisibility.subtitle1 && this.templateObjects.subtitle1) {
            visibleElements.push({ name: 'subtitle1', height: elementHeights.subtitle1, object: this.templateObjects.subtitle1 });
            totalHeight += elementHeights.subtitle1;
        }
        
        if (this.layerVisibility.subtitle2 && this.templateObjects.subtitle2) {
            visibleElements.push({ name: 'subtitle2', height: elementHeights.subtitle2, object: this.templateObjects.subtitle2 });
            totalHeight += elementHeights.subtitle2;
        }
        
        if (this.layerVisibility.bottomIcons && this.templateObjects.bottomIcons.length > 0) {
            visibleElements.push({ name: 'bottomIcons', height: elementHeights.bottomIcons, objects: this.templateObjects.bottomIcons });
            totalHeight += elementHeights.bottomIcons;
        }
        
        // Add gaps between visible elements
        const gapsNeeded = Math.max(0, visibleElements.length - 1);
        totalHeight += gapsNeeded * elementGap;
        
        // Calculate starting Y position to center the design
        let currentY = (canvasHeight - totalHeight) / 2;
        
        console.log(`Visible elements: ${visibleElements.length}, Total height: ${totalHeight}px, Starting Y: ${currentY}`);
        
        // Position each visible element
        visibleElements.forEach((element, index) => {
            const yPosition = currentY + (element.height / 2);
            
            if (element.name === 'bottomIcons') {
                // Update bottom icons Y position
                this.bottomIconsY = yPosition;
                element.objects.forEach(icon => {
                    icon.y(yPosition);
                });
                console.log(`${element.name} repositioned to Y=${yPosition}`);
            } else {
                // Update single object Y position
                element.object.y(yPosition);
                
                // For text objects, ensure proper vertical centering
                if (element.object.getClassName() === 'Text') {
                    element.object.offsetY(element.object.height() / 2);
                }
                
                console.log(`${element.name} repositioned to Y=${yPosition}`);
            }
            
            // Move to next position
            currentY += element.height + (index < visibleElements.length - 1 ? elementGap : 0);
        });
        
        console.log('Layout recalculation complete');
    }
    
    createGSAPTimeline() {
        // Create master timeline
        this.timeline = gsap.timeline({ 
            paused: true,
            duration: this.animationDuration,
            ease: "power2.inOut"
        });
        
        // Collect all visible objects for animation
        const visibleObjects = [];
        if (this.templateObjects.topIcon && this.layerVisibility.topIcon) {
            visibleObjects.push(this.templateObjects.topIcon);
        }
        if (this.templateObjects.topTitle && this.layerVisibility.topTitle) {
            visibleObjects.push(this.templateObjects.topTitle);
        }
        if (this.templateObjects.mainTitle && this.layerVisibility.mainTitle) {
            visibleObjects.push(this.templateObjects.mainTitle);
        }
        if (this.templateObjects.subtitle1 && this.layerVisibility.subtitle1) {
            visibleObjects.push(this.templateObjects.subtitle1);
        }
        if (this.templateObjects.subtitle2 && this.layerVisibility.subtitle2) {
            visibleObjects.push(this.templateObjects.subtitle2);
        }
        if (this.templateObjects.bottomIcons && this.layerVisibility.bottomIcons) {
            visibleObjects.push(...this.templateObjects.bottomIcons);
        }
        
        // Intro animations (0-2s) - cascade from top to bottom
        let delay = 0;
        const animationStep = 0.15; // 150ms between each element
        
        if (this.templateObjects.topIcon && this.layerVisibility.topIcon) {
            this.timeline.to(this.templateObjects.topIcon, {
                opacity: 1,
                duration: 1.0,
                ease: "power2.out"
            }, delay);
            delay += animationStep;
        }
        
        if (this.templateObjects.topTitle && this.layerVisibility.topTitle) {
            this.timeline.to(this.templateObjects.topTitle, {
                opacity: 1,
                duration: 1.2,
                ease: "power2.out"
            }, delay);
            delay += animationStep;
        }
        
        if (this.templateObjects.mainTitle && this.layerVisibility.mainTitle) {
            this.timeline.to(this.templateObjects.mainTitle, {
                opacity: 1,
                duration: 1.5,
                ease: "power2.out"
            }, delay);
            delay += animationStep;
        }
        
        if (this.templateObjects.subtitle1 && this.layerVisibility.subtitle1) {
            this.timeline.to(this.templateObjects.subtitle1, {
                opacity: 1,
                duration: 1.0,
                ease: "power2.out"
            }, delay);
            delay += animationStep;
        }
        
        if (this.templateObjects.subtitle2 && this.layerVisibility.subtitle2) {
            this.timeline.to(this.templateObjects.subtitle2, {
                opacity: 1,
                duration: 1.0,
                ease: "power2.out"
            }, delay);
            delay += animationStep;
        }
        
        // Bottom icons with stagger effect
        if (this.templateObjects.bottomIcons && this.layerVisibility.bottomIcons) {
            this.templateObjects.bottomIcons.forEach((icon, index) => {
                this.timeline.to(icon, {
                    opacity: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)"
                }, delay + (index * 0.1));
            });
        }
        
        // Hold middle section (2s to 8s)
        this.timeline.to({}, { duration: 6 }, 2);
        
        // Exit animations - simple fade out (8s to 10s)
        this.timeline.to(visibleObjects, {
            opacity: 0,
            duration: 1.5,
            ease: "power2.in",
            stagger: 0.08
        }, 8);
        
        console.log('GSAP Timeline created with', visibleObjects.length, 'visible objects, duration:', this.animationDuration, 'seconds');
    }
    
    updateGSAPTimeline() {
        // Simply recreate the timeline when objects change
        this.createGSAPTimeline();
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
        
        // Update layer selection in timeline
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
        editor.loadProject();
        
        // Auto-save every 30 seconds
        setInterval(() => {
            editor.saveProject();
        }, 30000);
        
    } catch (error) {
        console.error('Enhanced font loading failed:', error);
        // Continue anyway with fallback fonts
        const editor = new TemplateEditor();
        editor.loadProject();
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