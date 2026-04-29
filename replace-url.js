const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const newContent = content.replace(/http:\/\/localhost:3000\/api/g, '/api');
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated:', fullPath);
            }
        }
    }
}

replaceInDir(path.join(__dirname, 'frontend', 'src'));
