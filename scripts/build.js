const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const outputDirName = 'Public';
const distDir = path.join(projectRoot, outputDirName);

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

function copyDirectoryToDist(directory) {
  const sourcePath = path.join(projectRoot, directory);
  const destPath = path.join(distDir, directory);

  if (!fs.existsSync(sourcePath)) {
    return;
  }

  fs.cpSync(sourcePath, destPath, { recursive: true });
}

function copyHtmlFiles() {
  const entries = fs.readdirSync(projectRoot);

  entries
    .filter((file) => file.endsWith('.html') && !file.endsWith('.min.html'))
    .forEach((file) => {
      const minifiedVersion = file.replace('.html', '.min.html');
      const source = fs.existsSync(path.join(projectRoot, minifiedVersion))
        ? minifiedVersion
        : file;

      copyFileToDist(source, file);
    });
}

function copyStaticAssets() {
  const directories = ['assets', 'supabase'];
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
