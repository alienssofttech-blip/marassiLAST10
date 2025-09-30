const fs = require('fs');
const path = require('path');

class WebsiteTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  async runTests() {
    console.log('🧪 Running website tests...\n');
    
    this.testFileStructure();
    this.testHTMLValidity();
    this.testLinkIntegrity();
    this.testImageOptimization();
    this.testSEOCompliance();
    this.testSecurityMeasures();
    
    this.generateTestReport();
  }

  testFileStructure() {
    console.log('📁 Testing file structure...');
    
    const requiredFiles = [
      'index.html',
      'about.html',
      'service.html',
      'project.html',
      'contact.html',
      'header.html',
      'footer.html',
      'privacy-policy.html',
      'terms-of-service.html',
      '404.html',
      '500.html',
      'sitemap.xml',
      'robots.txt',
      'manifest.json',
      '.htaccess'
    ];
    
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.pass(`File exists: ${file}`);
      } else {
        this.fail(`Missing required file: ${file}`);
      }
    });
  }

  testHTMLValidity() {
    console.log('\n📝 Testing HTML validity...');
    const htmlFiles = this.getFiles('.', '.html');
    
    htmlFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Basic HTML structure tests
        if (content.includes('<!DOCTYPE html>')) {
          this.pass(`${file}: Valid DOCTYPE`);
        } else {
          this.fail(`${file}: Missing or invalid DOCTYPE`);
        }
        
        if (content.includes('<html') && content.includes('</html>')) {
          this.pass(`${file}: Valid HTML structure`);
        } else {
          this.fail(`${file}: Invalid HTML structure`);
        }
        
        // Check for required meta tags
        if (content.includes('<meta charset=')) {
          this.pass(`${file}: Charset meta tag present`);
        } else {
          this.fail(`${file}: Missing charset meta tag`);
        }
        
      } catch (error) {
        this.fail(`${file}: Cannot read file - ${error.message}`);
      }
    });
  }

  testLinkIntegrity() {
    console.log('\n🔗 Testing link integrity...');
    const htmlFiles = this.getFiles('.', '.html');
    
    htmlFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Extract internal links
        const linkRegex = /href="([^"]*\.html[^"]*)"/g;
        let match;
        
        while ((match = linkRegex.exec(content)) !== null) {
          const linkedFile = match[1];
          if (!linkedFile.startsWith('http') && !linkedFile.startsWith('#')) {
            if (fs.existsSync(linkedFile)) {
              this.pass(`${file}: Link valid - ${linkedFile}`);
            } else {
              this.fail(`${file}: Broken link - ${linkedFile}`);
            }
          }
        }
        
      } catch (error) {
        this.fail(`${file}: Cannot test links - ${error.message}`);
      }
    });
  }

  testImageOptimization() {
    console.log('\n🖼️  Testing image optimization...');
    
    const htmlFiles = this.getFiles('.', '.html');
    
    htmlFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for lazy loading
        const imgTags = content.match(/<img[^>]*>/g) || [];
        let lazyLoadCount = 0;
        let altTextCount = 0;
        
        imgTags.forEach(img => {
          if (img.includes('loading="lazy"')) {
            lazyLoadCount++;
          }
          if (img.includes('alt="')) {
            altTextCount++;
          }
        });
        
        if (imgTags.length > 0) {
          const lazyPercentage = (lazyLoadCount / imgTags.length) * 100;
          const altPercentage = (altTextCount / imgTags.length) * 100;
          
          if (lazyPercentage > 80) {
            this.pass(`${file}: Good lazy loading coverage (${lazyPercentage.toFixed(1)}%)`);
          } else {
            this.warn(`${file}: Consider more lazy loading (${lazyPercentage.toFixed(1)}%)`);
          }
          
          if (altPercentage > 90) {
            this.pass(`${file}: Good alt text coverage (${altPercentage.toFixed(1)}%)`);
          } else {
            this.warn(`${file}: Consider adding more alt text (${altPercentage.toFixed(1)}%)`);
          }
        }
        
      } catch (error) {
        this.fail(`${file}: Cannot test images - ${error.message}`);
      }
    });
  }

  testSEOCompliance() {
    console.log('\n🔍 Testing SEO compliance...');
    
    // Test sitemap
    if (fs.existsSync('sitemap.xml')) {
      const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
      if (sitemap.includes('<urlset')) {
        this.pass('Sitemap: Valid XML structure');
      } else {
        this.fail('Sitemap: Invalid XML structure');
      }
    }
    
    // Test robots.txt
    if (fs.existsSync('robots.txt')) {
      const robots = fs.readFileSync('robots.txt', 'utf8');
      if (robots.includes('User-agent:')) {
        this.pass('Robots.txt: Valid format');
      } else {
        this.fail('Robots.txt: Invalid format');
      }
    }
  }

  testSecurityMeasures() {
    console.log('\n🔒 Testing security measures...');
    
    // Test .htaccess
    if (fs.existsSync('.htaccess')) {
      const htaccess = fs.readFileSync('.htaccess', 'utf8');
      
      const securityChecks = [
        { test: /Header.*X-XSS-Protection/i, message: 'XSS Protection header' },
        { test: /Header.*X-Content-Type-Options/i, message: 'Content-Type-Options header' },
        { test: /Header.*X-Frame-Options/i, message: 'Frame-Options header' },
        { test: /RewriteRule.*https/i, message: 'HTTPS redirect' }
      ];
      
      securityChecks.forEach(check => {
        if (check.test.test(htaccess)) {
          this.pass(`Security: ${check.message} configured`);
        } else {
          this.warn(`Security: Consider adding ${check.message}`);
        }
      });
    }
  }

  testPerformance() {
    console.log('\n⚡ Testing performance optimizations...');
    
    // Check for performance scripts
    if (fs.existsSync('assets/js/performance.js')) {
      this.pass('Performance: Optimization script present');
    } else {
      this.warn('Performance: Consider adding optimization script');
    }
    
    // Check for service worker
    if (fs.existsSync('sw.js')) {
      this.pass('Performance: Service worker present');
    } else {
      this.warn('Performance: Consider adding service worker');
    }
  }

  testAccessibility() {
    console.log('\n♿ Testing accessibility...');
    const htmlFiles = this.getFiles('.', '.html');
    
    htmlFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Basic accessibility checks
        if (content.includes('aria-')) {
          this.pass(`${file}: ARIA attributes present`);
        } else {
          this.warn(`${file}: Consider adding ARIA attributes`);
        }
        
        if (content.includes('role=')) {
          this.pass(`${file}: Role attributes present`);
        } else {
          this.warn(`${file}: Consider adding role attributes`);
        }
        
      } catch (error) {
        this.fail(`${file}: Cannot test accessibility - ${error.message}`);
      }
    });
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

  pass(message) {
    this.testResults.passed++;
    console.log(`  ✅ ${message}`);
  }

  fail(message) {
    this.testResults.failed++;
    console.log(`  ❌ ${message}`);
  }

  warn(message) {
    this.testResults.warnings++;
    console.log(`  ⚠️  ${message}`);
  }

  generateTestReport() {
    console.log('\n📊 Test Results:');
    console.log('=================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⚠️  Warnings: ${this.testResults.warnings}`);
    console.log('=================\n');
    
    if (this.testResults.failed === 0) {
      console.log('🎉 All critical tests passed! Website is production-ready.');
    } else {
      console.log('🔧 Please address failed tests before deployment.');
    }
  }
}

// Run tests
const tester = new WebsiteTester();
tester.runTests().catch(console.error);