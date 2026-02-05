import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

// Function to calculate file hash
function calculateHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex').slice(0, 8);
}

// Function to update file references in HTML
function updateHtmlReferences() {
    const htmlFiles = ['index.html', 'index.ja.html'];
    const cssHash = calculateHash('index.min.css');
    const jsHash = calculateHash('index.min.js');

    htmlFiles.forEach(htmlFile => {
        let htmlContent = fs.readFileSync(htmlFile, 'utf8');

        // Update CSS reference
        htmlContent = htmlContent.replace(
            /(index\.min\.css)(\?v=[a-f0-9]*)?/g,
            `$1?v=${cssHash}`
        );

        // Update JS reference
        htmlContent = htmlContent.replace(
            /(index\.min\.js)(\?v=[a-f0-9]*)?/g,
            `$1?v=${jsHash}`
        );

        fs.writeFileSync(htmlFile, htmlContent);
        console.log(`✅ Updated version hashes in ${htmlFile}`);
    });
}

// Function to update CSS background image references
function updateCssReferences() {
    const cssFile = 'index.css';
    let cssContent = fs.readFileSync(cssFile, 'utf8');

    // Find all image references in CSS
    const imageRegex = /url\(['"]?(.*?)['"]?\)/g;
    const matches = [...cssContent.matchAll(imageRegex)];

    matches.forEach(match => {
        const imagePath = match[1].replace(/['"]|\.\.\/|\.\//g, '');
        if (fs.existsSync(imagePath)) {
            const imageHash = calculateHash(imagePath);
            const newPath = `${imagePath}?v=${imageHash}`;
            cssContent = cssContent.replace(match[1], newPath);
        }
    });

    fs.writeFileSync(cssFile, cssContent);
    console.log('✅ Updated version hashes in CSS files');
}

// Run the versioning
try {
    updateHtmlReferences();
    updateCssReferences();
    console.log('✅ Version updates completed successfully');
} catch (error) {
    console.error('❌ Error updating versions:', error);
    process.exit(1);
} 