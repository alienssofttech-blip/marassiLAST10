const fs = require('fs');
const path = require('path');

// Ensure we're in the project root directory
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

class WebsiteValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  async validate() {
    console.log('🔍 Starting website validation...\n');
    
    this.validateHTMLStructure();
    this.validateAssets();
    this.validateSEO();
    this.validateSecurity();
    this.validatePerformance();
    this.validateAccessibility();
    
    this.generateReport();
  }

  validateHTMLStructure() {
    console.log('📄 Validating HTML structure...');
    const htmlFiles = this.getFiles('.', '.html');
    
    for (const file of htmlFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for required elements
        const checks = [
          { test: /<title>/i, message: 'Title tag present' },
          { test: /<meta name="description"/i, message: 'Meta description present' },
          { test: /<meta name="viewport"/i, message: 'Viewport meta tag present' },
          { test: /lang="/i, message: 'Language attribute present' },
          { test: /<h1>/i, message: 'H1 tag present' }
        ];
        
        checks.forEach(check => {
          if (check.test.test(content)) {
            this.passed.push(`${file}: ${check.message}`);
          } else {
            this.warnings.push(`${file}: Missing ${check.message}`);
          }
        });
        
      } catch (error) {
        this.errors.push(`${file}: Cannot read file - ${error.message}`);
      }
    }
  }

  validateAssets() {
    console.log('🖼️  Validating assets...');
    
    // Check if critical assets exist
    const criticalAssets = [
      'assets/css/main.css',
      'assets/js/main.js',
      'assets/images/logo/Marassi_logo.png',
      'header.html',
      'footer.html'
    ];
    
    criticalAssets.forEach(asset => {
      if (fs.existsSync(asset)) {
        this.passed.push(`Asset exists: ${asset}`);
      } else {
        this.errors.push(`Missing critical asset: ${asset}`);
      }
    });
  }

  validateSEO() {
    console.log('🔍 Validating SEO elements...');
    
    // Check for SEO files
    const seoFiles = ['sitemap.xml', 'robots.txt', 'manifest.json'];
    
    seoFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.passed.push(`SEO file exists: ${file}`);
      } else {
        this.warnings.push(`Missing SEO file: ${file}`);
      }
    });
  }

  validateSecurity() {
    console.log('🔒 Validating security measures...');
    
    // Check for security files
    const securityFiles = ['.htaccess', 'assets/js/security.js'];
    
    securityFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.passed.push(`Security file exists: ${file}`);
      } else {
        this.warnings.push(`Missing security file: ${file}`);
      }
    });
  }

  validatePerformance() {
    console.log('⚡ Validating performance optimizations...');
    
    // Check for performance files
    const perfFiles = ['sw.js', 'assets/js/performance.js'];
    
    perfFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.passed.push(`Performance file exists: ${file}`);
      } else {
        this.warnings.push(`Missing performance file: ${file}`);
      }
    });
  }

  validateAccessibility() {
    console.log('♿ Validating accessibility...');
    const htmlFiles = this.getFiles('.', '.html');
    
    for (const file of htmlFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for accessibility features
        const accessibilityChecks = [
          { test: /alt="/i, message: 'Images have alt attributes' },
          { test: /aria-/i, message: 'ARIA attributes present' },
          { test: /role="/i, message: 'Role attributes present' }
        ];
        
        accessibilityChecks.forEach(check => {
          if (check.test.test(content)) {
            this.passed.push(`${file}: ${check.message}`);
          } else {
            this.warnings.push(`${file}: Consider adding ${check.message}`);
          }
        });
        
      } catch (error) {
        this.errors.push(`${file}: Cannot validate accessibility - ${error.message}`);
      }
    }
  }

  getFiles(dir, extension) {
    const files = [];
    
    function scanDirectory(directory) {
      try {
        const items = fs.readdirSync(directory);
        
        for (const item of items) {
          const fullPath = path.join(directory, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            scanDirectory(fullPath);
          } else if (item.endsWith(extension)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    }
    
    scanDirectory(dir);
    return files;
  }

  generateReport() {
    console.log('\n📊 Validation Report:');
    console.log('======================');
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    console.log('\n✅ PASSED:');
    this.passed.forEach(pass => console.log(`  • ${pass}`));
    
    console.log('\n======================');
    console.log(`Total Errors: ${this.errors.length}`);
    console.log(`Total Warnings: ${this.warnings.length}`);
    console.log(`Total Passed: ${this.passed.length}`);
    
    if (this.errors.length === 0) {
      console.log('\n🎉 Website is ready for production!');
    } else {
      console.log('\n🔧 Please fix errors before deployment.');
    }
  }
}

// Run validation
const validator = new WebsiteValidator();
validator.validate().catch(console.error);