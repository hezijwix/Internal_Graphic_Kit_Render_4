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
        
        // Template objects
        this.templateObjects = {
            background: null,
            mainTitle: null,
            subtitle: null,
            icon: null
        };
        
        // GSAP Timeline
        this.timeline = null;
        this.animationDuration = 10; // seconds
        
        // Zoom and pan state
        this.zoomLevel = 100;
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
        // Header interactions
        const exportBtn = document.querySelector('.export-btn');
        exportBtn.addEventListener('click', () => this.handleExport());
        
        // Template selection
        const templateCards = document.querySelectorAll('.template-card');
        templateCards.forEach(card => {
            card.addEventListener('click', (e) => this.selectTemplate(e.target.closest('.template-card')));
        });
        
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
        
        // Upload button
        const uploadBtn = document.querySelector('.upload-btn');
        uploadBtn.addEventListener('click', () => this.handleIconUpload());
        
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
                        this.handleExport();
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
        // Text inputs
        const mainTextInput = document.getElementById('main-text');
        const subtitleInput = document.getElementById('subtitle-text');
        
        mainTextInput.addEventListener('input', () => this.updateText('main', mainTextInput.value));
        subtitleInput.addEventListener('input', () => this.updateText('subtitle', subtitleInput.value));
        
        // Font controls
        const fontFamilySelect = document.getElementById('font-family');
        const fontWeightSelect = document.getElementById('font-weight');
        const fontSizeSlider = document.getElementById('font-size');
        const fontSizeValue = document.querySelector('.slider-value');
        
        fontFamilySelect.addEventListener('change', () => this.updateFont('family', fontFamilySelect.value));
        fontWeightSelect.addEventListener('change', () => this.updateFont('weight', fontWeightSelect.value));
        
        fontSizeSlider.addEventListener('input', () => {
            fontSizeValue.textContent = fontSizeSlider.value + 'px';
            this.updateFont('size', fontSizeSlider.value);
        });
        
        // Zoom controls
        const zoomSelect = document.querySelector('.zoom-select');
        zoomSelect.addEventListener('change', () => this.setZoom(parseInt(zoomSelect.value)));
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
    
    // Template and Asset Management
    selectTemplate(templateCard) {
        document.querySelectorAll('.template-card').forEach(card => card.classList.remove('active'));
        templateCard.classList.add('active');
        
        const templateName = templateCard.querySelector('.template-name').textContent;
        document.querySelector('.template-badge').textContent = `Template: ${templateName}`;
        
        this.renderDefaultTemplate();
        console.log(`Selected template: ${templateName}`);
    }
    
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
        if (layerType === 'main-title' && this.templateObjects.mainTitle) {
            this.templateObjects.mainTitle.visible(!isVisible);
        } else if (layerType === 'subtitle' && this.templateObjects.subtitle) {
            this.templateObjects.subtitle.visible(!isVisible);
        } else if (layerType === 'icon' && this.templateObjects.icon) {
            this.templateObjects.icon.visible(!isVisible);
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
        if (type === 'main' && this.templateObjects.mainTitle) {
            this.templateObjects.mainTitle.text(value);
            this.templateObjects.mainTitle.offsetX(this.templateObjects.mainTitle.width() / 2);
        } else if (type === 'subtitle' && this.templateObjects.subtitle) {
            this.templateObjects.subtitle.text(value);
            this.templateObjects.subtitle.offsetX(this.templateObjects.subtitle.width() / 2);
        }
        
        this.updateTemplateProperties();
        
        console.log(`Updated ${type} text: ${value}`);
    }
    
    updateFont(property, value) {
        if (property === 'family') {
            if (this.templateObjects.mainTitle) this.templateObjects.mainTitle.fontFamily(value);
            if (this.templateObjects.subtitle) this.templateObjects.subtitle.fontFamily(value);
        } else if (property === 'weight') {
            if (this.templateObjects.mainTitle) this.templateObjects.mainTitle.fontStyle(value);
            if (this.templateObjects.subtitle) this.templateObjects.subtitle.fontStyle(value);
        } else if (property === 'size') {
            const fontSize = parseInt(value);
            if (this.templateObjects.mainTitle) {
                this.templateObjects.mainTitle.fontSize(fontSize);
                this.templateObjects.mainTitle.offsetY(fontSize / 2);
                this.templateObjects.mainTitle.offsetX(this.templateObjects.mainTitle.width() / 2);
            }
            if (this.templateObjects.subtitle) {
                const subtitleSize = fontSize * 0.4;
                this.templateObjects.subtitle.fontSize(subtitleSize);
                this.templateObjects.subtitle.offsetY(subtitleSize / 2);
                this.templateObjects.subtitle.offsetX(this.templateObjects.subtitle.width() / 2);
            }
        }
        
        this.updateTemplateProperties();
        
        console.log(`Updated font ${property}: ${value}`);
    }
    
    updateColor(type, color) {
        if (type === 'Text Color') {
            if (this.templateObjects.mainTitle) this.templateObjects.mainTitle.fill(color);
            if (this.templateObjects.subtitle) this.templateObjects.subtitle.fill(color);
        } else if (type === 'Background Color') {
            if (this.templateObjects.background) this.templateObjects.background.fill(color);
        }
        
        this.updateTemplateProperties();
        
        console.log(`Updated ${type}: ${color}`);
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
        zoomSelect.value = this.zoomLevel.toString();
        
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
        const containerRect = container.getBoundingClientRect();
        
        // Account for padding and borders
        const availableWidth = containerRect.width - 40; // 20px padding on each side
        const availableHeight = containerRect.height - 40;
        
        // Calculate scale to fit canvas in container
        const scaleX = availableWidth / 1920;
        const scaleY = availableHeight / 1080;
        const scale = Math.min(scaleX, scaleY);
        
        // Convert to percentage and ensure it's within bounds
        const fitZoom = Math.max(this.minZoom, Math.min(this.maxZoom, Math.round(scale * 100)));
        
        // Reset pan position
        this.panX = 0;
        this.panY = 0;
        
        this.setZoom(fitZoom);
        console.log(`Fit to screen: ${fitZoom}%`);
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
        // Create background
        this.templateObjects.background = new Konva.Rect({
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            fill: '#0D0D0D'
        });
        this.backgroundLayer.add(this.templateObjects.background);
        
        // Create main title text
        this.templateObjects.mainTitle = new Konva.Text({
            x: 960,
            y: 400,
            text: 'Welcome to Wix',
            fontSize: 72,
            fontFamily: 'Inter',
            fontStyle: '400',
            fill: '#FFFFFF',
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 36, // Half of fontSize for center alignment
            listening: true
        });
        this.contentLayer.add(this.templateObjects.mainTitle);
        
        // Create subtitle text
        this.templateObjects.subtitle = new Konva.Text({
            x: 960,
            y: 500,
            text: 'Create Amazing Videos',
            fontSize: 29,
            fontFamily: 'Inter',
            fontStyle: '400',
            fill: '#FFFFFF',
            align: 'center',
            verticalAlign: 'middle',
            offsetX: 0,
            offsetY: 14.5,
            listening: true
        });
        this.contentLayer.add(this.templateObjects.subtitle);
        
        // Create icon placeholder
        this.templateObjects.icon = new Konva.Rect({
            x: 910,
            y: 600,
            width: 100,
            height: 100,
            fill: '#0066FF',
            cornerRadius: 4,
            listening: true
        });
        this.contentLayer.add(this.templateObjects.icon);
        
        // Set initial positions for animation
        this.setInitialPositions();
        
        // Initial render
        this.stage.batchDraw();
    }
    
    setInitialPositions() {
        // Set starting positions for animations
        this.templateObjects.mainTitle.x(760);      // Start 200px left of center
        this.templateObjects.subtitle.x(785);       // Start 175px left of center  
        this.templateObjects.icon.x(860);           // Start 100px left of center
        
        // Set opacity for fade-in effect
        this.templateObjects.mainTitle.opacity(0);
        this.templateObjects.subtitle.opacity(0);
        this.templateObjects.icon.opacity(0);
    }
    
    createGSAPTimeline() {
        // Create master timeline
        this.timeline = gsap.timeline({ 
            paused: true,
            duration: this.animationDuration,
            ease: "power2.inOut"
        });
        
        // Main title animation - fade in and slide right
        this.timeline.to(this.templateObjects.mainTitle, {
            x: 960,           // End at center
            opacity: 1,       // Fade in
            duration: 1.5,
            ease: "power2.out"
        }, 0);  // Start immediately
        
        // Subtitle animation - delayed start
        this.timeline.to(this.templateObjects.subtitle, {
            x: 960,           // End at center  
            opacity: 1,       // Fade in
            duration: 1.2,
            ease: "power2.out"
        }, 0.3);  // Start 0.3 seconds after main title
        
        // Icon animation - last to appear
        this.timeline.to(this.templateObjects.icon, {
            x: 910,           // End at final position
            opacity: 1,       // Fade in
            rotation: 360,    // Full rotation
            duration: 1,
            ease: "back.out(1.7)"
        }, 0.6);  // Start 0.6 seconds in
        
        // Hold middle section (from 2s to 8s)
        this.timeline.to({}, { duration: 6 }, 2);
        
        // Exit animations - fade out and slide right
        this.timeline.to([
            this.templateObjects.mainTitle,
            this.templateObjects.subtitle,
            this.templateObjects.icon
        ], {
            x: "+=200",       // Move 200px right
            opacity: 0,       // Fade out
            duration: 1.5,
            ease: "power2.in",
            stagger: 0.1      // Stagger the exit timing
        }, 8);  // Start exit at 8 seconds
        
        console.log('GSAP Timeline created with duration:', this.animationDuration, 'seconds');
    }
    
    setupCanvasInteraction() {
        // Make objects selectable
        const selectableObjects = [
            this.templateObjects.mainTitle,
            this.templateObjects.subtitle,
            this.templateObjects.icon
        ];
        
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
        if (object === this.templateObjects.mainTitle) {
            this.selectLayer(document.querySelector('.layer-item[data-layer="main-title"]') || document.querySelector('.layer-item'));
        } else if (object === this.templateObjects.subtitle) {
            this.selectLayer(document.querySelector('.layer-item[data-layer="subtitle"]') || document.querySelectorAll('.layer-item')[1]);
        } else if (object === this.templateObjects.icon) {
            this.selectLayer(document.querySelector('.layer-item[data-layer="icon"]') || document.querySelectorAll('.layer-item')[2]);
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
        
        // Get current values from form
        const mainText = document.getElementById('main-text').value;
        const subtitleText = document.getElementById('subtitle-text').value;
        const fontSize = parseInt(document.getElementById('font-size').value);
        const fontFamily = document.getElementById('font-family').value;
        const fontWeight = document.getElementById('font-weight').value;
        
        // Update text content
        this.templateObjects.mainTitle.text(mainText);
        this.templateObjects.subtitle.text(subtitleText);
        
        // Update font properties
        this.templateObjects.mainTitle.fontSize(fontSize);
        this.templateObjects.mainTitle.fontFamily(fontFamily);
        this.templateObjects.mainTitle.fontStyle(fontWeight);
        
        this.templateObjects.subtitle.fontSize(fontSize * 0.4);
        this.templateObjects.subtitle.fontFamily(fontFamily);
        this.templateObjects.subtitle.fontStyle(fontWeight);
        
        // Update offset for center alignment
        this.templateObjects.mainTitle.offsetX(this.templateObjects.mainTitle.width() / 2);
        this.templateObjects.subtitle.offsetX(this.templateObjects.subtitle.width() / 2);
        
        // Redraw stage
        this.stage.batchDraw();
        
        console.log('Template properties updated');
    }
    
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    // File Operations
    handleIconUpload() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.png,.svg';
        input.style.display = 'none';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log(`Uploading icon: ${file.name}`);
                // Simulate upload success
                setTimeout(() => {
                    console.log('Icon uploaded successfully');
                    this.renderDefaultTemplate();
                }, 1000);
            }
        });
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
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
    
    handleExport() {
        console.log('Export initiated');
        
        // Show export progress (simulated)
        const exportBtn = document.querySelector('.export-btn');
        const originalText = exportBtn.innerHTML;
        
        exportBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="2" stroke-dasharray="18.85" stroke-dashoffset="18.85" transform="rotate(-90 8 8)"><animate attributeName="stroke-dashoffset" values="18.85;0" dur="1s" repeatCount="indefinite"/></circle></svg>Exporting...';
        exportBtn.disabled = true;
        
        setTimeout(() => {
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
            console.log('Export completed');
        }, 3000);
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
            document.getElementById('font-family').value = projectData.fontFamily || 'inter';
            document.getElementById('font-weight').value = projectData.fontWeight || '400';
            
            // Update slider display
            document.querySelector('.slider-value').textContent = projectData.fontSize + 'px' || '72px';
            
            console.log('Project loaded', projectData);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const editor = new TemplateEditor();
    editor.loadProject();
    
    // Auto-save every 30 seconds
    setInterval(() => {
        editor.saveProject();
    }, 30000);
}); 