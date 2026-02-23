const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', 'dist');
const indexHtml = path.join(dist, 'index.html');
const notFoundHtml = path.join(dist, '404.html');
if (fs.existsSync(indexHtml)) {
  fs.copyFileSync(indexHtml, notFoundHtml);
  console.log('Created dist/404.html for GitHub Pages SPA fallback');
}
