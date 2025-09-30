const fs = require('fs');
const path = require('path');
const { minify: minifyHTML } = require('html-minifier');
const CleanCSS = require('clean-css');
const { minify: minifyJS } = require('terser');

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
    await this.generateReport();
    
    console.log('✅ Optimization complete!');
  }

  async optimizeHTML() {
    console.log('📄 Optimizing HTML files...');
    const htmlFiles = this.getFiles('.', '.html');
    
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
    const cssFiles = this.getFiles('assets/css', '.css');
    
    for (const file of cssFiles) {
      if (file.includes('.min.css')) continue;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        const originalSize = Buffer.byteLength(content, 'utf8');
        
        const result = new CleanCSS({
          level: 2,
          returnPromise: true
        }).minify(content);
        
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

  getFiles(dir, extension) {
    const files = [];
    
    function scanDirectory(directory) {
      const items = fs.readdirSync(directory);
      
      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.endsWith(extension)) {
          files.push(fullPath);
        }
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