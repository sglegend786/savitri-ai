const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath);
        } else if (dirPath.endsWith('.js')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            let updated = content;
            
            // if it's API_URL = 'http://localhost:5000/api'
            updated = updated.replace(/API_URL = 'http:\/\/localhost:5000\/api'/g, "API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:5000/api'");
            
            // fetch('http://localhost:5000/api...') -> fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api...`)
            updated = updated.replace(/'http:\/\/localhost:5000(.*?)'/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}$1`');
            
            // fetch(`http://localhost:5000/api...`) -> fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api...`)
            updated = updated.replace(/`http:\/\/localhost:5000(.*?)`/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}$1`');

            if (content !== updated) {
                fs.writeFileSync(dirPath, updated, 'utf8');
                console.log(`Updated ${dirPath}`);
            }
        }
    });
}

walkDir('./savitri-frontend/src');
