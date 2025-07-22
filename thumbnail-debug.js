// 🔍 THUMBNAIL DEBUGGING SCRIPT
// Load this in your browser console or add as script tag

console.log('🔍 Starting thumbnail debugging...');

// Test 1: Check if editor is available
function testEditor() {
    console.log('\n=== TEST 1: Editor Availability ===');
    const editor = window.templateEditor;
    console.log('Editor available:', !!editor);
    
    if (!editor) {
        console.error('❌ templateEditor not found on window object');
        return false;
    }
    
    console.log('Stage available:', !!editor.stage);
    if (!editor.stage) {
        console.error('❌ stage not available on editor');
        return false;
    }
    
    console.log('✅ Editor and stage are available');
    return true;
}

// Test 2: Check canvas
function testCanvas() {
    console.log('\n=== TEST 2: Canvas Availability ===');
    const editor = window.templateEditor;
    if (!editor || !editor.stage) {
        console.error('❌ Editor/stage not available');
        return null;
    }
    
    const canvas = editor.stage.getCanvas()._canvas;
    console.log('Canvas available:', !!canvas);
    
    if (!canvas) {
        console.error('❌ Canvas not accessible');
        return null;
    }
    
    console.log('Canvas dimensions:', canvas.width + 'x' + canvas.height);
    console.log('Canvas has content:', canvas.toDataURL().length > 1000);
    console.log('✅ Canvas is available and has content');
    return canvas;
}

// Test 3: Generate thumbnail
function testThumbnailGeneration() {
    console.log('\n=== TEST 3: Thumbnail Generation ===');
    const canvas = testCanvas();
    if (!canvas) return null;
    
    try {
        const thumbCanvas = document.createElement('canvas');
        const thumbCtx = thumbCanvas.getContext('2d');
        thumbCanvas.width = 350;
        thumbCanvas.height = 200;
        
        console.log('Drawing thumbnail...');
        thumbCtx.drawImage(canvas, 0, 0, 1920, 1080, 0, 0, 350, 200);
        
        const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.8);
        const sizeKB = Math.round(thumbnail.length / 1024);
        
        console.log('✅ Thumbnail generated successfully!');
        console.log('Size:', thumbnail.length + ' chars (' + sizeKB + 'KB)');
        console.log('Preview:', thumbnail.substring(0, 50) + '...');
        
        return thumbnail;
    } catch (error) {
        console.error('❌ Thumbnail generation failed:', error);
        return null;
    }
}

// Test 4: Check project manager
function testProjectManager() {
    console.log('\n=== TEST 4: Project Manager ===');
    
    const projectIntegration = window.projectIntegration;
    console.log('Project integration available:', !!projectIntegration);
    
    if (!projectIntegration) {
        console.error('❌ projectIntegration not found');
        return null;
    }
    
    console.log('Current project available:', !!projectIntegration.currentProject);
    
    if (!projectIntegration.currentProject) {
        console.error('❌ No current project');
        return null;
    }
    
    const projectManager = new ProjectManager();
    console.log('Project manager created:', !!projectManager);
    
    const project = projectManager.loadProject(projectIntegration.currentProject.id);
    console.log('Project loaded:', !!project);
    
    if (project) {
        console.log('Project details:', {
            id: project.id,
            name: project.name,
            hasThumbnail: !!project.thumbnail,
            thumbnailSize: project.thumbnail ? project.thumbnail.length : 0
        });
    }
    
    return { projectManager, project, projectIntegration };
}

// Test 5: Test save process
function testSaveProcess() {
    console.log('\n=== TEST 5: Save Process ===');
    
    const thumbnail = testThumbnailGeneration();
    if (!thumbnail) {
        console.error('❌ Cannot test save - no thumbnail');
        return false;
    }
    
    const managerData = testProjectManager();
    if (!managerData) {
        console.error('❌ Cannot test save - no project manager');
        return false;
    }
    
    const { projectManager, projectIntegration } = managerData;
    
    console.log('Attempting to save thumbnail...');
    const saveResult = projectManager.updateProjectThumbnail(
        projectIntegration.currentProject.id, 
        thumbnail
    );
    
    console.log('Save result:', saveResult);
    
    // Verify it was saved
    setTimeout(() => {
        const updatedProject = projectManager.loadProject(projectIntegration.currentProject.id);
        console.log('Verification - project has thumbnail:', !!updatedProject.thumbnail);
        console.log('Verification - thumbnail size:', updatedProject.thumbnail ? updatedProject.thumbnail.length : 0);
    }, 100);
    
    return saveResult;
}

// Test 6: Preview thumbnail
function previewThumbnail() {
    console.log('\n=== TEST 6: Preview Thumbnail ===');
    
    const managerData = testProjectManager();
    if (!managerData || !managerData.project || !managerData.project.thumbnail) {
        console.error('❌ No thumbnail to preview');
        return;
    }
    
    const img = document.createElement('img');
    img.src = managerData.project.thumbnail;
    img.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        border: 3px solid #0066FF;
        background: white;
        padding: 5px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(img);
    console.log('🖼️ Thumbnail preview added to top-right corner');
    
    setTimeout(() => {
        if (document.body.contains(img)) {
            document.body.removeChild(img);
            console.log('🗑️ Thumbnail preview removed');
        }
    }, 5000);
}

// Run all tests
function runAllTests() {
    console.log('🧪 RUNNING ALL THUMBNAIL TESTS');
    console.log('================================');
    
    if (!testEditor()) return;
    if (!testCanvas()) return;
    if (!testThumbnailGeneration()) return;
    if (!testProjectManager()) return;
    
    testSaveProcess();
    
    setTimeout(() => {
        console.log('\n=== FINAL TEST: Preview ===');
        previewThumbnail();
    }, 500);
}

// Make functions available globally
window.thumbnailDebug = {
    testEditor,
    testCanvas,
    testThumbnailGeneration,
    testProjectManager,
    testSaveProcess,
    previewThumbnail,
    runAllTests
};

console.log('✅ Thumbnail debugging script loaded!');
console.log('Run: thumbnailDebug.runAllTests() to test everything');
console.log('Or run individual tests:');
console.log('  thumbnailDebug.testEditor()');
console.log('  thumbnailDebug.testCanvas()');
console.log('  thumbnailDebug.testThumbnailGeneration()');
console.log('  thumbnailDebug.testProjectManager()');
console.log('  thumbnailDebug.testSaveProcess()');
console.log('  thumbnailDebug.previewThumbnail()');
