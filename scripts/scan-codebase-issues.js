const fs = require('fs');
const path = require('path');

const results = {
  misplacedImports: [],
  hardcodedUrls: [],
  potentialNullErrors: [],
  missingReturnTypes: [],
  unhandledCatch: []
};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let nonImportFound = false;
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('import ') && !trimmed.includes('import(')) {
      if (nonImportFound) {
        results.misplacedImports.push({ file: relPath, line: idx + 1, code: trimmed });
      }
    } else if (
      trimmed &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('/*') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('"use client"') &&
      !trimmed.startsWith("'use client'") &&
      !trimmed.startsWith('"use server"') &&
      !trimmed.startsWith("'use server'")
    ) {
      nonImportFound = true;
    }

    // Check for hardcoded localhost in non-test files
    if (!relPath.includes('scripts') && trimmed.includes('http://localhost:3000') && !trimmed.includes('NEXT_PUBLIC_APP_URL') && !trimmed.includes('getAppBaseUrl')) {
      results.hardcodedUrls.push({ file: relPath, line: idx + 1, code: trimmed });
    }

    // Check for unhandled JSON parse or dangerous access
    if (trimmed.includes('JSON.parse(') && !content.slice(Math.max(0, content.indexOf(trimmed) - 200), content.indexOf(trimmed) + 200).includes('try')) {
      // Possible risk
    }
  });
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) scanDir(full);
    else if (f.endsWith('.ts') || f.endsWith('.tsx')) checkFile(full);
  });
}

scanDir(path.join(__dirname, '../src'));

console.log('=== KẾT QUẢ QUÉT TỰ ĐỘNG TOÀN BỘ SRC/ ===\n');
console.log(`1. Misplaced imports (${results.misplacedImports.length}):`);
results.misplacedImports.forEach(m => console.log(`   - [${m.file}:${m.line}] ${m.code}`));

console.log(`\n2. Hardcoded localhost URLs (${results.hardcodedUrls.length}):`);
results.hardcodedUrls.forEach(m => console.log(`   - [${m.file}:${m.line}] ${m.code}`));

console.log('\nScan completed.');
