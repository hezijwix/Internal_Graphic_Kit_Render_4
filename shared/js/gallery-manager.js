// Gallery Manager - Template Gallery Page
// Integrated with ProjectManager for user project management

class GalleryManager {
    constructor() {
        this.templates = [];
        this.projects = [];
        this.gridContainer = document.getElementById('template-grid');
        this.projectManager = new ProjectManager();
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

    renderGallery() {
        if (!this.gridContainer) return;
        
        this.gridContainer.innerHTML = '';
        
        // Render templates first
        this.templates.forEach(template => {
            const templateCard = this.createTemplateCard(template);
            this.gridContainer.appendChild(templateCard);
        });

        // Render user projects
        this.projects.forEach(project => {
            const projectCard = this.createProjectCard(project);
            this.gridContainer.appendChild(projectCard);
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

    useTemplate(template) {
        // Navigate to template with new project
        window.location.href = `${template.file}?mode=create`;
    }

    previewTemplate(template) {
        // Navigate to template in preview mode
        window.location.href = `${template.file}?mode=preview`;
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