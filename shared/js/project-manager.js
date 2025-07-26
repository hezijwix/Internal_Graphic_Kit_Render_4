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
                    top: 50,            // Gallery icon ID for top icon  
                    bottom: 23          // Single default gallery icon ID for ALL bottom icons (celebration, not stars)
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

    // Update project thumbnail
    updateProjectThumbnail(projectId, thumbnailData) {
        if (!projectId || !thumbnailData) return false;
        
        try {
            const project = this.loadProject(projectId);
            if (!project) {
                console.error('Project not found:', projectId);
                return false;
            }
            
            // Update thumbnail and modified date
            project.thumbnail = thumbnailData;
            project.modified = new Date().toISOString();
            
            // Save updated project
            this.saveProjectData(projectId, project);
            
            console.log('Project thumbnail updated:', projectId);
            return true;
        } catch (error) {
            console.error('Failed to update project thumbnail:', error);
            return false;
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

    // Storage optimization and cleanup methods
    
    // Check localStorage usage and warn if approaching limits
    checkStorageUsage() {
        try {
            let totalSize = 0;
            let projectCount = 0;
            let thumbnailSize = 0;
            
            // Calculate total storage usage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                totalSize += key.length + (value?.length || 0);
                
                if (key.startsWith(this.storageKeys.projectPrefix)) {
                    projectCount++;
                    try {
                        const project = JSON.parse(value);
                        if (project.thumbnail) {
                            thumbnailSize += project.thumbnail.length;
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
            
            const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
            const thumbnailMB = (thumbnailSize / (1024 * 1024)).toFixed(2);
            const usagePercent = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(1);
            
            const usage = {
                totalMB: parseFloat(totalMB),
                thumbnailMB: parseFloat(thumbnailMB),
                usagePercent: parseFloat(usagePercent),
                projectCount,
                isNearLimit: usagePercent > 75,
                isCritical: usagePercent > 90
            };
            
            console.log('💾 Storage Usage:', usage);
            
            if (usage.isCritical) {
                console.warn('🚨 Critical storage usage! Consider cleaning up old projects.');
            } else if (usage.isNearLimit) {
                console.warn('⚠️ Storage usage above 75%. Consider optimizing thumbnails.');
            }
            
            return usage;
        } catch (error) {
            console.error('Failed to check storage usage:', error);
            return null;
        }
    }
    
    // Clean up old projects to free space
    cleanupOldProjects(keepCount = 10, daysOld = 30) {
        try {
            const projects = this.getAllProjects();
            if (projects.length <= keepCount) {
                console.log('No cleanup needed, project count within limits');
                return { cleaned: 0, kept: projects.length };
            }
            
            // Sort by modified date (oldest first)
            const sortedProjects = projects.sort((a, b) => 
                new Date(a.modified) - new Date(b.modified)
            );
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            let cleaned = 0;
            const projectsToDelete = [];
            
            // Mark old projects for deletion
            for (let i = 0; i < sortedProjects.length - keepCount; i++) {
                const project = sortedProjects[i];
                const projectDate = new Date(project.modified);
                
                if (projectDate < cutoffDate) {
                    projectsToDelete.push(project);
                }
            }
            
            // Delete marked projects
            projectsToDelete.forEach(project => {
                this.deleteProject(project.id);
                cleaned++;
                console.log(`🗑️ Cleaned up old project: "${project.name}" (${project.modified})`);
            });
            
            const result = { cleaned, kept: projects.length - cleaned };
            console.log(`✅ Cleanup complete: ${cleaned} projects removed, ${result.kept} kept`);
            
            return result;
        } catch (error) {
            console.error('Failed to cleanup old projects:', error);
            return { cleaned: 0, kept: 0, error: error.message };
        }
    }
    
    // Optimize thumbnails by recompressing them
    optimizeThumbnails(targetQuality = 0.6) {
        try {
            const projects = this.getAllProjects();
            let optimized = 0;
            let totalSavings = 0;
            
            projects.forEach(project => {
                if (project.thumbnail && project.thumbnail.startsWith('data:image/jpeg')) {
                    try {
                        // Create temporary image to get current size
                        const img = new Image();
                        const originalSize = project.thumbnail.length;
                        
                        img.onload = () => {
                            // Create canvas for recompression
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx.drawImage(img, 0, 0);
                            
                            // Recompress with target quality
                            const optimizedThumbnail = canvas.toDataURL('image/jpeg', targetQuality);
                            const newSize = optimizedThumbnail.length;
                            const savings = originalSize - newSize;
                            
                            if (savings > 0) {
                                project.thumbnail = optimizedThumbnail;
                                project.modified = new Date().toISOString();
                                this.saveProjectData(project.id, project);
                                
                                optimized++;
                                totalSavings += savings;
                                
                                console.log(`📉 Optimized thumbnail for "${project.name}": ${Math.round(savings/1024)}KB saved`);
                            }
                        };
                        
                        img.src = project.thumbnail;
                    } catch (error) {
                        console.warn(`Failed to optimize thumbnail for "${project.name}":`, error);
                    }
                }
            });
            
            if (optimized > 0) {
                console.log(`✅ Thumbnail optimization complete: ${optimized} thumbnails optimized, ${Math.round(totalSavings/1024)}KB saved`);
            }
            
            return { optimized, totalSavings };
        } catch (error) {
            console.error('Failed to optimize thumbnails:', error);
            return { optimized: 0, totalSavings: 0, error: error.message };
        }
    }
    
    // Get storage statistics
    getStorageStats() {
        const usage = this.checkStorageUsage();
        const projects = this.getAllProjects();
        
        const stats = {
            storage: usage,
            projects: {
                total: projects.length,
                withThumbnails: projects.filter(p => p.thumbnail).length,
                withoutThumbnails: projects.filter(p => !p.thumbnail).length
            },
            recommendations: []
        };
        
        // Add recommendations
        if (usage?.isCritical) {
            stats.recommendations.push('Delete old projects or optimize thumbnails immediately');
        } else if (usage?.isNearLimit) {
            stats.recommendations.push('Consider cleaning up old projects');
        }
        
        if (stats.projects.withoutThumbnails > 0) {
            stats.recommendations.push(`${stats.projects.withoutThumbnails} projects missing thumbnails`);
        }
        
        return stats;
    }
}

// Export for use in other modules
window.ProjectManager = ProjectManager;