// MARASSI Logistics - Bundle Analysis Tool
const fs = require('fs');
const path = require('path');

class BundleAnalyzer {
  constructor() {
    this.stats = {
      totalSize: 0,
      files: [],
      categories: {
        html: { count: 0, size: 0 },
        css: { count: 0, size: 0 },
        js: { count: 0, size: 0 },
        images: { count: 0, size: 0 },
        fonts: { count: 0, size: 0 },
        other: { count: 0, size: 0 }
      },
      vendorLibraries: [],
      customCode: [],
      recommendations: []
    };
  }

  analyze() {
    console.log('🔍 Starting Bundle Analysis...\n');

    this.analyzeAssets();
    this.analyzeVendorLibraries();
    this.generateRecommendations();
    this.generateReport();

    console.log('✅ Analysis complete!\n');
  }

  analyzeAssets() {
    console.log('📦 Analyzing assets...');

    // Analyze HTML files
    this.scanDirectory('.', '.html', 'html');

    // Analyze CSS files
    this.scanDirectory('assets/css', '.css', 'css');

    // Analyze JavaScript files
    this.scanDirectory('assets/js', '.js', 'js');

    // Analyze images
    this.scanDirectory('assets/images', ['.png', '.jpg', '.jpeg', '.svg', '.webp'], 'images');

    // Analyze fonts
    this.scanDirectory('assets', ['.woff', '.woff2', '.ttf', '.otf'], 'fonts');
  }

  scanDirectory(dir, extensions, category) {
    if (!fs.existsSync(dir)) return;

    const exts = Array.isArray(extensions) ? extensions : [extensions];

    const scanDir = (directory) => {
      const items = fs.readdirSync(directory);

      for (const item of items) {
        const fullPath = path.join(directory, item);

        // Skip node_modules
        if (fullPath.includes('node_modules')) continue;

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (exts.includes(ext)) {
            const size = stat.size;
            this.stats.totalSize += size;
            this.stats.categories[category].count++;
            this.stats.categories[category].size += size;

            this.stats.files.push({
              path: fullPath,
              name: item,
              size: size,
              category: category,
              type: ext
            });
          }
        }
      }
    };

    scanDir(dir);
  }

  analyzeVendorLibraries() {
    console.log('📚 Analyzing vendor libraries...');

    const jsFiles = this.stats.files.filter(f => f.category === 'js');

    const vendors = [
      { name: 'jQuery', pattern: /jquery/i, file: null, size: 0 },
      { name: 'Bootstrap', pattern: /bootstrap/i, file: null, size: 0 },
      { name: 'GSAP', pattern: /gsap/i, file: null, size: 0 },
      { name: 'Swiper', pattern: /swiper/i, file: null, size: 0 },
      { name: 'AOS', pattern: /aos/i, file: null, size: 0 },
      { name: 'Counterup', pattern: /counterup/i, file: null, size: 0 },
      { name: 'Magnific Popup', pattern: /magnific-popup/i, file: null, size: 0 },
      { name: 'Phosphor Icons', pattern: /phosphor/i, file: null, size: 0 }
    ];

    for (const vendor of vendors) {
      const found = jsFiles.find(f => vendor.pattern.test(f.name));
      if (found) {
        vendor.file = found.name;
        vendor.size = found.size;
        this.stats.vendorLibraries.push(vendor);
      }
    }

    // Identify custom code
    const customFiles = jsFiles.filter(f => {
      return !vendors.some(v => v.pattern.test(f.name)) &&
             !f.name.includes('.min.js');
    });

    this.stats.customCode = customFiles;
  }

  generateRecommendations() {
    console.log('💡 Generating recommendations...');

    const recommendations = [];

    // Check for large files
    const largeFiles = this.stats.files.filter(f => f.size > 100000); // > 100KB
    if (largeFiles.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'Large Files',
        message: `Found ${largeFiles.length} files larger than 100KB`,
        files: largeFiles.map(f => `${f.name} (${this.formatBytes(f.size)})`),
        action: 'Consider code splitting, lazy loading, or compression'
      });
    }

    // Check for non-minified files
    const nonMinified = this.stats.files.filter(f =>
      (f.category === 'js' || f.category === 'css') &&
      !f.name.includes('.min.')
    );
    if (nonMinified.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'Minification',
        message: `Found ${nonMinified.length} non-minified JS/CSS files`,
        files: nonMinified.map(f => f.name),
        action: 'Ensure build process minifies all production assets'
      });
    }

    // Check for jQuery (large library)
    const jquery = this.stats.vendorLibraries.find(v => v.name === 'jQuery');
    if (jquery) {
      recommendations.push({
        priority: 'LOW',
        type: 'Dependency Review',
        message: 'jQuery is a large dependency (87KB minified)',
        action: 'Consider modern vanilla JS alternatives for new features'
      });
    }

    // Check for duplicate libraries (minified + non-minified)
    const duplicates = this.findDuplicates();
    if (duplicates.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'Duplicate Files',
        message: `Found ${duplicates.length} potential duplicate files`,
        files: duplicates,
        action: 'Use only minified versions in production'
      });
    }

    // Check total JS bundle size
    const totalJS = this.stats.categories.js.size;
    if (totalJS > 500000) { // > 500KB
      recommendations.push({
        priority: 'HIGH',
        type: 'Bundle Size',
        message: `Total JavaScript size is ${this.formatBytes(totalJS)}`,
        action: 'Implement code splitting and lazy loading for non-critical scripts'
      });
    }

    // Check for WebP image usage
    const images = this.stats.files.filter(f => f.category === 'images');
    const webpImages = images.filter(f => f.type === '.webp');
    if (webpImages.length === 0 && images.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'Image Optimization',
        message: 'No WebP images found',
        action: 'Convert images to WebP format for better compression'
      });
    }

    this.stats.recommendations = recommendations;
  }

  findDuplicates() {
    const duplicates = [];
    const seen = new Map();

    for (const file of this.stats.files) {
      const baseName = file.name.replace('.min', '').replace(/\.(js|css)$/, '');

      if (seen.has(baseName)) {
        const existing = seen.get(baseName);
        if (existing.name !== file.name) {
          duplicates.push(`${existing.name} / ${file.name}`);
        }
      } else {
        seen.set(baseName, file);
      }
    }

    return duplicates;
  }

  generateReport() {
    console.log('\n📊 Bundle Analysis Report');
    console.log('='.repeat(80));

    // Overall stats
    console.log('\n📈 Overall Statistics:');
    console.log(`   Total Files: ${this.stats.files.length}`);
    console.log(`   Total Size: ${this.formatBytes(this.stats.totalSize)}`);

    // Category breakdown
    console.log('\n📂 Category Breakdown:');
    for (const [category, data] of Object.entries(this.stats.categories)) {
      if (data.count > 0) {
        const percentage = ((data.size / this.stats.totalSize) * 100).toFixed(1);
        console.log(`   ${category.toUpperCase().padEnd(10)} ${data.count.toString().padStart(3)} files  ${this.formatBytes(data.size).padStart(10)}  (${percentage}%)`);
      }
    }

    // Vendor libraries
    if (this.stats.vendorLibraries.length > 0) {
      console.log('\n📚 Vendor Libraries:');
      const totalVendorSize = this.stats.vendorLibraries.reduce((sum, v) => sum + v.size, 0);
      for (const vendor of this.stats.vendorLibraries) {
        console.log(`   ${vendor.name.padEnd(20)} ${this.formatBytes(vendor.size).padStart(10)}  ${vendor.file}`);
      }
      console.log(`   ${'TOTAL'.padEnd(20)} ${this.formatBytes(totalVendorSize).padStart(10)}`);
    }

    // Custom code
    if (this.stats.customCode.length > 0) {
      console.log('\n✍️  Custom JavaScript:');
      const totalCustomSize = this.stats.customCode.reduce((sum, f) => sum + f.size, 0);
      for (const file of this.stats.customCode.slice(0, 10)) { // Top 10
        console.log(`   ${file.name.padEnd(30)} ${this.formatBytes(file.size).padStart(10)}`);
      }
      if (this.stats.customCode.length > 10) {
        console.log(`   ... and ${this.stats.customCode.length - 10} more files`);
      }
      console.log(`   ${'TOTAL'.padEnd(30)} ${this.formatBytes(totalCustomSize).padStart(10)}`);
    }

    // Top 10 largest files
    console.log('\n🏆 Top 10 Largest Files:');
    const largest = [...this.stats.files]
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    for (const file of largest) {
      console.log(`   ${file.name.padEnd(40)} ${this.formatBytes(file.size).padStart(10)}  [${file.category}]`);
    }

    // Recommendations
    if (this.stats.recommendations.length > 0) {
      console.log('\n💡 Optimization Recommendations:');
      console.log('='.repeat(80));

      for (const rec of this.stats.recommendations) {
        console.log(`\n[${rec.priority}] ${rec.type}`);
        console.log(`   ${rec.message}`);
        if (rec.files && rec.files.length > 0) {
          console.log(`   Files: ${rec.files.slice(0, 5).join(', ')}`);
          if (rec.files.length > 5) {
            console.log(`   ... and ${rec.files.length - 5} more`);
          }
        }
        console.log(`   Action: ${rec.action}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Analysis saved to: bundle-analysis-report.json');

    // Save JSON report
    fs.writeFileSync(
      'bundle-analysis-report.json',
      JSON.stringify(this.stats, null, 2)
    );
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run analysis
const analyzer = new BundleAnalyzer();
analyzer.analyze();
