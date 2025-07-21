// Project Manager - Core project persistence and management
// Handles CRUD operations for user projects with localStorage

class ProjectManager {
    constructor() {
        this.storageKeys = {
            projects: 'wix_user_projects',
            projectPrefix: 'wix_project_'
        };
        this.initialize();
    }

    initialize() {
        // Ensure projects array exists in localStorage
        if (!localStorage.getItem(this.storageKeys.projects)) {
            localStorage.setItem(this.storageKeys.projects, JSON.stringify([]));
        }
    }

    // Generate unique project ID
    generateProjectId() {
        return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Create new project from template
    createProject(templateId, projectName, templateConfig = null) {
        const projectId = this.generateProjectId();
        const now = new Date().toISOString();
        
        const project = {
            id: projectId,
            name: projectName || `My ${templateId} Project`,
            templateId: templateId,
            isTemplate: false,
            thumbnail: null,
            config: templateConfig || this.getDefaultConfig(templateId),
            created: now,
            modified: now,
            version: '1.0.0'
        };

        // Save project data
        this.saveProjectData(projectId, project);
        
        // Add to projects list
        this.addToProjectsList(projectId);
        
        return project;
    }

    // Get default configuration for template
    getDefaultConfig(templateId) {
        // Default configuration based on template type
        const defaultConfigs = {
            'template_001': {
                texts: {
                    topTitle: 'Top Title',
                    mainTitle: 'MAIN TITLE\nTWO LINES',
                    subtitle1: 'Subtitle 1',
                    subtitle2: 'Subtitle 2'
                },
                colors: {
                    text: '#FFFFFF',
                    background: '#0D0D0D'
                },
                icons: {
                    top: 'circle',
                    bottom: ['star', 'circle', 'arrow', 'arrow']
                },
                visibility: {
                    topIcon: true,
                    topTitle: true,
                    mainTitle: true,
                    subtitle1: true,
                    subtitle2: true,
                    bottomIcons: true
                },
                bottomIconsConfig: {
                    count: 4
                }
            }
        };
        
        return defaultConfigs[templateId] || {};
    }

    // Save project data to localStorage
    saveProjectData(projectId, projectData) {
        const key = this.storageKeys.projectPrefix + projectId;
        localStorage.setItem(key, JSON.stringify(projectData));
    }

    // Load project data from localStorage
    loadProject(projectId) {
        const key = this.storageKeys.projectPrefix + projectId;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    // Update existing project
    updateProject(projectId, updates) {
        const project = this.loadProject(projectId);
        if (!project) return null;

        // Merge updates
        const updatedProject = {
            ...project,
            ...updates,
            modified: new Date().toISOString()
        };

        this.saveProjectData(projectId, updatedProject);
        return updatedProject;
    }

    // Update project configuration
    updateProjectConfig(projectId, configUpdates) {
        const project = this.loadProject(projectId);
        if (!project) return null;

        project.config = {
            ...project.config,
            ...configUpdates
        };
        project.modified = new Date().toISOString();

        this.saveProjectData(projectId, project);
        return project;
    }

    // Update project thumbnail
    updateProjectThumbnail(projectId, thumbnailData) {
        return this.updateProject(projectId, { thumbnail: thumbnailData });
    }

    // Rename project
    renameProject(projectId, newName) {
        return this.updateProject(projectId, { name: newName });
    }

    // Duplicate project
    duplicateProject(projectId, newName = null) {
        const originalProject = this.loadProject(projectId);
        if (!originalProject) return null;

        const duplicatedProject = {
            ...originalProject,
            id: this.generateProjectId(),
            name: newName || `${originalProject.name} (Copy)`,
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };

        this.saveProjectData(duplicatedProject.id, duplicatedProject);
        this.addToProjectsList(duplicatedProject.id);
        
        return duplicatedProject;
    }

    // Delete project
    deleteProject(projectId) {
        // Remove from projects list
        this.removeFromProjectsList(projectId);
        
        // Delete project data
        const key = this.storageKeys.projectPrefix + projectId;
        localStorage.removeItem(key);
        
        return true;
    }

    // Get all user projects
    getAllProjects() {
        const projectIds = this.getProjectsList();
        return projectIds.map(id => this.loadProject(id)).filter(Boolean);
    }

    // Get projects by template
    getProjectsByTemplate(templateId) {
        return this.getAllProjects().filter(project => project.templateId === templateId);
    }

    // Add project ID to projects list
    addToProjectsList(projectId) {
        const projects = this.getProjectsList();
        if (!projects.includes(projectId)) {
            projects.push(projectId);
            localStorage.setItem(this.storageKeys.projects, JSON.stringify(projects));
        }
    }

    // Remove project ID from projects list
    removeFromProjectsList(projectId) {
        const projects = this.getProjectsList();
        const filteredProjects = projects.filter(id => id !== projectId);
        localStorage.setItem(this.storageKeys.projects, JSON.stringify(filteredProjects));
    }

    // Get projects list from localStorage
    getProjectsList() {
        const data = localStorage.getItem(this.storageKeys.projects);
        return data ? JSON.parse(data) : [];
    }

    // Generate thumbnail from canvas (for future use with template editor)
    generateThumbnail(canvas, maxWidth = 200, maxHeight = 120) {
        if (!canvas) return null;
        
        try {
            // Create temporary canvas for thumbnail
            const thumbnailCanvas = document.createElement('canvas');
            const ctx = thumbnailCanvas.getContext('2d');
            
            // Calculate thumbnail dimensions maintaining aspect ratio
            const aspectRatio = canvas.width / canvas.height;
            let thumbWidth = maxWidth;
            let thumbHeight = maxHeight;
            
            if (aspectRatio > maxWidth / maxHeight) {
                thumbHeight = maxWidth / aspectRatio;
            } else {
                thumbWidth = maxHeight * aspectRatio;
            }
            
            thumbnailCanvas.width = thumbWidth;
            thumbnailCanvas.height = thumbHeight;
            
            // Draw scaled canvas content
            ctx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
            
            // Return as base64 data URL
            return thumbnailCanvas.toDataURL('image/png');
        } catch (error) {
            console.error('Failed to generate thumbnail:', error);
            return null;
        }
    }

    // Clear all projects (for development/testing)
    clearAllProjects() {
        const projects = this.getProjectsList();
        projects.forEach(projectId => {
            const key = this.storageKeys.projectPrefix + projectId;
            localStorage.removeItem(key);
        });
        localStorage.setItem(this.storageKeys.projects, JSON.stringify([]));
    }

    // Export project data (for backup/sharing)
    exportProject(projectId) {
        const project = this.loadProject(projectId);
        if (!project) return null;
        
        return {
            ...project,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    // Import project data (for backup/sharing)
    importProject(projectData, newName = null) {
        const importedProject = {
            ...projectData,
            id: this.generateProjectId(),
            name: newName || `${projectData.name} (Imported)`,
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };

        this.saveProjectData(importedProject.id, importedProject);
        this.addToProjectsList(importedProject.id);
        
        return importedProject;
    }
}

// Export for use in other modules
window.ProjectManager = ProjectManager;