// Simple script to replace all callXAI references with callOpenAI
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name from the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_DIR = path.join(__dirname, 'server');

// Function to recursively find all .ts files in a directory
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fileList = findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Replace callXAI with callOpenAI in a file
function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains callXAI
    if (!content.includes('callXAI')) {
      return false;
    }
    
    // Replace import statements
    content = content.replace(/import\s*\{\s*callXAI\s*,/g, 'import { callOpenAI,');
    content = content.replace(/import\s*\{\s*(.*?)\s*,\s*callXAI\s*,/g, 'import { $1, callOpenAI,');
    content = content.replace(/import\s*\{\s*(.*?)\s*,\s*callXAI\s*\}/g, 'import { $1, callOpenAI }');
    
    // Replace function calls
    content = content.replace(/callXAI\(/g, 'callOpenAI(');
    content = content.replace(/await\s+callXAI\(/g, 'await callOpenAI(');
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    
    return true;
  } catch (error) {
    console.error(`Error replacing in file ${filePath}:`, error);
    return false;
  }
}

// Main function to find and replace in all files
function replaceAllFiles() {
  const tsFiles = findTsFiles(SERVER_DIR);
  let replacedCount = 0;
  
  console.log(`Found ${tsFiles.length} TypeScript files. Checking for callXAI references...`);
  
  tsFiles.forEach(file => {
    const replaced = replaceInFile(file);
    if (replaced) {
      replacedCount++;
      console.log(`- Replaced callXAI references in: ${file}`);
    }
  });
  
  console.log(`\nReplacement complete! Processed ${replacedCount} files.`);
}

// Execute the replacement
replaceAllFiles();