const http = require('http');
const fs = require('fs');
const path = require('path');

const releaseApkPath = path.join(__dirname, 'build', 'app', 'outputs', 'flutter-apk', 'app-release.apk');
const debugApkPath = path.join(__dirname, 'build', 'app', 'outputs', 'flutter-apk', 'app-debug.apk');
const port = 8888;

const server = http.createServer((req, res) => {
  let targetPath = releaseApkPath;
  if (!fs.existsSync(releaseApkPath)) {
    targetPath = debugApkPath;
  }

  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename=jooble-app-release.apk'
    });
    fs.createReadStream(targetPath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('APK Not Found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`APK Server running on port ${port}`);
});
