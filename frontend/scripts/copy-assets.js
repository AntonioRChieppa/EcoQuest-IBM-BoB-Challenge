/**
 * copy-assets.js
 * Copies all non-scss frontend source files into dist/
 * maintaining the same directory structure.
 *
 * Output:
 *   dist/index.html
 *   dist/app.js
 *   dist/components/<name>/<name>.component.html
 *   dist/components/<name>/<name>.component.js
 *   dist/style.css  (compiled by sass — NOT handled here)
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Files/dirs to include (relative to ROOT), excludes scss and node_modules
const INCLUDE_EXTENSIONS = ['.html', '.js'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    // Skip node_modules, dist, scripts, styles, and root-level files (handled separately)
    if (['node_modules', 'dist', 'scripts', 'styles'].includes(entry.name)) continue;
    // Skip files at the root level — they are already copied in the explicit step below
    if (src === ROOT && entry.isFile()) continue;

    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (INCLUDE_EXTENSIONS.includes(path.extname(entry.name))) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  copied  ${path.relative(ROOT, srcPath)}`);
    }
  }
}

ensureDir(DIST);

// Copy root-level files (index.html, app.js) explicitly
for (const file of fs.readdirSync(ROOT)) {
  const srcPath = path.join(ROOT, file);
  if (fs.statSync(srcPath).isFile() && INCLUDE_EXTENSIONS.includes(path.extname(file))) {
    fs.copyFileSync(srcPath, path.join(DIST, file));
    console.log(`  copied  ${file}`);
  }
}

// Copy subdirectories (components/)
copyDir(ROOT, DIST);
console.log('✅  Assets copied to dist/');
