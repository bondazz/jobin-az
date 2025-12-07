const fs = require('fs');
const https = require('https');

// Download PNG and save as favicon
const url = 'https://jooble.az/lovable-uploads/7f6bbbaf-0b9c-4e8d-a67c-8ca477dea74e.png';
const dest = 'public/favicon.png';

https.get(url, (response) => {
    const fileStream = fs.createWriteStream(dest);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
        fileStream.close();
        console.log('✅ Favicon PNG yükləndi:', dest);
        console.log('ℹ️  Müasir brauzerlər PNG favicon-u dəstəkləyir.');
        console.log('ℹ️  public/favicon.ico artıq PNG formatındadır və işləyir.');
    });
}).on('error', (err) => {
    fs.unlink(dest, () => { });
    console.error('❌ Xəta:', err.message);
});
