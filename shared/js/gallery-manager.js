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
            this.renderError();
        }
    }

    async loadProjects() {
        this.projects = this.projectManager.getAllProjects();
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

    renderGallery() {
        if (!this.gridContainer) return;
        
        this.gridContainer.innerHTML = '';
        
        // Filter and render based on current filter
        let itemsToShow = [];
        
        switch (this.currentFilter) {
            case 'templates':
                itemsToShow = this.templates.map(t => ({ type: 'template', data: t }));
                break;
            case 'projects':
                itemsToShow = this.projects.map(p => ({ type: 'project', data: p }));
                break;
            case 'titles':
                itemsToShow = this.templates.filter(t => t.category === 'titles').map(t => ({ type: 'template', data: t }));
                break;
            case 'overlays':
                itemsToShow = this.templates.filter(t => t.category === 'overlays').map(t => ({ type: 'template', data: t }));
                break;
            case 'intros':
                itemsToShow = this.templates.filter(t => t.category === 'intros').map(t => ({ type: 'template', data: t }));
                break;
            case 'outros':
                itemsToShow = this.templates.filter(t => t.category === 'outros').map(t => ({ type: 'template', data: t }));
                break;
            default: // 'all'
                itemsToShow = [
                    ...this.templates.map(t => ({ type: 'template', data: t })),
                    ...this.projects.map(p => ({ type: 'project', data: p }))
                ];
        }

        // Render filtered items
        itemsToShow.forEach(item => {
            if (item.type === 'template') {
                const templateCard = this.createTemplateCard(item.data);
                this.gridContainer.appendChild(templateCard);
            } else {
                const projectCard = this.createProjectCard(item.data);
                this.gridContainer.appendChild(projectCard);
            }
        });
    }

    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.innerHTML = `
            <div class="template-thumbnail">
                <img src="${template.thumbnail}" alt="${template.name}" 
                     onerror="this.src='shared/assets/default-template.svg'">
                <div class="template-overlay">
                    <button class="use-template-btn" data-template="${template.id}">
                        Create Project
                    </button>
                    <button class="preview-btn" data-template="${template.id}">
                        Preview
                    </button>
                </div>
                <div class="template-badge">Template</div>
            </div>
            <div class="template-info">
                <h3>${template.name}</h3>
                <p>${template.description}</p>
                <div class="template-features">
                    ${template.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        const useBtn = card.querySelector('.use-template-btn');
        const previewBtn = card.querySelector('.preview-btn');
        
        useBtn.addEventListener('click', () => this.createProjectFromTemplate(template));
        previewBtn.addEventListener('click', () => this.previewTemplate(template));

        return card;
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'template-card project-card';
        
        const thumbnailSrc = project.thumbnail || 'shared/assets/default-project.svg';
        const lastModified = new Date(project.modified).toLocaleDateString();
        
        card.innerHTML = `
            <div class="template-thumbnail">
                <img src="${thumbnailSrc}" alt="${project.name}" 
                     onerror="this.src='shared/assets/default-project.svg'">
                <div class="template-overlay">
                    <button class="edit-project-btn" data-project="${project.id}">
                        Edit Project
                    </button>
                    <button class="preview-btn" data-project="${project.id}">
                        Preview
                    </button>
                </div>
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

        // Add event listeners
        const editBtn = card.querySelector('.edit-project-btn');
        const previewBtn = card.querySelector('.preview-btn');
        const menuBtn = card.querySelector('.project-menu-btn');
        
        editBtn.addEventListener('click', () => this.editProject(project));
        previewBtn.addEventListener('click', () => this.previewProject(project));
        menuBtn.addEventListener('click', (e) => this.showProjectMenu(e, project));

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

    previewTemplate(template) {
        // Navigate to template in preview mode
        window.location.href = `${template.file}?mode=preview`;
    }

    editProject(project) {
        // Navigate to template editor with project ID
        const templateFile = this.templates.find(t => t.id === project.templateId)?.file || 'template_001.html';
        window.location.href = `${templateFile}?projectId=${project.id}`;
    }

    previewProject(project) {
        // Navigate to template editor in preview mode with project data
        const templateFile = this.templates.find(t => t.id === project.templateId)?.file || 'template_001.html';
        window.location.href = `${templateFile}?projectId=${project.id}&mode=preview`;
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