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
        if (this.filteredIcons.length === 0) {
            this.elements.grid.innerHTML = this.getEmptyHTML();
            return;
        }
        
        const iconsHTML = this.filteredIcons.map(icon => `
            <div class="icon-gallery-item ${this.selectedIcon === icon.id ? 'selected' : ''}" 
                 data-icon-id="${icon.id}" 
                 title="${icon.originalName}">
                <div class="icon-number">${icon.id}</div>
                <div class="icon-placeholder" data-icon-path="${icon.fullPath}">
                    <!-- SVG will be loaded here -->
                </div>
            </div>
        `).join('');
        
        this.elements.grid.innerHTML = iconsHTML;
        
        // Load SVGs asynchronously
        this.loadVisibleSVGs();
    }
    
    async loadVisibleSVGs() {
        if (this.svgsLoaded) {
            console.log('🎨 SVGs already loaded, skipping...');
            return;
        }
        
        const iconPlaceholders = this.elements.grid.querySelectorAll('.icon-placeholder');
        console.log(`🎨 Loading SVGs for ${iconPlaceholders.length} icons...`);
        console.log(`🎨 Grid element:`, this.elements.grid);
        console.log(`🎨 First placeholder:`, iconPlaceholders[0]);
        
        if (iconPlaceholders.length === 0) {
            console.warn('❌ No icon placeholders found');
            console.warn('❌ Grid HTML:', this.elements.grid.innerHTML.substring(0, 200));
            return;
        }
        
        this.svgsLoaded = true;
        
        // Use simple loading instead of intersection observer for debugging
        for (const placeholder of iconPlaceholders) {
            const iconPath = placeholder.dataset.iconPath;
            
            if (iconPath && !placeholder.innerHTML.trim()) {
                try {
                    console.log(`📥 Loading icon: ${iconPath}`);
                    
                    // Verify path exists first
                    const testResponse = await fetch(iconPath, { method: 'HEAD' });
                    if (!testResponse.ok) {
                        console.warn(`❌ Icon not found: ${iconPath} (HEAD check failed)`);
                        placeholder.innerHTML = this.getFallbackIconSVG();
                        continue;
                    }
                    
                    const response = await fetch(iconPath);
                    if (response.ok) {
                        const svgContent = await response.text();
                        placeholder.innerHTML = svgContent;
                        
                        // Force white color on all SVG elements
                        const svg = placeholder.querySelector('svg');
                        if (svg) {
                            svg.style.fill = '#ffffff';
                            svg.style.stroke = '#ffffff';
                            svg.style.width = '32px';
                            svg.style.height = '32px';
                            svg.style.display = 'block';
                            
                            // Override all child elements
                            const allElements = svg.querySelectorAll('*');
                            allElements.forEach(el => {
                                el.style.fill = '#ffffff';
                                el.style.stroke = '#ffffff';
                            });
                        }
                        
                        console.log(`✅ Loaded icon: ${iconPath}`);
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
        
        console.log('🎨 SVG loading complete');
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
        
        // Load SVGs after DOM is ready
        setTimeout(() => {
            if (this.isVisible) {
                console.log('🎨 Starting SVG loading sequence...');
                this.loadVisibleSVGs();
            }
        }, 200);
        
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