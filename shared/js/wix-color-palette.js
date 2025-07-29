/**
 * Wix Branded Color Palette System
 * Parses wix_palette.md and provides branded color combination thumbnails
 * Replaces free color picker with brand-compliant color selection
 */
class WixColorPalette {
    constructor() {
        this.colorCombinations = [];
        this.currentSelection = {
            background: '#0D0D0D',
            foreground: '#FFFFFF'
        };
        this.onSelectionChange = null;
        this.isInitialized = false;
        
        console.log('🎨 Wix Branded Color Palette initialized');
    }
    
    /**
     * Load and parse color combinations from wix_palette.md
     */
    async loadColorPalette() {
        try {
            console.log('📁 Loading Wix color palette from MD file...');
            
            // Fetch the markdown file
            const response = await fetch('wix_palette.md');
            if (!response.ok) {
                throw new Error(`Failed to load palette: ${response.status}`);
            }
            
            const markdownContent = await response.text();
            this.parseColorPalette(markdownContent);
            
            console.log(`✅ Loaded ${this.colorCombinations.length} branded color combinations`);
            return this.colorCombinations;
            
        } catch (error) {
            console.error('❌ Failed to load color palette:', error);
            throw error; // Re-throw to prevent continuation if MD file fails
        }
    }
    
    /**
     * Parse markdown table into color combinations
     */
    parseColorPalette(markdownContent) {
        const lines = markdownContent.split('\n');
        this.colorCombinations = [];
        
        // Parse each line that contains color data
        for (const line of lines) {
            // Look for table rows with | separators
            if (line.trim().startsWith('|') && line.includes('#')) {
                const columns = line.split('|').map(col => col.trim()).filter(col => col);
                
                if (columns.length >= 3) {
                    const id = columns[0];
                    const background = columns[1];
                    const foreground = columns[2];
                    
                    // Validate hex colors
                    if (this.isValidHexColor(background) && this.isValidHexColor(foreground)) {
                        this.colorCombinations.push({
                            id: id,
                            background: background,
                            foreground: foreground,
                            name: `Combination ${id}`
                        });
                    }
                }
            }
        }
        
        console.log(`🎨 Parsed ${this.colorCombinations.length} color combinations from markdown`);
    }
    
    /**
     * Validate hex color format
     */
    isValidHexColor(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }
    
    /**
     * Set current color selection and update template
     */
    setSelection(background, foreground) {
        this.currentSelection = { background, foreground };
        
        // Update color display
        this.updateColorDisplay(background, foreground);
        
        // Update template colors via existing methods
        this.updateTemplateColors(background, foreground);
        
        if (this.onSelectionChange) {
            this.onSelectionChange(this.currentSelection);
        }
        
        console.log(`🎨 Color selection: bg=${background}, fg=${foreground}`);
    }
    
    /**
     * Update template colors using existing template engine methods
     */
    updateTemplateColors(background, foreground) {
        if (window.templateEditor) {
            // Use existing color update methods to preserve animations
            if (window.templateEditor.updateColor) {
                window.templateEditor.updateColor('Background Color', background);
                window.templateEditor.updateColor('Text Color', foreground);
            } else if (window.templateEditor.updateBackgroundColor && window.templateEditor.updateTextColor) {
                window.templateEditor.updateBackgroundColor(background);
                window.templateEditor.updateTextColor(foreground);
            }
        }
    }
    
    /**
     * Update color display thumbs and values
     */
    updateColorDisplay(background, foreground) {
        // Update background color display
        const bgThumb = document.getElementById('bg-color-thumb');
        const bgValue = document.getElementById('bg-color-value');
        if (bgThumb && bgValue) {
            bgThumb.style.backgroundColor = background;
            bgThumb.dataset.color = background;
            bgValue.textContent = background;
        }
        
        // Update text color display
        const textThumb = document.getElementById('text-color-thumb');
        const textValue = document.getElementById('text-color-value');
        if (textThumb && textValue) {
            textThumb.style.backgroundColor = foreground;
            textThumb.dataset.color = foreground;
            textValue.textContent = foreground;
        }
    }
    
    /**
     * Get current color selection
     */
    getSelection() {
        return this.currentSelection;
    }
    
    /**
     * Get all color combinations
     */
    getAllCombinations() {
        return this.colorCombinations;
    }
    
    /**
     * Find combination by ID
     */
    findCombinationById(id) {
        return this.colorCombinations.find(combo => combo.id === id);
    }
    
    /**
     * Find combination that matches current colors
     */
    findMatchingCombination(background, foreground) {
        return this.colorCombinations.find(combo => 
            combo.background.toLowerCase() === background.toLowerCase() &&
            combo.foreground.toLowerCase() === foreground.toLowerCase()
        );
    }
    
    /**
     * Create color combination thumbnail element
     */
    createThumbnail(combination, isSelected = false) {
        const thumbnail = document.createElement('button');
        thumbnail.className = `color-combination-thumb ${isSelected ? 'selected' : ''}`;
        thumbnail.dataset.background = combination.background;
        thumbnail.dataset.foreground = combination.foreground;
        thumbnail.dataset.id = combination.id;
        thumbnail.title = `${combination.name} (${combination.background} + ${combination.foreground})`;
        thumbnail.setAttribute('aria-label', `Select color combination ${combination.id}: ${combination.background} background with ${combination.foreground} text`);
        
        // Create the visual preview
        thumbnail.innerHTML = `
            <div class="color-combo-preview">
                <div class="color-combo-bg" style="background-color: ${combination.background}">
                    <div class="color-combo-fg" style="color: ${combination.foreground}">Aa</div>
                </div>
            </div>
            <span class="color-combo-id">${combination.id}</span>
        `;
        
        // Add click handler
        thumbnail.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectCombination(combination, thumbnail);
        });
        
        return thumbnail;
    }
    
    /**
     * Select a color combination
     */
    selectCombination(combination, thumbnailElement = null) {
        // Update selection state
        this.setSelection(combination.background, combination.foreground);
        
        // Update visual selection in thumbnails
        this.updateThumbnailSelection(thumbnailElement);
        
        console.log(`✅ Selected color combination ${combination.id}: ${combination.name}`);
    }
    
    /**
     * Update thumbnail selection visual state
     */
    updateThumbnailSelection(selectedThumbnail) {
        // Clear all selections
        document.querySelectorAll('.color-combination-thumb').forEach(thumb => {
            thumb.classList.remove('selected');
            thumb.setAttribute('aria-pressed', 'false');
        });
        
        // Set new selection
        if (selectedThumbnail) {
            selectedThumbnail.classList.add('selected');
            selectedThumbnail.setAttribute('aria-pressed', 'true');
        }
    }
    
    /**
     * Initialize the branded color palette UI
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('🎨 Color palette already initialized');
            return;
        }
        
        try {
            // Load color combinations
            await this.loadColorPalette();
            
            // Create and populate the thumbnail gallery
            this.createThumbnailGallery();
            
            // Set initial selection
            this.setInitialSelection();
            
            this.isInitialized = true;
            console.log('✅ Branded color palette initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize branded color palette:', error);
            throw error;
        }
    }
    
    /**
     * Create the thumbnail gallery UI
     */
    createThumbnailGallery() {
        const container = document.getElementById('branded-color-gallery');
        if (!container) {
            console.warn('⚠️ Branded color gallery container not found');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'branded-color-header';
        header.innerHTML = `
            <h4>Brand Color Combinations</h4>
            <span class="color-count">${this.colorCombinations.length} combinations</span>
        `;
        container.appendChild(header);
        
        // Create thumbnail grid
        const grid = document.createElement('div');
        grid.className = 'color-combinations-grid';
        grid.setAttribute('role', 'radiogroup');
        grid.setAttribute('aria-label', 'Brand color combinations');
        
        // Create thumbnails
        this.colorCombinations.forEach((combination, index) => {
            const thumbnail = this.createThumbnail(combination, index === 0);
            thumbnail.setAttribute('role', 'radio');
            thumbnail.setAttribute('aria-checked', index === 0 ? 'true' : 'false');
            grid.appendChild(thumbnail);
        });
        
        container.appendChild(grid);
        
        console.log(`🎨 Created ${this.colorCombinations.length} color combination thumbnails`);
    }
    
    /**
     * Set initial color selection based on current colors
     */
    setInitialSelection() {
        // Try to match current colors with a combination
        const currentBg = document.getElementById('bg-color-thumb')?.dataset.color || '#0D0D0D';
        const currentFg = document.getElementById('text-color-thumb')?.dataset.color || '#FFFFFF';
        
        const matchingCombo = this.findMatchingCombination(currentBg, currentFg);
        const defaultCombo = matchingCombo || this.colorCombinations[0];
        
        if (defaultCombo) {
            const thumbnail = document.querySelector(`[data-id="${defaultCombo.id}"]`);
            this.selectCombination(defaultCombo, thumbnail);
        }
    }
    
    /**
     * Handle transparency selection (preserve existing functionality)
     */
    selectTransparency() {
        // Clear thumbnail selections
        this.updateThumbnailSelection(null);
        
        // Set transparent background, keep current foreground
        this.setSelection('transparent', this.currentSelection.foreground);
        
        // Update transparency display
        const bgThumb = document.getElementById('bg-color-thumb');
        const bgValue = document.getElementById('bg-color-value');
        if (bgThumb && bgValue) {
            bgThumb.style.backgroundColor = 'transparent';
            bgThumb.style.backgroundImage = 'repeating-conic-gradient(#E5E5E5 0deg 90deg, #CCCCCC 90deg 180deg)';
            bgThumb.style.backgroundSize = '8px 8px';
            bgThumb.dataset.color = 'transparent';
            bgValue.textContent = 'Transparent';
        }
        
        console.log('🔍 Transparency selected for background');
    }
}

// Export for global use
window.WixColorPalette = WixColorPalette; 