
const fs = require('fs');
const path = require('path');

function replaceBranding(content) {
    // broad replacements
    let newContent = content
        .replace(/Jooble\.az/g, 'Jobin.az')
        .replace(/Jooble Azərbaycan/g, 'Jobin Azərbaycan')
        .replace(/Jooble Haqqında/g, 'Jobin Haqqında')
        .replace(/Jooble/g, 'Jobin')
        .replace(/jooble\.az/g, 'jobin.az')
        .replace(/jooble/g, 'jobin');

    // fix hrefs back to jooble.az
    newContent = newContent.replace(/href=["']https?:\/\/jobin\.az/g, (match) => {
        return match.replace('jobin', 'jooble');
    });

    return newContent;
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (/\.(tsx|ts|js|json|html|css)$/.test(file)) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const newContent = replaceBranding(content);
                if (newContent !== content) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log(`Updated: ${filePath}`);
                }
            } catch (err) {
                console.error(`Error processing ${filePath}: ${err.message}`);
            }
        }
    }
}

processDirectory(path.join(process.cwd(), 'src'));
console.log('Migration complete.');
