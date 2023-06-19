const fs = require('fs');
const path = require('path');

fs.mkdirSync(path.join('phone', 'oauth-test'), { recursive: true });
fs.copyFileSync(path.join('main.js'), path.join('phone', 'oauth-test', 'main.js'));
fs.copyFileSync(path.join('styles.css'), path.join('phone', 'oauth-test', 'styles.css'));
fs.copyFileSync(path.join('manifest.json'), path.join('phone', 'oauth-test', 'manifest.json'));
