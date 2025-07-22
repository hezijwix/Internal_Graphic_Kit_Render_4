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
        
        // Load custom icons from localStorage
        this.customIcons = this.loadCustomIcons();
        
        console.log('🎨 SimpleIconGallery initialized with', this.icons.length, 'default icons and', this.customIcons.length, 'custom icons');
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
                console.log('📁 Loaded', customIcons.length, 'custom icons from localStorage');
                return customIcons;
            }
        } catch (error) {
            console.warn('Failed to load custom icons:', error);
        }
        return [];
    }
    
    /**
     * Save custom icons to localStorage
     */
    saveCustomIcons() {
        try {
            localStorage.setItem('wix_custom_icons', JSON.stringify(this.customIcons));
            console.log('💾 Saved', this.customIcons.length, 'custom icons to localStorage');
        } catch (error) {
            console.error('Failed to save custom icons:', error);
            // Check if storage is full
            if (error.name === 'QuotaExceededError') {
                alert('Storage full! Please remove some custom icons.');
            }
        }
    }
    
    /**
     * Add a custom icon
     */
    addCustomIcon(iconData) {
        // Generate unique ID
        const id = 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        const customIcon = {
            id: id,
            filename: iconData.filename,
            name: iconData.name,
            category: 'custom',
            dataUrl: iconData.dataUrl, // Base64 data URL
            uploadDate: new Date().toISOString(),
            fileType: iconData.fileType,
            fileSize: iconData.fileSize
        };
        
        this.customIcons.push(customIcon);
        this.saveCustomIcons();
        
        console.log('✅ Added custom icon:', customIcon.name);
        return customIcon;
    }
    
    /**
     * Remove a custom icon
     */
    removeCustomIcon(iconId) {
        const index = this.customIcons.findIndex(icon => icon.id === iconId);
        if (index !== -1) {
            const removed = this.customIcons.splice(index, 1)[0];
            this.saveCustomIcons();
            console.log('🗑️ Removed custom icon:', removed.name);
            return true;
        }
        return false;
    }
    
    /**
     * Get all icons (default + custom) for a category
     */
    getAllIcons(category = 'all') {
        if (category === 'all') {
            return [...this.icons, ...this.customIcons];
        } else if (category === 'custom') {
            return this.customIcons;
        } else {
            return this.icons.filter(icon => icon.category === category);
        }
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
        this.modal.innerHTML = `
            <div class="simple-gallery-overlay">
                <div class="simple-gallery-modal">
                    <div class="simple-gallery-header">
                        <h3>Choose an Icon</h3>
                        <button class="simple-gallery-close" aria-label="Close gallery">×</button>
                    </div>
                    
                    <div class="simple-gallery-categories">
                        <button class="category-btn active" data-category="all">All (${this.icons.length + this.customIcons.length})</button>
                        <button class="category-btn" data-category="arrow">Arrows (22)</button>
                        <button class="category-btn" data-category="celebration">Celebration (27)</button>
                        <button class="category-btn" data-category="stars">Stars (11)</button>
                        <button class="category-btn" data-category="misc">Misc (4)</button>
                        <button class="category-btn" data-category="custom">Custom (${this.customIcons.length})</button>
                    </div>
                    
                    <div class="simple-gallery-upload">
                        <button class="upload-icon-btn" id="upload-icon-btn">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 1v10M4 7l4-4 4 4M2 14h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Upload Custom Icon
                        </button>
                        <input type="file" id="icon-upload-input" accept=".svg,.png,.jpg,.jpeg" style="display: none;">
                        <span class="upload-hint">SVG, PNG, JPG up to 1MB</span>
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
            
            .simple-gallery-upload {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding: 12px;
                background: #0d0d0d;
                border-radius: 8px;
                border: 1px solid #333;
            }
            
            .upload-icon-btn {
                background: #0066ff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background 0.2s;
                font-weight: 500;
            }
            
            .upload-icon-btn:hover {
                background: #0052cc;
            }
            
            .upload-hint {
                font-size: 12px;
                color: #999;
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
            
            .simple-icon-item.custom {
                border-color: #ff6b35;
                background: #1a1a1a;
            }
            
            .simple-icon-item.custom:hover {
                border-color: #ff8c42;
                background: #2a1f1a;
                box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
            }
            
            .simple-icon-item.custom.selected {
                border-color: #ff6b35;
                background: #332211;
            }
            
            .custom-icon-badge {
                position: absolute;
                top: 4px;
                right: 4px;
                background: #ff6b35;
                color: white;
                font-size: 8px;
                padding: 2px 4px;
                border-radius: 3px;
                font-weight: 600;
                line-height: 1;
            }
            
            .custom-icon-delete {
                position: absolute;
                top: 2px;
                left: 2px;
                background: #ff4444;
                color: white;
                border: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 10px;
                display: none;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }
            
            .simple-icon-item.custom:hover .custom-icon-delete {
                display: flex;
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
        
        // Upload button
        const uploadBtn = this.modal.querySelector('#upload-icon-btn');
        const uploadInput = this.modal.querySelector('#icon-upload-input');
        
        uploadBtn.addEventListener('click', () => {
            uploadInput.click();
        });
        
        uploadInput.addEventListener('change', (e) => {
            this.handleIconUpload(e);
        });
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
     * Load icons for a specific category
     */
    loadIcons(category = 'all') {
        const grid = this.modal.querySelector('#simple-gallery-grid');
        grid.innerHTML = '';
        
        // Get all icons for the category (default + custom)
        const iconsToShow = this.getAllIcons(category);
            
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
        iconItem.className = icon.category === 'custom' ? 'simple-icon-item custom' : 'simple-icon-item';
        iconItem.dataset.iconId = icon.id;
        
        // Different HTML for custom vs default icons
        if (icon.category === 'custom') {
            iconItem.innerHTML = `
                <button class="custom-icon-delete" title="Remove custom icon">×</button>
                <div class="custom-icon-badge">CUSTOM</div>
                <div class="simple-icon-preview">
                    <div class="simple-icon-loading">Loading...</div>
                </div>
                <div class="simple-icon-name">${icon.name}</div>
            `;
            
            // Add delete handler for custom icons
            const deleteBtn = iconItem.querySelector('.custom-icon-delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent selection
                this.deleteCustomIcon(icon, iconItem);
            });
        } else {
            iconItem.innerHTML = `
                <div class="simple-icon-preview">
                    <div class="simple-icon-loading">Loading...</div>
                </div>
                <div class="simple-icon-name">${icon.name}</div>
            `;
        }
        
        // Add click handler for selection
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
            console.warn('Failed to load icon:', icon.category === 'custom' ? icon.dataUrl : iconPath);
        };
        
        // Set source - different for custom vs default icons
        if (icon.category === 'custom') {
            // Custom icons use data URL
            img.src = icon.dataUrl;
        } else {
            // Default icons use file path
            const iconPath = this.options.iconBasePath + icon.filename;
            img.src = iconPath;
        }
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
        
        // Prepare icon data for callback - different for custom vs default icons
        let iconData;
        
        if (icon.category === 'custom') {
            // Custom icons use data URL
            iconData = {
                id: icon.id,
                filename: icon.filename,
                name: icon.name,
                category: icon.category,
                path: icon.dataUrl, // Use data URL for custom icons
                fullPath: icon.dataUrl, // Template editor expects this property
                originalName: icon.name,
                isCustom: true,
                dataUrl: icon.dataUrl,
                fileType: icon.fileType,
                uploadDate: icon.uploadDate
            };
        } else {
            // Default icons use file path
            iconData = {
                id: icon.id,
                filename: icon.filename,
                name: icon.name,
                category: icon.category,
                path: this.options.iconBasePath + icon.filename,
                fullPath: this.options.iconBasePath + icon.filename, // Template editor expects this property
                originalName: icon.name,
                isCustom: false
            };
        }
        
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
    
    /**
     * Handle icon upload
     */
    async handleIconUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('📁 File selected for upload:', file.name, file.type, `${Math.round(file.size/1024)}KB`);
        
        // Validate file type
        const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select an SVG, PNG, or JPG file.');
            event.target.value = ''; // Reset input
            return;
        }
        
        // Validate file size (1MB limit)
        const maxSize = 1024 * 1024; // 1MB
        if (file.size > maxSize) {
            alert('File size must be less than 1MB. Please choose a smaller file.');
            event.target.value = ''; // Reset input
            return;
        }
        
        try {
            // Show loading state
            const uploadBtn = this.modal.querySelector('#upload-icon-btn');
            const originalHTML = uploadBtn.innerHTML;
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="37.7" stroke-dashoffset="37.7">
                        <animate attributeName="stroke-dashoffset" dur="1s" values="37.7;0;37.7" repeatCount="indefinite"/>
                    </circle>
                </svg>
                Uploading...
            `;
            
            // Convert file to data URL
            const dataUrl = await this.fileToDataUrl(file);
            
            // Generate a clean name from filename
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
            
            // Add to custom icons
            const iconData = {
                filename: file.name,
                name: cleanName || 'Custom Icon',
                dataUrl: dataUrl,
                fileType: file.type,
                fileSize: file.size
            };
            
            const customIcon = this.addCustomIcon(iconData);
            
            console.log('✅ Custom icon uploaded successfully:', customIcon.name);
            
            // Update category counts in UI
            this.updateCategoryCounts();
            
            // Refresh current view if showing 'all' or 'custom' category
            const activeCategory = this.modal.querySelector('.category-btn.active');
            const currentCategory = activeCategory ? activeCategory.dataset.category : 'all';
            
            if (currentCategory === 'all' || currentCategory === 'custom') {
                this.loadIcons(currentCategory);
            }
            
            // Switch to custom category to show the new icon
            const customCategoryBtn = this.modal.querySelector('[data-category="custom"]');
            if (customCategoryBtn) {
                // Update active state
                this.modal.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                customCategoryBtn.classList.add('active');
                this.loadIcons('custom');
            }
            
            // Show success message
            this.showNotification('Icon uploaded successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Upload failed:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            // Reset upload button
            const uploadBtn = this.modal.querySelector('#upload-icon-btn');
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1v10M4 7l4-4 4 4M2 14h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Upload Custom Icon
            `;
            
            // Reset file input
            event.target.value = '';
        }
    }
    
    /**
     * Convert file to data URL
     */
    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Delete a custom icon
     */
    deleteCustomIcon(icon, iconElement) {
        if (confirm(`Delete "${icon.name}"?\n\nThis action cannot be undone.`)) {
            const success = this.removeCustomIcon(icon.id);
            
            if (success) {
                // Remove from UI
                iconElement.remove();
                
                // Update category counts
                this.updateCategoryCounts();
                
                console.log('🗑️ Custom icon deleted:', icon.name);
                this.showNotification('Icon deleted successfully', 'info');
            } else {
                console.error('❌ Failed to delete icon:', icon.name);
                alert('Failed to delete icon. Please try again.');
            }
        }
    }
    
    /**
     * Update category button counts
     */
    updateCategoryCounts() {
        const allBtn = this.modal.querySelector('[data-category="all"]');
        const customBtn = this.modal.querySelector('[data-category="custom"]');
        
        if (allBtn) {
            allBtn.textContent = `All (${this.icons.length + this.customIcons.length})`;
        }
        
        if (customBtn) {
            customBtn.textContent = `Custom (${this.customIcons.length})`;
        }
    }
    
    /**
     * Show notification message
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `gallery-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10001;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Export for global use
window.SimpleIconGallery = SimpleIconGallery;

console.log('✅ SimpleIconGallery loaded and ready'); 