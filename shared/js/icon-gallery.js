/**
 * Icon Gallery Component
 * A popup gallery for selecting icons from the organized SVG collection
 */
class IconGallery {
    constructor(options = {}) {
        this.options = {
            iconRegistryPath: 'templates/template_001/assets/icons/icon-registry.json',
            iconBasePath: 'templates/template_001/assets/icons/',
            onSelect: null,
            onCancel: null,
            initialSelection: null,
            ...options
        };
        
        this.iconRegistry = null;
        this.allIcons = [];
        this.filteredIcons = [];
        this.selectedIcon = this.options.initialSelection;
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.modal = null;
        this.isLoading = false;
        this.isVisible = false;
        this.svgsLoaded = false;
        
        this.init();
    }
    
    async init() {
        console.log('🎨 Initializing Icon Gallery...');
        await this.loadIconRegistry();
        this.createModal();
        this.setupEventListeners();
        console.log('✅ Icon Gallery initialized with', this.allIcons.length, 'icons');
    }
    
    async loadIconRegistry() {
        try {
            console.log('📦 Loading icon registry...');
            const response = await fetch(this.options.iconRegistryPath);
            if (!response.ok) {
                throw new Error(`Failed to load icon registry: ${response.status}`);
            }
            
            this.iconRegistry = await response.json();
            
            // Convert registry to flat array for easier manipulation
            this.allIcons = Object.entries(this.iconRegistry.icons).map(([id, iconData]) => ({
                id: parseInt(id),
                ...iconData,
                fullPath: this.options.iconBasePath + iconData.newName
            }));
            
            this.filteredIcons = [...this.allIcons];
            console.log('✅ Loaded', this.allIcons.length, 'icons from registry');
            
        } catch (error) {
            console.error('❌ Failed to load icon registry:', error);
            this.allIcons = [];
            this.filteredIcons = [];
        }
    }
    
    createModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('icon-gallery-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        this.modal = document.createElement('div');
        this.modal.id = 'icon-gallery-modal';
        this.modal.className = 'icon-gallery-modal';
        this.modal.innerHTML = this.getModalHTML();
        
        document.body.appendChild(this.modal);
        
        // Store references to key elements
        this.elements = {
            modal: this.modal,
            content: this.modal.querySelector('.icon-gallery-content'),
            closeBtn: this.modal.querySelector('.icon-gallery-close'),
            searchInput: this.modal.querySelector('.icon-search-input'),
            categoryFilters: this.modal.querySelector('.category-filters'),
            gridContainer: this.modal.querySelector('.icon-gallery-grid-container'),
            grid: this.modal.querySelector('.icon-gallery-grid'),
            info: this.modal.querySelector('.icon-gallery-info'),
            cancelBtn: this.modal.querySelector('.icon-gallery-btn-cancel'),
            selectBtn: this.modal.querySelector('.icon-gallery-btn-select')
        };
    }
    
    getModalHTML() {
        const categories = this.iconRegistry ? this.iconRegistry.categories : [];
        
        return `
            <div class="icon-gallery-content">
                <div class="icon-gallery-header">
                    <h2 class="icon-gallery-title">Choose Icon</h2>
                    <button class="icon-gallery-close" aria-label="Close icon gallery">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                
                <div class="icon-gallery-search">
                    <input 
                        type="text" 
                        class="icon-search-input" 
                        placeholder="Search icons..." 
                        aria-label="Search icons"
                    >
                </div>
                
                <div class="icon-gallery-categories">
                    <div class="category-filters">
                        <button class="category-filter active" data-category="all">All Icons</button>
                        ${categories.map(category => 
                            `<button class="category-filter" data-category="${category}">${category}</button>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="icon-gallery-grid-container">
                    <div class="icon-gallery-grid">
                        ${this.isLoading ? this.getLoadingHTML() : ''}
                    </div>
                </div>
                
                <div class="icon-gallery-footer">
                    <div class="icon-gallery-info">
                        <span id="icon-count">${this.filteredIcons.length}</span> icons available
                    </div>
                    <div class="icon-gallery-actions">
                        <button class="icon-gallery-btn icon-gallery-btn-cancel">Cancel</button>
                        <button class="icon-gallery-btn icon-gallery-btn-select" disabled>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" fill="currentColor"/>
                            </svg>
                            Select Icon
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getLoadingHTML() {
        return `
            <div class="icon-gallery-loading">
                <div class="spinner"></div>
                Loading icons...
            </div>
        `;
    }
    
    getEmptyHTML() {
        return `
            <div class="icon-gallery-empty">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/>
                    <path d="M16 24h16M24 16v16" stroke="currentColor" stroke-width="2"/>
                </svg>
                <p>No icons found</p>
                <small>Try adjusting your search or category filter</small>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Close modal
        this.elements.closeBtn.addEventListener('click', () => this.close());
        this.elements.cancelBtn.addEventListener('click', () => this.close());
        
        // Click outside to close
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.close();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.close();
            }
        });
        
        // Search functionality
        this.elements.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterAndRenderIcons();
        });
        
        // Category filtering
        this.elements.categoryFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-filter')) {
                // Update active category
                this.elements.categoryFilters.querySelectorAll('.category-filter').forEach(btn => 
                    btn.classList.remove('active'));
                e.target.classList.add('active');
                
                this.currentCategory = e.target.dataset.category;
                this.filterAndRenderIcons();
            }
        });
        
        // Icon selection
        this.elements.grid.addEventListener('click', (e) => {
            const iconItem = e.target.closest('.icon-gallery-item');
            if (iconItem) {
                this.selectIcon(parseInt(iconItem.dataset.iconId));
            }
        });
        
        // Select button
        this.elements.selectBtn.addEventListener('click', () => {
            if (this.selectedIcon) {
                this.confirmSelection();
            }
        });
    }
    
    filterAndRenderIcons() {
        this.filteredIcons = this.allIcons.filter(icon => {
            // Category filter
            const categoryMatch = this.currentCategory === 'all' || icon.category === this.currentCategory;
            
            // Search filter
            const searchMatch = this.searchQuery === '' || 
                icon.originalName.toLowerCase().includes(this.searchQuery) ||
                icon.category.toLowerCase().includes(this.searchQuery) ||
                icon.id.toString().includes(this.searchQuery);
            
            return categoryMatch && searchMatch;
        });
        
        // Reset SVG loading flag when re-rendering
        this.svgsLoaded = false;
        
        this.renderIcons();
        this.updateInfo();
    }
    
        renderIcons() {
        console.log('🎨 === RENDERING ICONS WITH TEST METHOD ===');
        
        if (this.filteredIcons.length === 0) {
            this.elements.grid.innerHTML = this.getEmptyHTML();
            return;
        }

        console.log('Creating icons using EXACT test modal method...');
        
        // Clear existing content (same as test)
        this.elements.grid.innerHTML = '';
        
        // Create icon items using EXACT test modal method
        this.filteredIcons.forEach((icon, index) => {
            console.log(`Creating icon item ${index + 1}: ${icon.originalName}`);
            
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-gallery-item'; // Use same class as test
            iconItem.dataset.iconId = icon.id;
            iconItem.title = icon.originalName;
            
            // Add selected class if needed
            if (this.selectedIcon === icon.id) {
                iconItem.classList.add('selected');
            }
            
            // Apply same inline styles as test modal for consistency
            iconItem.style.cssText = `
                border: 1px solid #333;
                border-radius: 4px;
                padding: 8px;
                cursor: pointer;
                transition: all 0.2s;
                background: #0d0d0d;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 60px;
                position: relative;
            `;
            
            // Create the HTML structure exactly like test modal
            iconItem.innerHTML = `
                <div class="icon-number" style="font-size: 8px; color: #666; position: absolute; top: 2px; left: 4px;">${icon.id}</div>
                <div class="icon-placeholder" data-icon-path="${icon.fullPath}" style="
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 4px;
">
                    <!-- Loading... -->
                </div>
            `;
            
            this.elements.grid.appendChild(iconItem);
            console.log('✅ Created icon item for:', icon.originalName);
        });
        
        console.log(`✅ Created ${this.filteredIcons.length} icon items using test method`);
        
        // Load SVGs using the working method (delay like test)
        setTimeout(() => {
            console.log('🔄 Starting SVG loading process with test timing...');
            this.loadVisibleSVGs();
        }, 100);
    }
    
    async loadVisibleSVGs() {
        if (this.svgsLoaded) {
            console.log('🎨 SVGs already loaded, skipping...');
            return;
        }
        
        console.log('🔍 === SVG LOADING WITH PREPROCESSING ===');
        const iconPlaceholders = this.elements.grid.querySelectorAll('.icon-placeholder');
        console.log(`🎨 Loading SVGs for ${iconPlaceholders.length} icons with enhanced processing...`);
        
        if (iconPlaceholders.length === 0) {
            console.warn('❌ No icon placeholders found in gallery grid');
            return;
        }
        
        // DEBUG: Check placeholder content to verify fix
        console.log('🔍 PLACEHOLDER DEBUG:');
        iconPlaceholders.forEach((placeholder, index) => {
            const hasContent = placeholder.innerHTML.trim();
            const hasSVG = placeholder.querySelector('svg');
            const iconPath = placeholder.dataset.iconPath;
            console.log(`  ${index + 1}. Path: ${iconPath?.substring(iconPath.lastIndexOf('/') + 1)}, HasContent: ${!!hasContent}, HasSVG: ${!!hasSVG}, WillLoad: ${!hasSVG}`);
        });
        
        this.svgsLoaded = true;
        
        // DIAGNOSTIC TEST: Insert simple test SVG in first placeholder
        if (iconPlaceholders.length > 0) {
            const firstPlaceholder = iconPlaceholders[0];
            console.log('🧪 INSERTING DIAGNOSTIC TEST SVG...');
            
            const testSVG = `
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" 
                     style="background: rgba(255,0,0,0.1); border: 1px solid red;">
                    <rect x="2" y="2" width="28" height="28" fill="#ffffff" stroke="#ffffff" stroke-width="2"/>
                    <circle cx="16" cy="16" r="8" fill="#ff0000"/>
                    <text x="16" y="20" text-anchor="middle" fill="#ffffff" font-size="8">TEST</text>
                </svg>
            `;
            
            firstPlaceholder.innerHTML = testSVG;
            console.log('✅ Test SVG inserted in first placeholder');
            
            // Verify it exists and is visible
            setTimeout(() => {
                const testSvgElement = firstPlaceholder.querySelector('svg');
                if (testSvgElement) {
                    const rect = testSvgElement.getBoundingClientRect();
                    console.log('🔍 Test SVG status:', {
                        'exists': !!testSvgElement,
                        'visible': rect.width > 0 && rect.height > 0,
                        'dimensions': `${rect.width}x${rect.height}`,
                        'innerHTML': testSvgElement.outerHTML.substring(0, 100)
                    });
                } else {
                    console.error('❌ Test SVG not found in DOM!');
                }
            }, 100);
        }
        
        // Enhanced SVG loading with preprocessing
        for (const placeholder of iconPlaceholders) {
            const iconPath = placeholder.dataset.iconPath;
            
            if (iconPath && !placeholder.querySelector('svg')) {
                try {
                    console.log(`📥 Loading and preprocessing icon: ${iconPath}`);
                    
                    // Verify path exists first
                    const testResponse = await fetch(iconPath, { method: 'HEAD' });
                    if (!testResponse.ok) {
                        console.warn(`❌ Icon not found: ${iconPath} (HEAD check failed)`);
                        placeholder.innerHTML = this.getFallbackIconSVG();
                        continue;
                    }
                    
                    const response = await fetch(iconPath);
                    if (response.ok) {
                        let svgContent = await response.text();
                        
                        // 🔧 PREPROCESSING: Fix SVG attributes for visibility
                        svgContent = this.preprocessSVGContent(svgContent);
                        
                        // 🔧 ENHANCED INSERTION: Use DOMParser for better namespace handling
                        this.insertSVGWithDOMParser(placeholder, svgContent);
                        
                        console.log(`✅ Loaded and processed icon: ${iconPath}`);
                    } else {
                        console.warn(`❌ Failed to load icon: ${iconPath} (HTTP ${response.status})`);
                        placeholder.innerHTML = this.getFallbackIconSVG();
                    }
                } catch (error) {
                    console.warn('❌ Failed to load icon:', iconPath, error);
                    placeholder.innerHTML = this.getFallbackIconSVG();
                }
            }
        }
        
        console.log('🎨 Enhanced SVG loading complete');
    }
    
    /**
     * Aggressive SVG preprocessing to fix visibility issues
     * Addresses the core problem: SVG files have black stroke/fill attributes
     * that become invisible on dark backgrounds
     */
    preprocessSVGContent(svgContent) {
        console.log('🔧 AGGRESSIVE SVG preprocessing...');
        console.log('Original SVG sample:', svgContent.substring(0, 200));
        
        // ULTRA-AGGRESSIVE APPROACH: Force visibility with multiple strategies
        let processedContent = svgContent
            // 1. Replace ALL black variations with white (CRITICAL for visibility)
            .replace(/stroke="black"/gi, 'stroke="#ffffff"')
            .replace(/stroke="#000000"/gi, 'stroke="#ffffff"')
            .replace(/stroke="#000"/gi, 'stroke="#ffffff"')
            .replace(/stroke="rgb\(0,\s*0,\s*0\)"/gi, 'stroke="#ffffff"')
            .replace(/fill="black"/gi, 'fill="#ffffff"')
            .replace(/fill="#000000"/gi, 'fill="#ffffff"')
            .replace(/fill="#000"/gi, 'fill="#ffffff"')
            .replace(/fill="rgb\(0,\s*0,\s*0\)"/gi, 'fill="#ffffff"')
            
            // 2. CRITICAL: Handle fill="none" properly with THICK white strokes
            .replace(/fill="none"/gi, 'fill="none"')  // Keep none but ensure stroke
            .replace(/<path([^>]*?)stroke="black"([^>]*?)>/gi, '<path$1stroke="#ffffff" stroke-width="3"$2>')
            .replace(/<path([^>]*?)>/gi, (match, attributes) => {
                // For paths with fill="none", ensure visible white stroke
                if (attributes.includes('fill="none"') && !attributes.includes('stroke="#ffffff"')) {
                    attributes = attributes.replace(/stroke-width="[^"]*"/, ''); // Remove existing
                    return `<path${attributes} stroke="#ffffff" stroke-width="3">`;
                }
                return match;
            })
            
            // 3. Add stroke to any elements without color
            .replace(/<(path|circle|rect|line|polyline|polygon)([^>]*?)>/gi, (match, tag, attributes) => {
                if (!attributes.includes('stroke=') && !attributes.includes('fill=')) {
                    return `<${tag}${attributes} stroke="#ffffff" stroke-width="2" fill="none">`;
                }
                return match;
            })
            
            // 4. Force root SVG properties for visibility
            .replace(/<svg([^>]*?)>/i, (match, attributes) => {
                // Ensure namespace
                if (!attributes.includes('xmlns=')) {
                    attributes += ' xmlns="http://www.w3.org/2000/svg"';
                }
                // Add preserveAspectRatio for scaling
                if (!attributes.includes('preserveAspectRatio=')) {
                    attributes += ' preserveAspectRatio="xMidYMid meet"';
                }
                return `<svg${attributes}>`;
            });
        
        // FALLBACK: If still no visible attributes, wrap everything in a white group
        if (!processedContent.includes('#ffffff') && !processedContent.includes('white')) {
            console.warn('⚠️ No white colors found, applying fallback wrapper...');
            processedContent = processedContent.replace(
                /(<svg[^>]*>)(.*?)(<\/svg>)/s,
                '$1<g fill="#ffffff" stroke="#ffffff" stroke-width="1">$2</g>$3'
            );
        }
        
        console.log('✅ AGGRESSIVE SVG preprocessing complete');
        console.log('   Original length:', svgContent.length);
        console.log('   Processed length:', processedContent.length);
        console.log('   Processed sample:', processedContent.substring(0, 200));
        
        // Verify changes were made
        const hasWhiteColors = processedContent.includes('#ffffff');
        console.log('   Contains white colors:', hasWhiteColors);
        
        if (!hasWhiteColors) {
            console.error('❌ PREPROCESSING FAILED - no white colors detected!');
        }
        
        return processedContent;
    }
    
    /**
     * AGGRESSIVE SVG insertion with maximum visibility enforcement
     * Uses multiple methods and extensive style overrides
     */
    insertSVGWithDOMParser(placeholder, svgContent) {
        console.log('🔧 AGGRESSIVE SVG insertion starting...');
        
        try {
            // Method 1: DOMParser (recommended for SVG)
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            
            // Check for parsing errors
            const parserError = svgDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('SVG parsing failed: ' + parserError.textContent);
            }
            
            const svgElement = svgDoc.documentElement;
            
            // AGGRESSIVE STYLING: Force maximum visibility
            this.applyCriticalSVGStyles(svgElement);
            
            // Clear placeholder and insert parsed SVG
            placeholder.innerHTML = '';
            placeholder.appendChild(svgElement);
            
            console.log('✅ SVG inserted using DOMParser method');
            
            // POST-INSERTION: Force reflow and additional styling
            this.forceVisibilityPostInsertion(placeholder);
            
        } catch (error) {
            console.warn('⚠️ DOMParser failed, using AGGRESSIVE innerHTML fallback:', error.message);
            
            // Method 2: AGGRESSIVE innerHTML fallback
            placeholder.innerHTML = svgContent;
            
            // POST-INSERTION: Force visibility
            this.forceVisibilityPostInsertion(placeholder);
            
            console.log('✅ SVG inserted using innerHTML fallback');
        }
    }
    
    /**
     * Apply critical styles for maximum SVG visibility
     */
    applyCriticalSVGStyles(svgElement) {
        // Get original viewBox for scaling calculations
        const viewBox = svgElement.getAttribute('viewBox');
        const originalWidth = svgElement.getAttribute('width');
        const originalHeight = svgElement.getAttribute('height');
        
        console.log('🔧 Applying critical styles. Original:', {
            viewBox, 
            width: originalWidth, 
            height: originalHeight
        });
        
        // Root SVG element critical styles with proper scaling
        const criticalStyles = {
            'width': '32px',
            'height': '32px',
            'display': 'block',
            'fill': 'none',  // Let strokes be visible
            'stroke': '#ffffff',
            'color': '#ffffff',
            'visibility': 'visible',
            'opacity': '1',
            'stroke-width': '3',  // Thicker for visibility
            'vector-effect': 'non-scaling-stroke'  // Keep stroke width consistent
        };
        
        Object.assign(svgElement.style, criticalStyles);
        
        // Force critical attributes
        svgElement.setAttribute('width', '32');
        svgElement.setAttribute('height', '32');
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // If no viewBox, create one based on original size
        if (!viewBox && originalWidth && originalHeight) {
            const w = parseInt(originalWidth) || 32;
            const h = parseInt(originalHeight) || 32;
            svgElement.setAttribute('viewBox', `0 0 ${w} ${h}`);
            console.log(`📐 Added viewBox: 0 0 ${w} ${h}`);
        }
        
        // Apply to ALL child elements with AGGRESSIVE visibility
        const allElements = svgElement.querySelectorAll('*');
        allElements.forEach(el => {
            // For paths with fill="none", make stroke visible
            const currentFill = el.getAttribute('fill');
            if (currentFill === 'none' || !currentFill) {
                Object.assign(el.style, {
                    'fill': 'none',
                    'stroke': '#ffffff',
                    'stroke-width': '3',
                    'visibility': 'visible',
                    'opacity': '1'
                });
                el.setAttribute('fill', 'none');
                el.setAttribute('stroke', '#ffffff');
                el.setAttribute('stroke-width', '3');
            } else {
                Object.assign(el.style, {
                    'fill': '#ffffff',
                    'stroke': '#ffffff',
                    'stroke-width': '2',
                    'visibility': 'visible',
                    'opacity': '1'
                });
                el.setAttribute('fill', '#ffffff');
                el.setAttribute('stroke', '#ffffff');
            }
        });
        
        console.log('✅ Applied critical styles to', allElements.length + 1, 'SVG elements');
        console.log('   Paths with fill=none:', svgElement.querySelectorAll('[fill="none"]').length);
        console.log('   Elements with stroke:', svgElement.querySelectorAll('[stroke]').length);
    }
    
    /**
     * Post-insertion visibility enforcement
     */
    forceVisibilityPostInsertion(placeholder) {
        // Find the SVG element
        const svg = placeholder.querySelector('svg');
        if (!svg) {
            console.error('❌ No SVG found after insertion!');
            return;
        }
        
        // Re-apply critical styles (in case they were overridden)
        this.applyCriticalSVGStyles(svg);
        
        // Force browser reflow
        placeholder.offsetHeight;
        svg.offsetHeight;
        
        // Additional DOM manipulation to force visibility
        svg.style.display = 'none';
        svg.offsetHeight; // Force reflow
        svg.style.display = 'block';
        
        // Final verification
        const rect = svg.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        console.log('🔍 Post-insertion check:', {
            'SVG visible': isVisible,
            'Dimensions': `${rect.width}x${rect.height}`,
            'Fill': svg.style.fill,
            'Stroke': svg.style.stroke
        });
        
        if (!isVisible) {
            console.warn('⚠️ SVG still not visible, applying emergency fallback...');
            this.applyEmergencyFallback(placeholder);
        }
    }
    
    /**
     * Emergency fallback for completely broken SVGs
     */
    applyEmergencyFallback(placeholder) {
        console.warn('🚨 Applying emergency fallback...');
        placeholder.innerHTML = this.getFallbackIconSVG();
        
        const fallbackSvg = placeholder.querySelector('svg');
        if (fallbackSvg) {
            this.applyCriticalSVGStyles(fallbackSvg);
        }
    }
    
    // Manual SVG loading test
    async testSVGLoading() {
        console.log('🧪 === MANUAL SVG LOADING TEST ===');
        
        // Force reset
        this.svgsLoaded = false;
        
        // Check if we have icons
        console.log('Total icons available:', this.allIcons.length);
        if (this.allIcons.length === 0) {
            console.error('❌ No icons loaded! Check registry loading.');
            return;
        }
        
        // Check if grid exists
        if (!this.elements || !this.elements.grid) {
            console.error('❌ Grid element not found! Check modal creation.');
            return;
        }
        
        // Manually create one test icon
        const testIcon = this.allIcons[0];
        console.log('Testing icon:', testIcon);
        
        this.elements.grid.innerHTML = `
            <div class="icon-gallery-item test-item">
                <div class="icon-number">TEST</div>
                <div class="icon-placeholder" data-icon-path="${testIcon.fullPath}">
                    Loading test...
                </div>
            </div>
        `;
        
        // Try to load it
        const placeholder = this.elements.grid.querySelector('.icon-placeholder');
        if (placeholder) {
            try {
                console.log('Attempting to fetch:', testIcon.fullPath);
                const response = await fetch(testIcon.fullPath);
                console.log('Response status:', response.status);
                console.log('Response ok:', response.ok);
                
                if (response.ok) {
                    const svgText = await response.text();
                    console.log('SVG content length:', svgText.length);
                    console.log('SVG preview:', svgText.substring(0, 100));
                    
                    placeholder.innerHTML = svgText;
                    console.log('✅ Manual SVG test successful!');
                    
                    // Check if SVG element exists
                    const svg = placeholder.querySelector('svg');
                    if (svg) {
                        console.log('✅ SVG element found in DOM');
                        console.log('SVG size:', svg.getBoundingClientRect());
                    } else {
                        console.error('❌ SVG element not found after insertion');
                    }
                } else {
                    console.error('❌ Fetch failed:', response.status);
                }
            } catch (error) {
                console.error('❌ Manual test error:', error);
            }
        }
    }
    
    // Enhanced debug helper method
    debugIconLoading() {
        console.log('🔍 === ICON GALLERY DEBUG ===');
        console.log('Modal:', this.modal);
        console.log('Elements:', this.elements);
        console.log('Grid element:', this.elements?.grid);
        console.log('All icons:', this.allIcons.length);
        console.log('Filtered icons:', this.filteredIcons.length);
        console.log('SVGs loaded flag:', this.svgsLoaded);
        
        const placeholders = this.elements?.grid?.querySelectorAll('.icon-placeholder') || [];
        console.log('Placeholders found:', placeholders.length);
        
        if (placeholders.length > 0) {
            const first = placeholders[0];
            console.log('First placeholder:', first);
            console.log('First placeholder path:', first.dataset?.iconPath);
            console.log('First placeholder HTML:', first.innerHTML.substring(0, 100));
            
            // Check SVG visibility
            const svg = first.querySelector('svg');
            if (svg) {
                console.log('🎨 SVG VISIBILITY CHECK:');
                console.log('  SVG dimensions:', svg.getBoundingClientRect());
                console.log('  SVG computed styles:', {
                    display: window.getComputedStyle(svg).display,
                    visibility: window.getComputedStyle(svg).visibility,
                    opacity: window.getComputedStyle(svg).opacity,
                    fill: window.getComputedStyle(svg).fill,
                    stroke: window.getComputedStyle(svg).stroke
                });
                console.log('  SVG inline styles:', svg.style.cssText);
            }
        }
        
        // Test direct SVG fetch
        if (this.allIcons.length > 0) {
            const testIcon = this.allIcons[0];
            console.log('Testing direct fetch for:', testIcon.fullPath);
            fetch(testIcon.fullPath)
                .then(r => r.text())
                .then(svg => console.log('✅ Direct fetch works:', svg.substring(0, 100)))
                .catch(e => console.error('❌ Direct fetch failed:', e));
        }
    }
    
    /**
     * Comprehensive SVG visibility validation
     * Tests the fixes and reports on icon rendering status
     */
    validateSVGVisibility() {
        console.log('🧪 === SVG VISIBILITY VALIDATION ===');
        
        if (!this.isVisible) {
            console.warn('⚠️ Gallery is not open, cannot validate visibility');
            return false;
        }
        
        const placeholders = this.elements.grid.querySelectorAll('.icon-placeholder');
        console.log(`🔍 Validating ${placeholders.length} icon placeholders...`);
        
        let visibleCount = 0;
        let invisibleCount = 0;
        let errorCount = 0;
        
        placeholders.forEach((placeholder, index) => {
            const svg = placeholder.querySelector('svg');
            const iconPath = placeholder.dataset.iconPath;
            
            if (!svg) {
                console.warn(`❌ Icon ${index + 1}: No SVG element found (${iconPath})`);
                errorCount++;
                return;
            }
            
            // Check visibility metrics
            const rect = svg.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(svg);
            const isVisible = (
                rect.width > 0 &&
                rect.height > 0 &&
                computedStyle.display !== 'none' &&
                computedStyle.visibility !== 'hidden' &&
                parseFloat(computedStyle.opacity) > 0
            );
            
            // Check color attributes
            const hasVisibleColor = (
                computedStyle.fill !== 'rgb(0, 0, 0)' ||  // Not black fill
                computedStyle.stroke !== 'rgb(0, 0, 0)'   // Not black stroke
            );
            
            if (isVisible && hasVisibleColor) {
                console.log(`✅ Icon ${index + 1}: Visible (${iconPath})`);
                visibleCount++;
            } else {
                console.warn(`❌ Icon ${index + 1}: Invisible - Size: ${rect.width}x${rect.height}, Display: ${computedStyle.display}, Fill: ${computedStyle.fill}, Stroke: ${computedStyle.stroke} (${iconPath})`);
                invisibleCount++;
            }
        });
        
        // Generate report
        const totalIcons = placeholders.length;
        const successRate = totalIcons > 0 ? ((visibleCount / totalIcons) * 100).toFixed(1) : 0;
        
        console.log('🎯 === VALIDATION REPORT ===');
        console.log(`Total icons: ${totalIcons}`);
        console.log(`✅ Visible: ${visibleCount}`);
        console.log(`❌ Invisible: ${invisibleCount}`);
        console.log(`⚠️ Errors: ${errorCount}`);
        console.log(`📊 Success rate: ${successRate}%`);
        
        // Determine if fix was successful
        const isSuccessful = successRate >= 90;
        console.log(`🏆 Fix status: ${isSuccessful ? 'SUCCESS' : 'NEEDS IMPROVEMENT'}`);
        
        if (!isSuccessful && invisibleCount > 0) {
            console.log('🔧 Troubleshooting suggestions:');
            console.log('1. Check SVG file content for problematic attributes');
            console.log('2. Verify CSS selector specificity');
            console.log('3. Test with browser developer tools CSS overrides');
        }
        
        return {
            total: totalIcons,
            visible: visibleCount,
            invisible: invisibleCount,
            errors: errorCount,
            successRate: parseFloat(successRate),
            isSuccessful
        };
    }
    
    /**
     * Emergency function to force all SVGs visible with brute force styling
     */
    forceAllSVGsVisible() {
        console.log('🚨 === EMERGENCY SVG VISIBILITY FORCE ===');
        
        const allSVGs = this.elements.grid.querySelectorAll('svg');
        console.log(`Found ${allSVGs.length} SVG elements to force visible...`);
        
        allSVGs.forEach((svg, index) => {
            console.log(`Forcing SVG ${index + 1} visible...`);
            
            // Apply maximum override styles
            svg.style.cssText = `
                width: 32px !important;
                height: 32px !important;
                fill: #ffffff !important;
                stroke: #ffffff !important;
                stroke-width: 2px !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                color: #ffffff !important;
                background: rgba(255,0,0,0.1) !important;
            `;
            
            // Force attributes
            svg.setAttribute('fill', '#ffffff');
            svg.setAttribute('stroke', '#ffffff');
            svg.setAttribute('stroke-width', '2');
            
            // Force all child elements
            const children = svg.querySelectorAll('*');
            children.forEach(child => {
                child.style.cssText = `
                    fill: #ffffff !important;
                    stroke: #ffffff !important;
                    stroke-width: 2px !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    color: #ffffff !important;
                `;
                child.setAttribute('fill', '#ffffff');
                child.setAttribute('stroke', '#ffffff');
            });
            
            console.log(`✅ Forced SVG ${index + 1} - Children: ${children.length}`);
        });
        
        // Force a reflow
        this.elements.grid.style.display = 'none';
        this.elements.grid.offsetHeight;
        this.elements.grid.style.display = 'grid';
        
        console.log('🏁 Emergency SVG visibility force complete');
        
        // Validate results
        setTimeout(() => {
            this.validateSVGVisibility();
        }, 100);
    }
    
    getFallbackIconSVG() {
        return `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style="fill: #ffffff; stroke: #ffffff;">
                <rect x="4" y="4" width="24" height="24" stroke="#ffffff" stroke-width="2" rx="4" fill="none"/>
                <path d="M12 16h8M16 12v8" stroke="#ffffff" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="#ffffff" font-size="8">?</text>
            </svg>
        `;
    }
    
    selectIcon(iconId) {
        // Remove previous selection
        this.elements.grid.querySelectorAll('.icon-gallery-item').forEach(item => 
            item.classList.remove('selected'));
        
        // Add selection to clicked item
        const selectedItem = this.elements.grid.querySelector(`[data-icon-id="${iconId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            this.selectedIcon = iconId;
            this.elements.selectBtn.disabled = false;
        }
    }
    
    updateInfo() {
        const iconCount = document.getElementById('icon-count');
        if (iconCount) {
            iconCount.textContent = this.filteredIcons.length;
        }
    }
    
    confirmSelection() {
        if (this.selectedIcon && this.options.onSelect) {
            const selectedIconData = this.allIcons.find(icon => icon.id === this.selectedIcon);
            this.options.onSelect(selectedIconData);
        }
        this.close();
    }
    
    open(initialSelection = null) {
        if (initialSelection) {
            this.selectedIcon = initialSelection;
        }
        
        this.isVisible = true;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus search input
        setTimeout(() => {
            this.elements.searchInput.focus();
        }, 100);
        
        // Always re-render icons to ensure fresh state
        console.log('🎨 Gallery opening - forcing icon re-render...');
        this.svgsLoaded = false; // Force reload
        this.filterAndRenderIcons();
        
        // DETAILED DEBUGGING: Compare with working test modal
        setTimeout(() => {
            console.log('🔍 === DETAILED GALLERY DEBUG ===');
            console.log('Modal element:', this.modal);
            console.log('Modal classList:', this.modal.classList.toString());
            console.log('Modal visible?', this.modal.style.display, this.modal.offsetHeight > 0);
            console.log('Grid element:', this.elements.grid);
            console.log('Grid innerHTML length:', this.elements.grid?.innerHTML?.length || 0);
            
            const placeholders = this.elements.grid?.querySelectorAll('.icon-placeholder') || [];
            console.log('Placeholders found:', placeholders.length);
            
            if (placeholders.length > 0) {
                console.log('First placeholder:', placeholders[0]);
                console.log('First placeholder dataset:', placeholders[0].dataset);
                console.log('First placeholder innerHTML:', placeholders[0].innerHTML.substring(0, 50));
                console.log('First placeholder styles:', window.getComputedStyle(placeholders[0]));
                
                // Check parent containers
                let parent = placeholders[0].parentElement;
                while (parent && parent !== document.body) {
                    console.log('Parent element:', parent.tagName, parent.className, 'visible:', window.getComputedStyle(parent).display !== 'none');
                    parent = parent.parentElement;
                }
            }
            
            // Compare CSS
            console.log('Gallery modal CSS classes:', this.modal.className);
            console.log('Test modal CSS classes:', document.getElementById('test-svg-modal')?.className || 'not found');
        }, 100);
        
        // Load SVGs after DOM is ready
        setTimeout(() => {
            if (this.isVisible) {
                console.log('🎨 Starting SVG loading sequence...');
                this.loadVisibleSVGs();
                
                // Make debug functions available globally
                window.debugIconGallery = () => this.debugIconLoading();
                window.testIconGallery = () => this.testSVGLoading();
                window.validateIconGallery = () => this.validateSVGVisibility();
                window.forceSVGVisibility = () => this.forceAllSVGsVisible();
            }
        }, 300); // Increased delay to ensure DOM is stable
        
        // Update select button state
        this.elements.selectBtn.disabled = !this.selectedIcon;
        
        console.log('🎨 Icon Gallery opened');
    }
    
    close() {
        this.isVisible = false;
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        
        if (this.options.onCancel) {
            this.options.onCancel();
        }
        
        console.log('🎨 Icon Gallery closed');
    }
    
    // Public API methods
    setSelection(iconId) {
        this.selectedIcon = iconId;
        if (this.isVisible) {
            this.selectIcon(iconId);
        }
    }
    
    getSelection() {
        if (this.selectedIcon) {
            return this.allIcons.find(icon => icon.id === this.selectedIcon);
        }
        return null;
    }
    
    destroy() {
        if (this.modal) {
            this.modal.remove();
        }
        console.log('🎨 Icon Gallery destroyed');
    }
}

/**
 * Icon Gallery Trigger Button Component
 * A button that opens the icon gallery and displays the selected icon
 */
class IconGalleryTrigger {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            placeholder: 'Choose Icon',
            selectedIconId: null,
            onSelect: null,
            galleryOptions: {},
            ...options
        };
        
        this.selectedIcon = null;
        this.gallery = null;
        
        this.init();
    }
    
    init() {
        this.createButton();
        this.setupGallery();
        
        // Set initial selection if provided
        if (this.options.selectedIconId) {
            this.setSelection(this.options.selectedIconId);
        }
    }
    
    createButton() {
        this.button = document.createElement('button');
        this.button.className = 'icon-gallery-trigger';
        this.button.innerHTML = this.getButtonHTML();
        
        this.button.addEventListener('click', () => {
            this.openGallery();
        });
        
        this.container.appendChild(this.button);
    }
    
    getButtonHTML() {
        if (this.selectedIcon) {
            return `
                <div class="current-icon" data-icon-path="${this.selectedIcon.fullPath}">
                    <!-- SVG will be loaded here -->
                </div>
                <span class="trigger-text">${this.selectedIcon.originalName}</span>
            `;
        } else {
            return `
                <svg class="current-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="3"/>
                    <path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="trigger-text">${this.options.placeholder}</span>
            `;
        }
    }
    
    setupGallery() {
        this.gallery = new IconGallery({
            ...this.options.galleryOptions,
            onSelect: (iconData) => {
                this.setSelection(iconData.id);
                if (this.options.onSelect) {
                    this.options.onSelect(iconData);
                }
            },
            onCancel: () => {
                // Gallery closed without selection
            },
            initialSelection: this.options.selectedIconId
        });
    }
    
    async setSelection(iconId) {
        if (this.gallery) {
            const iconData = this.gallery.allIcons.find(icon => icon.id === iconId);
            if (iconData) {
                this.selectedIcon = iconData;
                this.button.innerHTML = this.getButtonHTML();
                this.button.classList.add('has-selection');
                
                // Load the SVG
                await this.loadSelectedIconSVG();
                
                // Update gallery selection
                this.gallery.setSelection(iconId);
            }
        }
    }
    
    async loadSelectedIconSVG() {
        if (this.selectedIcon) {
            const iconContainer = this.button.querySelector('[data-icon-path]');
            if (iconContainer && !iconContainer.innerHTML.trim()) {
                try {
                    const response = await fetch(this.selectedIcon.fullPath);
                    if (response.ok) {
                        const svgContent = await response.text();
                        iconContainer.innerHTML = svgContent;
                    }
                } catch (error) {
                    console.warn('Failed to load selected icon SVG:', error);
                }
            }
        }
    }
    
    openGallery() {
        if (this.gallery) {
            this.gallery.open(this.selectedIcon?.id);
        }
    }
    
    getSelection() {
        return this.selectedIcon;
    }
    
    destroy() {
        if (this.gallery) {
            this.gallery.destroy();
        }
        if (this.button) {
            this.button.remove();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IconGallery, IconGalleryTrigger };
} else {
    window.IconGallery = IconGallery;
    window.IconGalleryTrigger = IconGalleryTrigger;
} 