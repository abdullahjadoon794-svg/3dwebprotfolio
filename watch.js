const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const watchDir = path.join(__dirname, 'videos');

console.clear();
console.log('==================================================');
console.log('👀 Starting the Dynamic Video Watcher...');
console.log(`Listening for folder name changes, new services, and new videos inside:\n${watchDir}`);
console.log('==================================================\n');

// Prevent multiple rapid consecutive executions when renaming a folder or dragging multiple files
let timeout = null;

const runUpdater = () => {
    console.log('🔄 Change detected in your folders! Rebuilding your site data...');
    exec('node update-videos.js', (err, stdout, stderr) => {
        if (err) {
            console.error(`Error updating videos: ${err.message}`);
            return;
        }
        console.log(stdout.trim());
        console.log('✅ Automatic Update Complete! You can refresh your browser now to see the new videos/names.\n');
    });
};

// Check if the directory even exists
if (!fs.existsSync(watchDir)) {
    console.error("The 'videos' directory does not exist yet. Please create it first.");
    process.exit(1);
}

// Watch the directory and all of its sub-files
fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
    // A 500ms 'debounce' acts like a shock absorber so if you drop 10 files into 
    // the folder at the exact same moment, the script only rebuilds the website ONCE instead of 10 times.
    clearTimeout(timeout);
    timeout = setTimeout(runUpdater, 500); 
});

console.log('Watching... (Press Ctrl + C here to stop the script whenever you want to close it).');
