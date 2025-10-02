const fs = require('fs');
const path = require('path');
const { minify: minifyHTML } = require('html-minifier');
const CleanCSS = require('clean-css');
const { minify: minifyJS } = require('terser');
const zlib = require('zlib');

// Ensure we're in the project root directory
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

class WebsiteOptimizer {
  constructor() {
    this.stats = {
      htmlFiles: 0,
      cssFiles: 0,
      jsFiles: 0,
      totalSavings: 0
    };
  }

  async optimize() {
    console.log('🚀 Starting website optimization...\n');

    await this.optimizeHTML();
    await this.optimizeCSS();
    await this.optimizeJS();
    await this.compressAssets();
    await this.generateReport();

    console.log('✅ Optimization complete!');
  }

  async optimizeHTML() {
    console.log('📄 Optimizing HTML files...');
    const htmlFiles = this.getFiles('.', '.html').filter(file => !file.includes('.min.html'));

    for (const file of htmlFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const originalSize = Buffer.byteLength(content, 'utf8');

        const minified = minifyHTML(content, {
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          sortClassName: true,
          useShortDoctype: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
          minifyCSS: true,
          minifyJS: true
        });

        const newSize = Buffer.byteLength(minified, 'utf8');
        const savings = originalSize - newSize;

        // Create optimized version
        const optimizedPath = file.replace('.html', '.min.html');
        fs.writeFileSync(optimizedPath, minified);

        this.stats.htmlFiles++;
        this.stats.totalSavings += savings;

        console.log(`  ✓ ${file}: ${this.formatBytes(savings)} saved`);
      } catch (error) {
        console.log(`  ✗ ${file}: Error - ${error.message}`);
      }
    }
  }

  async optimizeCSS() {
    console.log('\n🎨 Optimizing CSS files...');

    if (!fs.existsSync('assets/css')) {
      console.log('  ℹ️  CSS directory not found, skipping...');
      return;
    }

    const cssFiles = this.getFiles('assets/css', '.css');

    for (const file of cssFiles) {
      if (file.includes('.min.css')) continue;

      try {
        const content = fs.readFileSync(file, 'utf8');
        const originalSize = Buffer.byteLength(content, 'utf8');

        // CleanCSS.minify() returns a promise when returnPromise is true
        const result = await new CleanCSS({
          level: 2
        }).minify(content);

        // Check for errors
        if (result.errors && result.errors.length > 0) {
          console.log(`  ✗ ${file}: ${result.errors.join(', ')}`);
          continue;
        }

        const newSize = Buffer.byteLength(result.styles, 'utf8');
        const savings = originalSize - newSize;

        // Create minified version
        const minifiedPath = file.replace('.css', '.min.css');
        fs.writeFileSync(minifiedPath, result.styles);

        this.stats.cssFiles++;
        this.stats.totalSavings += savings;

        console.log(`  ✓ ${file}: ${this.formatBytes(savings)} saved`);
      } catch (error) {
        console.log(`  ✗ ${file}: Error - ${error.message}`);
      }
    }
  }

  async optimizeJS() {
    console.log('\n⚡ Optimizing JavaScript files...');

    if (!fs.existsSync('assets/js')) {
      console.log('  ℹ️  JS directory not found, skipping...');
      return;
    }

    const jsFiles = this.getFiles('assets/js', '.js').filter(file => 
      !file.includes('.min.js') && 
      !file.includes('jquery') && 
      !file.includes('bootstrap') &&
      !file.includes('swiper') &&
      !file.includes('gsap')
    );
    
    for (const file of jsFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const originalSize = Buffer.byteLength(content, 'utf8');
        
        const result = await minifyJS(content, {
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          mangle: true
        });
        
        const newSize = Buffer.byteLength(result.code, 'utf8');
        const savings = originalSize - newSize;
        
        // Create minified version
        const minifiedPath = file.replace('.js', '.min.js');
        fs.writeFileSync(minifiedPath, result.code);
        
        this.stats.jsFiles++;
        this.stats.totalSavings += savings;
        
        console.log(`  ✓ ${file}: ${this.formatBytes(savings)} saved`);
      } catch (error) {
        console.log(`  ✗ ${file}: Error - ${error.message}`);
      }
    }
  }

  async compressAssets() {
    console.log('\n🗜️  Compressing assets with Brotli...');

    // Compress minified files
    const filesToCompress = [
      ...this.getFiles('.', '.min.html'),
      ...this.getFiles('assets/css', '.min.css'),
      ...this.getFiles('assets/js', '.min.js')
    ];

    let compressed = 0;
    for (const file of filesToCompress) {
      try {
        const content = fs.readFileSync(file);
        const brotliCompressed = zlib.brotliCompressSync(content, {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11
          }
        });

        // Save .br file
        fs.writeFileSync(file + '.br', brotliCompressed);

        // Also create gzip for broader compatibility
        const gzipCompressed = zlib.gzipSync(content, { level: 9 });
        fs.writeFileSync(file + '.gz', gzipCompressed);

        compressed++;
      } catch (error) {
        console.log(`  ✗ ${file}: ${error.message}`);
      }
    }

    console.log(`  ✓ Compressed ${compressed} files (Brotli + Gzip)`);
  }

  getFiles(dir, extension) {
    const files = [];

    function scanDirectory(directory) {
      try {
        if (!fs.existsSync(directory)) {
          return;
        }

        const items = fs.readdirSync(directory);

        for (const item of items) {
          const fullPath = path.join(directory, item);

          try {
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
              scanDirectory(fullPath);
            } else if (item.endsWith(extension)) {
              files.push(fullPath);
            }
          } catch (err) {
            // Skip files that can't be accessed
            continue;
          }
        }
      } catch (err) {
        // Skip directories that can't be accessed
        return;
      }
    }

    scanDirectory(dir);
    return files;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport() {
    console.log('\n📊 Optimization Report:');
    console.log('========================');
    console.log(`HTML files optimized: ${this.stats.htmlFiles}`);
    console.log(`CSS files optimized: ${this.stats.cssFiles}`);
    console.log(`JS files optimized: ${this.stats.jsFiles}`);
    console.log(`Total space saved: ${this.formatBytes(this.stats.totalSavings)}`);
    console.log('========================\n');
  }
}

// Run optimization
const optimizer = new WebsiteOptimizer();
optimizer.optimize().catch(console.error);