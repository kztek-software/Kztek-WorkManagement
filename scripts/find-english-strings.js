const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

const englishKeywords = [
  'Description',
  'Due date',
  'Story points',
  'Assignee',
  'Created at',
  'Updated at',
  'Attachments',
  'Subtasks',
  'Checklist',
  'Comments',
  'Activity',
  'History',
  'Overview',
  'Burndown',
  'Velocity',
  'Sign in',
  'Sign up',
  'Login',
  'Register',
  'Password',
  'Forgot password',
  'Remember me',
  'Settings',
  'Profile',
  'Logout',
  'Save changes',
  'Cancel',
  'Delete',
  'Edit',
  'Close',
  'Submit',
  'Search...',
  'No tasks found',
  'No members',
  'All projects',
  'New project',
  'New task',
  'New sprint',
  'In progress',
  'In review',
  'To do',
  'Done',
  'Urgent',
  'High',
  'Medium',
  'Low',
];

function scanDir(dir, results = []) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== 'generated') {
        scanDir(fullPath, results);
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        // Skip comment lines or import lines
        if (line.trim().startsWith('//') || line.trim().startsWith('import ') || line.trim().startsWith('/*')) return;
        
        for (const kw of englishKeywords) {
          const regex = new RegExp(`(?<![a-zA-Z0-9_-])["'\`>\\s]${kw}["'\`<\\s]`, 'i');
          if (regex.test(line)) {
            results.push({
              file: path.relative(path.join(__dirname, '..'), fullPath).replace(/\\/g, '/'),
              line: idx + 1,
              keyword: kw,
              content: line.trim(),
            });
            break;
          }
        }
      });
    }
  }
  return results;
}

const hits = scanDir(srcDir);
console.log(`Tìm thấy ${hits.length} dòng chứa từ khóa tiếng Anh trong giao diện / components:`);
const byFile = {};
for (const hit of hits) {
  byFile[hit.file] = (byFile[hit.file] || 0) + 1;
}

for (const [f, count] of Object.entries(byFile)) {
  console.log(`- ${f}: ${count} chỗ`);
}

fs.writeFileSync(path.join(__dirname, 'english-scan-results.json'), JSON.stringify(hits, null, 2));
