/**
 * Simple Icon Gallery - A reliable, minimal icon selection component
 * Uses img tags with SVG sources for maximum compatibility
 */
class SimpleIconGallery {
    constructor(options = {}) {
        this.options = {
            iconBasePath: options.iconBasePath || 'templates/template_001/assets/icons/',
            onSelect: options.onSelect || null,
            onCancel: options.onCancel || null,
            ...options
        };
        
        this.isOpen = false;
        this.modal = null;
        this.currentCallback = null;
        
        // Hardcoded icon list for reliability - no JSON dependencies
        this.icons = this.generateIconList();
        
        // Custom uploaded icons storage (in localStorage for persistence)
        this.customIcons = this.loadCustomIcons();
        
        console.log('🎨 SimpleIconGallery initialized with', this.icons.length, 'preset icons and', this.customIcons.length, 'custom icons');
    }
    
    /**
     * Generate icon list from known pattern (icon-001-arrow.svg to icon-064-misc.svg)
     */
    generateIconList() {
        const icons = [];
        
        // Arrow icons (001-022)
        for (let i = 1; i <= 22; i++) {
            icons.push({
                id: `arrow-${i.toString().padStart(3, '0')}`,
                filename: `icon-${i.toString().padStart(3, '0')}-arrow.svg`,
                name: `Arrow ${i}`,
                category: 'arrow'
            });
        }
        
        // Celebration icons (023-049)
        for (let i = 23; i <= 49; i++) {
            icons.push({
                id: `celebration-${i.toString().padStart(3, '0')}`,
                filename: `icon-${i.toString().padStart(3, '0')}-celebration.svg`,
                name: `Celebration ${i - 22}`,
                category: 'celebration'
            });
        }
        
        // Stars icons (050-060)
        for (let i = 50; i <= 60; i++) {
            icons.push({
                id: `stars-${i.toString().padStart(3, '0')}`,
                filename: `icon-${i.toString().padStart(3, '0')}-stars.svg`,
                name: `Stars ${i - 49}`,
                category: 'stars'
            });
        }
        
        // Special icons (061-064)
        icons.push({
            id: 'technology-061',
            filename: 'icon-061-technology.svg',
            name: 'Technology',
            category: 'misc'
        });
        
        for (let i = 62; i <= 64; i++) {
            icons.push({
                id: `misc-${i.toString().padStart(3, '0')}`,
                filename: `icon-${i.toString().padStart(3, '0')}-misc.svg`,
                name: `Misc ${i - 61}`,
                category: 'misc'
            });
        }
        
        return icons;
    }
    
    /**
     * Load custom icons from localStorage
     */
    loadCustomIcons() {
        try {
            const stored = localStorage.getItem('wix_custom_icons');
            if (stored) {
                const customIcons = JSON.parse(stored);
                console.log('📂 Loaded', customIcons.length, 'custom icons from storage');
                return customIcons;
            }
        } catch (error) {
            console.warn('Failed to load custom icons from storage:', error);
        }
        return [];
    }
    
    /**
     * Save custom icons to localStorage
     */
    saveCustomIcons() {
        try {
            localStorage.setItem('wix_custom_icons', JSON.stringify(this.customIcons));
            console.log('💾 Saved', this.customIcons.length, 'custom icons to storage');
        } catch (error) {
            console.error('Failed to save custom icons:', error);
        }
    }
    
    /**
     * Add a custom icon to the gallery
     */
    addCustomIcon(iconData) {
        // Generate unique ID based on filename and timestamp
        const id = `custom-${Date.now()}-${iconData.filename.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        const customIcon = {
            id: id,
            filename: iconData.filename,
            name: iconData.name || iconData.filename.replace(/\.[^/.]+$/, ""), // Remove extension
            category: 'custom',
            dataURL: iconData.dataURL, // Store the base64 data
            uploadDate: new Date().toISOString(),
            fileSize: iconData.fileSize || 0
        };
        
        // Add to custom icons array
        this.customIcons.unshift(customIcon); // Add to beginning for easy access
        
        // Save to localStorage
        this.saveCustomIcons();
        
        console.log('✅ Added custom icon:', customIcon.name);
        return customIcon;
    }
    
    /**
     * Get all icons (preset + custom)
     */
    getAllIcons() {
        return [...this.customIcons, ...this.icons];
    }
    
    /**
     * Open the gallery with a selection callback
     */
    open(callback = null) {
        if (this.isOpen) return;
        
        this.currentCallback = callback || this.options.onSelect;
        this.createModal();
        this.isOpen = true;
        
        console.log('📖 Opening SimpleIconGallery');
    }
    
    /**
     * Close the gallery
     */
    close() {
        if (!this.isOpen) return;
        
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
        
        this.isOpen = false;
        this.currentCallback = null;
        
        console.log('📕 Closing SimpleIconGallery');
    }
    
    /**
     * Create the modal DOM structure
     */
    createModal() {
        // Remove any existing modal
        const existing = document.getElementById('simple-icon-gallery-modal');
        if (existing) existing.remove();
        
        // Create modal
        this.modal = document.createElement('div');
        this.modal.id = 'simple-icon-gallery-modal';
        const allIconsCount = this.getAllIcons().length;
        const customIconsCount = this.customIcons.length;
        
        this.modal.innerHTML = `
            <div class="simple-gallery-overlay">
                <div class="simple-gallery-modal">
                    <div class="simple-gallery-header">
                        <h3>Choose an Icon</h3>
                        <button class="simple-gallery-close" aria-label="Close gallery">×</button>
                    </div>
                    
                    <div class="simple-gallery-upload-section">
                        <button class="upload-custom-icon-btn" id="upload-custom-icon">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1v10M4 7l4-4 4 4M2 14h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Upload Custom Icon
                        </button>
                        <span class="upload-hint">SVG, PNG up to 2MB</span>
                        <input type="file" id="custom-icon-input" accept=".svg,.png" style="display: none;">
                    </div>
                    
                    <div class="simple-gallery-categories">
                        <button class="category-btn active" data-category="all">All (${allIconsCount})</button>
                        ${customIconsCount > 0 ? `<button class="category-btn" data-category="custom">Custom (${customIconsCount})</button>` : ''}
                        <button class="category-btn" data-category="arrow">Arrows (22)</button>
                        <button class="category-btn" data-category="celebration">Celebration (27)</button>
                        <button class="category-btn" data-category="stars">Stars (11)</button>
                        <button class="category-btn" data-category="misc">Misc (4)</button>
                    </div>
                    
                    <div class="simple-gallery-grid" id="simple-gallery-grid">
                        <!-- Icons will be inserted here -->
                    </div>
                    
                    <div class="simple-gallery-footer">
                        <button class="simple-gallery-cancel">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
        
        // Add to DOM
        document.body.appendChild(this.modal);
        
        // Add event listeners
        this.addEventListeners();
        
        // Load icons
        this.loadIcons('all');
    }
    
    /**
     * Add CSS styles for the gallery
     */
    addStyles() {
        if (document.getElementById('simple-gallery-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'simple-gallery-styles';
        style.textContent = `
            .simple-gallery-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            }
            
            .simple-gallery-modal {
                background: #1a1a1a;
                border-radius: 12px;
                padding: 24px;
                width: 90%;
                max-width: 700px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                border: 2px solid #0066ff;
                box-shadow: 0 20px 60px rgba(0, 102, 255, 0.3);
            }
            
            .simple-gallery-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                color: white;
            }
            
            .simple-gallery-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }
            
            .simple-gallery-close {
                background: #ff4444;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                transition: background 0.2s;
            }
            
            .simple-gallery-close:hover {
                background: #ff6666;
            }
            
            .simple-gallery-upload-section {
                margin: 0 0 20px 0;
                padding: 16px;
                background: #262626;
                border-radius: 8px;
                border: 2px dashed #555;
                text-align: center;
                transition: all 0.2s;
            }
            
            .simple-gallery-upload-section:hover {
                border-color: #0066ff;
                background: #2a2a2a;
            }
            
            .upload-custom-icon-btn {
                background: #0066ff;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
                margin-bottom: 8px;
            }
            
            .upload-custom-icon-btn:hover {
                background: #0052cc;
                transform: translateY(-1px);
            }
            
            .upload-hint {
                display: block;
                color: #888;
                font-size: 12px;
                margin-top: 4px;
            }
            
            .simple-gallery-categories {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .category-btn {
                background: #333;
                color: #ccc;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .category-btn:hover {
                background: #444;
                color: white;
            }
            
            .category-btn.active {
                background: #0066ff;
                color: white;
            }
            
            .simple-gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
                gap: 12px;
                max-height: 400px;
                overflow-y: auto;
                padding: 16px;
                background: #0d0d0d;
                border-radius: 8px;
                border: 1px solid #333;
            }
            
            .simple-icon-item {
                background: #1a1a1a;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 80px;
                position: relative;
            }
            
            .simple-icon-item:hover {
                border-color: #0066ff;
                background: #222;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
            }
            
            .simple-icon-item.selected {
                border-color: #0066ff;
                background: #003366;
            }
            
            .simple-icon-preview {
                width: 40px;
                height: 40px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .simple-icon-preview img {
                max-width: 100%;
                max-height: 100%;
                filter: brightness(0) saturate(100%) invert(100%);
                transition: filter 0.2s;
            }
            
            .simple-icon-item:hover .simple-icon-preview img {
                filter: brightness(0) saturate(100%) invert(50%) sepia(93%) saturate(1500%) hue-rotate(200deg);
            }
            
            .simple-icon-name {
                font-size: 10px;
                color: #ccc;
                text-align: center;
                line-height: 1.2;
            }
            
            .simple-icon-loading {
                color: #666;
                font-size: 12px;
            }
            
            .simple-icon-error {
                color: #ff6666;
                font-size: 10px;
                text-align: center;
            }
            
            .simple-gallery-footer {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
            }
            
            .simple-gallery-cancel {
                background: #666;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s;
            }
            
            .simple-gallery-cancel:hover {
                background: #777;
            }
            
            /* Custom scrollbar for grid */
            .simple-gallery-grid::-webkit-scrollbar {
                width: 8px;
            }
            
            .simple-gallery-grid::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 4px;
            }
            
            .simple-gallery-grid::-webkit-scrollbar-thumb {
                background: #666;
                border-radius: 4px;
            }
            
            .simple-gallery-grid::-webkit-scrollbar-thumb:hover {
                background: #888;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Add event listeners to modal elements
     */
    addEventListeners() {
        // Close button
        const closeBtn = this.modal.querySelector('.simple-gallery-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Cancel button
        const cancelBtn = this.modal.querySelector('.simple-gallery-cancel');
        cancelBtn.addEventListener('click', () => this.close());
        
        // Category buttons
        const categoryBtns = this.modal.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Load icons for category
                const category = btn.dataset.category;
                this.loadIcons(category);
            });
        });
        
        // Click outside to close
        this.modal.querySelector('.simple-gallery-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.close();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', this.handleEscapeKey.bind(this));
        
        // Upload functionality
        this.setupUploadFunctionality();
    }
    
    /**
     * Handle escape key press
     */
    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.close();
        }
    }
    
    /**
     * Setup upload functionality
     */
    setupUploadFunctionality() {
        const uploadBtn = this.modal.querySelector('#upload-custom-icon');
        const fileInput = this.modal.querySelector('#custom-icon-input');
        
        if (!uploadBtn || !fileInput) {
            console.warn('Upload elements not found');
            return;
        }
        
        // Click upload button to trigger file input
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileUpload(file);
            }
        });
        
        // Drag and drop support
        const uploadSection = this.modal.querySelector('.simple-gallery-upload-section');
        if (uploadSection) {
            uploadSection.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadSection.style.borderColor = '#0066ff';
                uploadSection.style.background = '#2a2a2a';
            });
            
            uploadSection.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadSection.style.borderColor = '#555';
                uploadSection.style.background = '#262626';
            });
            
            uploadSection.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadSection.style.borderColor = '#555';
                uploadSection.style.background = '#262626';
                
                const files = Array.from(e.dataTransfer.files);
                const file = files.find(f => f.type === 'image/svg+xml' || f.type === 'image/png');
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }
    }
    
    /**
     * Handle file upload
     */
    async handleFileUpload(file) {
        console.log('📁 Processing uploaded file:', file.name);
        
        // Validate file type
        if (!['image/svg+xml', 'image/png'].includes(file.type)) {
            alert('Please upload SVG or PNG files only.');
            return;
        }
        
        // Validate file size (2MB limit)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            alert('File size must be under 2MB.');
            return;
        }
        
        try {
            // Show loading state
            const uploadBtn = this.modal.querySelector('#upload-custom-icon');
            const originalHTML = uploadBtn.innerHTML;
            uploadBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="37.7" stroke-dashoffset="37.7">
                        <animate attributeName="stroke-dashoffset" dur="1s" values="37.7;0;37.7" repeatCount="indefinite"/>
                    </circle>
                </svg>
                Processing...
            `;
            uploadBtn.disabled = true;
            
            // Convert file to data URL
            const dataURL = await this.fileToDataURL(file);
            
            // Create icon data
            const iconData = {
                filename: file.name,
                name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                dataURL: dataURL,
                fileSize: file.size
            };
            
            // Add to custom icons
            const customIcon = this.addCustomIcon(iconData);
            
            // Update the UI
            this.refreshGallery();
            
            // Restore button
            uploadBtn.innerHTML = originalHTML;
            uploadBtn.disabled = false;
            
            // Show success message
            this.showUploadSuccess(customIcon.name);
            
            console.log('✅ File uploaded successfully:', customIcon.name);
            
        } catch (error) {
            console.error('❌ Upload failed:', error);
            alert('Upload failed: ' + error.message);
            
            // Restore button
            const uploadBtn = this.modal.querySelector('#upload-custom-icon');
            uploadBtn.innerHTML = originalHTML;
            uploadBtn.disabled = false;
        }
    }
    
    /**
     * Convert file to data URL
     */
    fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Refresh the gallery after adding custom icons
     */
    refreshGallery() {
        // Update category counts
        const allBtn = this.modal.querySelector('[data-category="all"]');
        const customBtn = this.modal.querySelector('[data-category="custom"]');
        
        if (allBtn) {
            allBtn.textContent = `All (${this.getAllIcons().length})`;
        }
        
        // Add custom category button if it doesn't exist
        if (!customBtn && this.customIcons.length > 0) {
            const categoriesDiv = this.modal.querySelector('.simple-gallery-categories');
            const customButton = document.createElement('button');
            customButton.className = 'category-btn';
            customButton.dataset.category = 'custom';
            customButton.textContent = `Custom (${this.customIcons.length})`;
            
            // Insert after "All" button
            const allButton = categoriesDiv.querySelector('[data-category="all"]');
            allButton.parentNode.insertBefore(customButton, allButton.nextSibling);
            
            // Add event listener
            customButton.addEventListener('click', () => {
                this.modal.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                customButton.classList.add('active');
                this.loadIcons('custom');
            });
        } else if (customBtn) {
            customBtn.textContent = `Custom (${this.customIcons.length})`;
        }
        
        // Reload current category
        const activeBtn = this.modal.querySelector('.category-btn.active');
        const currentCategory = activeBtn ? activeBtn.dataset.category : 'all';
        this.loadIcons(currentCategory);
    }
    
    /**
     * Show upload success message
     */
    showUploadSuccess(iconName) {
        const uploadSection = this.modal.querySelector('.simple-gallery-upload-section');
        const originalHTML = uploadSection.innerHTML;
        
        uploadSection.innerHTML = `
            <div style="color: #22c55e; font-weight: 500;">
                ✅ "${iconName}" uploaded successfully!
            </div>
            <div style="color: #888; font-size: 12px; margin-top: 4px;">
                Your custom icon is now available in the Custom category
            </div>
        `;
        
        setTimeout(() => {
            uploadSection.innerHTML = originalHTML;
            this.setupUploadFunctionality(); // Re-setup event listeners
        }, 3000);
    }
    
    /**
     * Load icons for a specific category
     */
    loadIcons(category = 'all') {
        const grid = this.modal.querySelector('#simple-gallery-grid');
        grid.innerHTML = '';
        
        let iconsToShow;
        if (category === 'all') {
            iconsToShow = this.getAllIcons();
        } else if (category === 'custom') {
            iconsToShow = this.customIcons;
        } else {
            iconsToShow = this.icons.filter(icon => icon.category === category);
        }
            
        console.log(`🔄 Loading ${iconsToShow.length} icons for category: ${category}`);
        
        iconsToShow.forEach(icon => {
            const iconElement = this.createIconElement(icon);
            grid.appendChild(iconElement);
        });
    }
    
    /**
     * Create a single icon element
     */
    createIconElement(icon) {
        const iconItem = document.createElement('div');
        iconItem.className = 'simple-icon-item';
        iconItem.dataset.iconId = icon.id;
        
        iconItem.innerHTML = `
            <div class="simple-icon-preview">
                <div class="simple-icon-loading">Loading...</div>
            </div>
            <div class="simple-icon-name">${icon.name}</div>
        `;
        
        // Add click handler
        iconItem.addEventListener('click', () => this.selectIcon(icon, iconItem));
        
        // Load the icon image
        this.loadIconImage(icon, iconItem);
        
        return iconItem;
    }
    
    /**
     * Load the icon image safely using img tag
     */
    loadIconImage(icon, iconElement) {
        const preview = iconElement.querySelector('.simple-icon-preview');
        
        // For custom icons, use dataURL; for preset icons, use file path
        const iconSrc = icon.category === 'custom' 
            ? icon.dataURL 
            : this.options.iconBasePath + icon.filename;
        
        // Create img element
        const img = document.createElement('img');
        img.alt = icon.name;
        img.title = icon.name;
        
        // Handle successful load
        img.onload = () => {
            preview.innerHTML = '';
            preview.appendChild(img);
        };
        
        // Handle load error
        img.onerror = () => {
            preview.innerHTML = `<div class="simple-icon-error">Failed to load</div>`;
            console.warn('Failed to load icon:', iconSrc);
        };
        
        // Set source to trigger load
        img.src = iconSrc;
    }
    
    /**
     * Handle icon selection
     */
    selectIcon(icon, iconElement) {
        // Visual feedback
        this.modal.querySelectorAll('.simple-icon-item').forEach(item => {
            item.classList.remove('selected');
        });
        iconElement.classList.add('selected');
        
        console.log('🎯 Icon selected:', icon.name);
        
        // Prepare icon data for callback
        const iconData = {
            id: icon.id,
            filename: icon.filename,
            name: icon.name,
            category: icon.category,
            path: icon.category === 'custom' ? icon.dataURL : this.options.iconBasePath + icon.filename,
            fullPath: icon.category === 'custom' ? icon.dataURL : this.options.iconBasePath + icon.filename, // Template editor expects this property
            originalName: icon.name, // For compatibility with existing code
            isCustom: icon.category === 'custom' // Flag for custom handling
        };
        
        // Call the selection callback
        if (this.currentCallback) {
            try {
                this.currentCallback(iconData);
            } catch (error) {
                console.error('Error in icon selection callback:', error);
            }
        }
        
        // Close modal after short delay for visual feedback
        setTimeout(() => {
            this.close();
        }, 200);
    }
}

// Export for global use
window.SimpleIconGallery = SimpleIconGallery;

console.log('✅ SimpleIconGallery loaded and ready'); 