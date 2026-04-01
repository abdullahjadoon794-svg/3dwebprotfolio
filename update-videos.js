const fs = require('fs');
const path = require('path');

const videosDir = path.join(__dirname, 'videos');
const outputFile = path.join(__dirname, 'data.json');

const getVideosData = () => {
    const services = [];
    
    if (!fs.existsSync(videosDir)) {
        console.error("🔴 The 'videos' directory does not exist.");
        return services;
    }
    
    // Read subfolders inside 'videos'
    const folders = fs.readdirSync(videosDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
        
    folders.forEach(folder => {
        const folderPath = path.join(videosDir, folder);
        const files = fs.readdirSync(folderPath, { withFileTypes: true });
        
        // Match standard video file formats
        const videoFiles = files.filter(file => {
            const ext = path.extname(file.name).toLowerCase();
            return file.isFile() && ['.mp4', '.mkv', '.webm', '.avi', '.mov'].includes(ext);
        }).map(file => {
            return `videos/${encodeURIComponent(folder)}/${encodeURIComponent(file.name)}`;
        });

        // Check for links.txt
        const linksFile = files.find(file => file.name.toLowerCase() === 'links.txt');
        let webLinks = [];
        if (linksFile) {
            const content = fs.readFileSync(path.join(folderPath, linksFile.name), 'utf-8');
            webLinks = content.split(/\r?\n/).filter(line => line.trim().startsWith('http'));
        }
        
        if (videoFiles.length > 0 || webLinks.length > 0) {
            const printName = folder.replace(/\b\w/g, c => c.toUpperCase());
            const entry = {
                name: printName,
            };
            if (videoFiles.length > 0) entry.videos = videoFiles;
            if (webLinks.length > 0) entry.links = webLinks;
            services.push(entry);
        }
    });
    
    return services;
};

const data = getVideosData();
fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

console.log(`✅ Successfully scanned your folders and generated data.json with ${data.length} services found!`);
