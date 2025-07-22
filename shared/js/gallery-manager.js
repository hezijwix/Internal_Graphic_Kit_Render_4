// Gallery Manager - Template Gallery Page
// Integrated with ProjectManager for user project management

class GalleryManager {
    constructor() {
        this.templates = [];
        this.projects = [];
        this.gridContainer = document.getElementById('template-grid');
        this.projectManager = new ProjectManager();
        this.currentFilter = 'all';
        this.setupFilters();
        this.setupModal();
    }

    async loadTemplates() {
        try {
            // Load templates from JSON
            const response = await fetch('api/templates.json');
            const data = await response.json();
            this.templates = data.templates;
            
            // Load user projects
            this.projects = this.projectManager.getAllProjects();
            
            this.renderGallery();
        } catch (error) {
            console.error('Failed to load templates:', error);
            // Use hardcoded template for now
            this.templates = [{
                id: 'template_001',
                name: 'Animated Title Card',
                description: 'Professional animated title card with icons and multiple text elements',
                features: ['Icon Upload', 'Color Control', 'Multi-Text', 'GSAP Animation'],
                category: 'titles',
                file: 'template_001.html',
                thumbnail: 'shared/assets/template-001-thumb.svg'
            }];
            this.projects = this.projectManager.getAllProjects();
            this.renderGallery();
        }
    }

    async loadProjects() {
        console.log('Loading projects...');
        this.projects = this.projectManager.getAllProjects();
        console.log(`Loaded ${this.projects.length} projects:`, this.projects);
        
        // Debug thumbnail data
        this.projects.forEach(project => {
            console.log(`Project "${project.name}":`, {
                id: project.id,
                hasThumbnail: !!project.thumbnail,
                thumbnailSize: project.thumbnail ? project.thumbnail.length : 0,
                modified: project.modified
            });
        });
        
        this.renderGallery();
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.category-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Apply filter
                this.currentFilter = e.target.dataset.category;
                this.renderGallery();
            });
        });
    }

    setupModal() {
        const modal = document.getElementById('template-selection-modal');
        const closeBtn = document.getElementById('modal-close');
        const overlay = modal?.querySelector('.modal-overlay');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideTemplateSelectionModal());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.hideTemplateSelectionModal());
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                this.hideTemplateSelectionModal();
            }
        });

        // Refresh projects when page becomes visible (user returns from editor)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('Page became visible, refreshing projects...');
                this.loadProjects();
            }
        });
    }

    showTemplateSelectionModal() {
        const modal = document.getElementById('template-selection-modal');
        const templateOptions = document.getElementById('template-options');
        
        if (!modal || !templateOptions) return;

        // Clear existing options
        templateOptions.innerHTML = '';

        // Populate with available templates
        this.templates.forEach(template => {
            const option = document.createElement('div');
            option.className = 'template-option';
            option.innerHTML = `
                <h4>${template.name}</h4>
                <p>${template.description}</p>
                <div class="template-features">
                    ${template.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
            `;
            
            option.addEventListener('click', () => {
                this.hideTemplateSelectionModal();
                this.createProjectFromTemplate(template);
            });
            
            templateOptions.appendChild(option);
        });

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideTemplateSelectionModal() {
        const modal = document.getElementById('template-selection-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    renderGallery() {
        if (!this.gridContainer) return;
        
        // Keep the create project card
        const createCard = document.getElementById('create-project-card');
        this.gridContainer.innerHTML = '';
        
        // Re-add create project card if it exists
        if (createCard) {
            this.gridContainer.appendChild(createCard);
        }
        
        // Filter and render based on current filter
        let itemsToShow = [];
        
        switch (this.currentFilter) {
            case 'projects':
                itemsToShow = this.projects.map(p => ({ type: 'project', data: p }));
                break;
            case 'titles':
                // Don't show templates directly anymore, just projects from that category
                itemsToShow = this.projects.filter(p => {
                    const template = this.templates.find(t => t.id === p.templateId);
                    return template && template.category === 'titles';
                }).map(p => ({ type: 'project', data: p }));
                break;
            case 'overlays':
                itemsToShow = this.projects.filter(p => {
                    const template = this.templates.find(t => t.id === p.templateId);
                    return template && template.category === 'overlays';
                }).map(p => ({ type: 'project', data: p }));
                break;
            case 'intros':
                itemsToShow = this.projects.filter(p => {
                    const template = this.templates.find(t => t.id === p.templateId);
                    return template && template.category === 'intros';
                }).map(p => ({ type: 'project', data: p }));
                break;
            case 'outros':
                itemsToShow = this.projects.filter(p => {
                    const template = this.templates.find(t => t.id === p.templateId);
                    return template && template.category === 'outros';
                }).map(p => ({ type: 'project', data: p }));
                break;
            default: // 'all'
                itemsToShow = this.projects.map(p => ({ type: 'project', data: p }));
        }

        // Render filtered items (only projects now)
        itemsToShow.forEach(item => {
            if (item.type === 'project') {
                const projectCard = this.createProjectCard(item.data);
                this.gridContainer.appendChild(projectCard);
            }
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'template-card project-card';
        
        const thumbnailSrc = project.thumbnail || 'shared/assets/default-project.svg';
        const lastModified = new Date(project.modified).toLocaleDateString();
        
        console.log(`Creating project card for "${project.name}":`, {
            hasThumbnail: !!project.thumbnail,
            thumbnailSrc: project.thumbnail ? 'data:image/jpeg;base64...' : thumbnailSrc,
            thumbnailLength: project.thumbnail ? project.thumbnail.length : 0
        });
        
        card.innerHTML = `
            <div class="template-thumbnail">
                <img src="${thumbnailSrc}" alt="${project.name}" 
                     onerror="console.error('Failed to load thumbnail for ${project.name}'); this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDM1MCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMUExQTFBIi8+CjxjaXJjbGUgY3g9IjE3NSIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiMwMDY2RkYiLz4KPHN2Zz4K'"
                     onload="console.log('Thumbnail loaded successfully for ${project.name}')">
                <div class="project-badge">Project</div>
                <div class="project-actions">
                    <button class="project-menu-btn" data-project="${project.id}" aria-label="Project actions">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="3" r="1" fill="currentColor"/>
                            <circle cx="8" cy="8" r="1" fill="currentColor"/>
                            <circle cx="8" cy="13" r="1" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="template-info">
                <h3>${project.name}</h3>
                <p>Last modified: ${lastModified}</p>
                <div class="template-features">
                    <span class="feature-tag">${project.templateId}</span>
                </div>
            </div>
        `;

        // Add click event to entire card for direct editing
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on menu button
            if (!e.target.closest('.project-menu-btn')) {
                this.editProject(project);
            }
        });

        // Add menu button event
        const menuBtn = card.querySelector('.project-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                this.showProjectMenu(e, project);
            });
        }

        return card;
    }

    createProjectFromTemplate(template) {
        // Create new project from template
        const projectName = prompt('Enter project name:', `My ${template.name}`);
        if (projectName && projectName.trim()) {
            const project = this.projectManager.createProject(template.id, projectName.trim());
            // Navigate to template editor with project ID
            window.location.href = `${template.file}?projectId=${project.id}`;
        }
    }

    editProject(project) {
        // Navigate to template editor with project ID
        const templateFile = this.templates.find(t => t.id === project.templateId)?.file || 'template_001.html';
        window.location.href = `${templateFile}?projectId=${project.id}`;
    }

    showProjectMenu(event, project) {
        event.preventDefault();
        event.stopPropagation();
        
        // Remove existing menus
        this.closeProjectMenus();
        
        const menu = document.createElement('div');
        menu.className = 'project-context-menu';
        menu.innerHTML = `
            <button class="menu-item" data-action="rename">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M8 2L12 6L4.5 13.5L1 13L1.5 9.5L9 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Rename
            </button>
            <button class="menu-item" data-action="duplicate">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="8" height="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <rect x="4" y="4" width="8" height="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>
                Duplicate
            </button>
            <button class="menu-item delete-item" data-action="delete">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M4 2V1C4 0.5 4.5 0 5 0H9C9.5 0 10 0.5 10 1V2M2 4H12M3 4L3.5 10C3.5 10.5 4 11 4.5 11H9.5C10 11 10.5 10.5 10.5 10L11 4" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                Delete
            </button>
        `;

        // Position menu near click
        const rect = event.target.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = rect.bottom + 'px';
        menu.style.left = rect.left + 'px';
        menu.style.zIndex = '1000';
        
        document.body.appendChild(menu);
        
        // Add event listeners
        menu.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleProjectAction(action, project);
                this.closeProjectMenus();
            });
        });
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.closeProjectMenus.bind(this), { once: true });
        }, 0);
    }

    closeProjectMenus() {
        document.querySelectorAll('.project-context-menu').forEach(menu => {
            menu.remove();
        });
    }

    handleProjectAction(action, project) {
        switch (action) {
            case 'rename':
                this.renameProject(project);
                break;
            case 'duplicate':
                this.duplicateProject(project);
                break;
            case 'delete':
                this.deleteProject(project);
                break;
        }
    }

    renameProject(project) {
        const newName = prompt('Enter new project name:', project.name);
        if (newName && newName.trim() && newName.trim() !== project.name) {
            this.projectManager.renameProject(project.id, newName.trim());
            this.loadProjects(); // Refresh gallery
        }
    }

    duplicateProject(project) {
        const newName = prompt('Enter name for duplicated project:', `${project.name} (Copy)`);
        if (newName && newName.trim()) {
            this.projectManager.duplicateProject(project.id, newName.trim());
            this.loadProjects(); // Refresh gallery
        }
    }

    deleteProject(project) {
        if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
            this.projectManager.deleteProject(project.id);
            this.loadProjects(); // Refresh gallery
        }
    }

    renderError() {
        if (!this.gridContainer) return;
        
        this.gridContainer.innerHTML = `
            <div class="error-state">
                <h3>Failed to load templates</h3>
                <p>Please check your connection and try again.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// TODO FOR CLAUDE: Backend Integration Points
// 1. Replace 'api/templates.json' with actual API endpoint
// 2. Add user authentication checks
// 3. Add project management functionality
// 4. Add template creation/editing for admin users
// 5. Add preset management integration 