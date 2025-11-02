const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const outputDirName = 'Public';
const distDir = path.join(projectRoot, outputDirName);
const assetHashCache = new Map();
const CACHEABLE_EXTENSIONS = new Set([
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
  '.gif',
  '.ico',
  '.avif',
  '.bmp',
  '.mp4',
  '.webm'
]);

process.chdir(projectRoot);

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

function removeDist() {
  fs.rmSync(distDir, { recursive: true, force: true });
}

function copyFileToDist(source, destination) {
  const destPath = path.join(distDir, destination);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(path.join(projectRoot, source), destPath);
}

function writeFileToDist(destination, contents) {
  const destPath = path.join(distDir, destination);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, contents);
}

function normalizeAssetPath(value) {
  return value.replace(/^\.\//, '').replace(/^\//, '');
}

function getAssetHash(assetPath) {
  const normalized = normalizeAssetPath(assetPath);

  if (assetHashCache.has(normalized)) {
    return assetHashCache.get(normalized);
  }

  const absolutePath = path.join(projectRoot, normalized);

  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const hash = crypto.createHash('md5').update(fileBuffer).digest('hex').slice(0, 8);
  assetHashCache.set(normalized, hash);

  return hash;
}

function versionAssetPath(resourcePath) {
  if (!resourcePath) {
    return resourcePath;
  }

  const trimmed = resourcePath.trim();

  if (!trimmed) {
    return resourcePath;
  }

  if (/^(?:https?:)?\/\//i.test(trimmed)) {
    return resourcePath;
  }

  if (/^(?:data:|mailto:|tel:|#|javascript:)/i.test(trimmed)) {
    return resourcePath;
  }

  const assetPattern = /^(\.{0,2}\/)?(assets\/[^?#]*)(\?[^#]*)?(#.*)?$/;
  const match = trimmed.match(assetPattern);

  if (!match) {
    return resourcePath;
  }

  const prefix = match[1] || '';
  const assetPart = match[2];
  let query = match[3] ? match[3].slice(1) : '';
  const hashFragment = match[4] || '';

  const extension = path.extname(assetPart).toLowerCase();

  if (!CACHEABLE_EXTENSIONS.has(extension)) {
    return resourcePath;
  }

  if (query) {
    query = query
      .split('&')
      .filter((param) => param && !param.startsWith('v='))
      .join('&');
  }

  const hash = getAssetHash(assetPart);

  if (!hash) {
    return resourcePath;
  }

  const newQuery = query ? `${query}&v=${hash}` : `v=${hash}`;
  return `${prefix}${assetPart}?${newQuery}${hashFragment}`;
}

function versionAttributeValue(value) {
  return value.replace(/(\.{0,2}\/)?assets\/[^"'\s)<>]+(?:\?[^"'\s#)]*)?(?:#[^"'\s)]*)?/g, (match) => {
    return versionAssetPath(match);
  });
}

function versionSrcsetValue(value) {
  return value
    .split(',')
    .map((entry) => {
      const trimmedEntry = entry.trim();

      if (!trimmedEntry) {
        return trimmedEntry;
      }

      const parts = trimmedEntry.split(/\s+/);
      const url = parts[0];
      const descriptor = parts.slice(1).join(' ');
      const versionedUrl = versionAssetPath(url);

      return descriptor ? `${versionedUrl} ${descriptor}` : versionedUrl;
    })
    .join(', ');
}

function addCacheBusting(htmlContent) {
  let updatedContent = htmlContent;

  updatedContent = updatedContent.replace(/(srcset|data-srcset)=("|')([^"']*)(\2)/g, (match, attr, quote, value) => {
    const versioned = versionSrcsetValue(value);
    return `${attr}=${quote}${versioned}${quote}`;
  });

  updatedContent = updatedContent.replace(
    /(style)=("|')([^"']*)(\2)/g,
    (match, attr, quote, value) => {
      const versioned = value.replace(/url\((['"]?)([^)'"]+)\1\)/g, (urlMatch, innerQuote, urlValue) => {
        const versionedUrl = versionAssetPath(urlValue);
        const surroundingQuote = innerQuote || '';
        return `url(${surroundingQuote}${versionedUrl}${surroundingQuote})`;
      });

      return `${attr}=${quote}${versioned}${quote}`;
    }
  );

  const attributesToProcess = [
    'href',
    'src',
    'data-src',
    'data-background',
    'data-background-image',
    'data-image',
    'data-bg',
    'data-bg-src',
    'data-lazy',
    'data-lazy-background',
    'data-hover',
    'poster'
  ];

  attributesToProcess.forEach((attribute) => {
    const pattern = new RegExp(`(${attribute})=("|')([^"']*)(\\2)`, 'g');

    updatedContent = updatedContent.replace(pattern, (match, attr, quote, value) => {
      const versioned = versionAttributeValue(value);
      return `${attr}=${quote}${versioned}${quote}`;
    });
  });

  return updatedContent;
}

function copyDirectoryToDist(directory) {
  const sourcePath = path.join(projectRoot, directory);
  const destPath = path.join(distDir, directory);

  if (!fs.existsSync(sourcePath)) {
    return;
  }

  fs.cpSync(sourcePath, destPath, { recursive: true });
}

function processHtmlFile(sourceFile, destinationFile) {
  const sourcePath = path.join(projectRoot, sourceFile);

  if (!fs.existsSync(sourcePath)) {
    return;
  }

  const originalContent = fs.readFileSync(sourcePath, 'utf8');
  const processedContent = addCacheBusting(originalContent);
  writeFileToDist(destinationFile, processedContent);
}

function copyHtmlFiles() {
  const entries = fs.readdirSync(projectRoot).filter((file) => file.endsWith('.html'));
  const processed = new Set();

  entries.forEach((file) => {
    if (processed.has(file)) {
      return;
    }

    if (file.endsWith('.min.html')) {
      processHtmlFile(file, file);
      processed.add(file);
      return;
    }

    const minifiedVersion = file.replace('.html', '.min.html');
    const hasMinifiedVersion = fs.existsSync(path.join(projectRoot, minifiedVersion));
    const source = hasMinifiedVersion ? minifiedVersion : file;

    processHtmlFile(source, file);
    processed.add(file);

    if (hasMinifiedVersion) {
      processHtmlFile(minifiedVersion, minifiedVersion);
      processed.add(minifiedVersion);
    }
  });
}

function copyStaticAssets() {
  const directories = ['assets'];
  const files = [
    'manifest.json',
    'robots.txt',
    'sitemap.xml',
    'sw.js',
    'favicon.ico'
  ];

  directories.forEach(copyDirectoryToDist);

  files.forEach((file) => {
    if (fs.existsSync(path.join(projectRoot, file))) {
      copyFileToDist(file, file);
    }
  });
}

function reportLargeAssets() {
  const heroImages = [
    'assets/images/thumbs/banner-five-bg1.png',
    'assets/images/thumbs/banner-five-bg2.png',
    'assets/images/thumbs/banner-five-bg3.jpg'
  ];

  heroImages.forEach((imagePath) => {
    const fullPath = path.join(projectRoot, imagePath);
    if (!fs.existsSync(fullPath)) {
      return;
    }

    const bytes = fs.statSync(fullPath).size;
    const kilobytes = (bytes / 1024).toFixed(0);

    if (bytes > 500 * 1024) {
      console.warn(
        `⚠️  ${imagePath} is ${kilobytes} KB. Consider compressing or serving from a CDN to improve LCP.`
      );
    }
  });
}

async function build() {
  console.log(`🧹  Clearing previous ${outputDirName} output...`);
  removeDist();

  console.log('🏗️  Running asset optimization...');
  run('node scripts/optimize.js');

  reportLargeAssets();

  console.log(`📁  Creating ${outputDirName} directory...`);
  fs.mkdirSync(distDir, { recursive: true });

  console.log('📄  Copying HTML files...');
  copyHtmlFiles();

  console.log('📦  Copying static assets...');
  copyStaticAssets();

  console.log(`✅ Build complete. Output available in ${outputDirName}/`);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
