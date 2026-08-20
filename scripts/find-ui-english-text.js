const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  const patterns = [
    { regex: />\s*(Description|Due date|Assignee|Story points|Story Points|Checklist|Subtasks|Attachments|Comments|Activity|History|Overview|Burndown|Velocity|Settings|Profile|Logout|Save changes|Cancel|Delete|Edit|Close|Submit|Filter|Sort by|Sign in|Sign up|Forgot password|Remember me|All projects|New project|New task|New sprint|Urgent|High|Medium|Low|Task|Story|Bug|Epic|In progress|In review|To do|Done)\s*</i, name: 'JSX text' },
    { regex: /placeholder=["']([^"']*(?:Search|Enter|Type|Select|Name|Email|Password|Title|Description|Choose|Filter)[^"']*)["']/i, name: 'Placeholder' },
    { regex: /label:\s*["'](Description|Due date|Assignee|Story points|Story Points|Checklist|Subtasks|Attachments|Comments|Activity|History|Overview|Burndown|Velocity|Settings|Profile|Logout|Save changes|Cancel|Delete|Edit|Close|Submit|Filter|Sort by|Sign in|Sign up|Forgot password|Remember me|All projects|New project|New task|New sprint|Urgent|High|Medium|Low|Task|Story|Bug|Epic|In progress|In review|To do|Done)["']/i, name: 'Object label' },
  ];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('import ')) return;
    for (const p of patterns) {
      const match = line.match(p.regex);
      if (match) {
        issues.push({
          file: path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/'),
          line: idx + 1,
          type: p.name,
          match: match[0],
          content: line.trim(),
        });
        break;
      }
    }
  });

  return issues;
}

function scanDir(dir) {
  let issues = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (item !== 'node_modules' && item !== '.next' && item !== 'generated') {
        issues = issues.concat(scanDir(full));
      }
    } else if (item.endsWith('.tsx')) {
      issues = issues.concat(scanFile(full));
    }
  }
  return issues;
}

const allIssues = scanDir(srcDir);
console.log(`Tìm thấy ${allIssues.length} vị trí text UI có từ khóa tiếng Anh:`);
allIssues.forEach((iss) => {
  console.log(`[${iss.file}:${iss.line}] (${iss.type}) ${iss.match}  ==>  ${iss.content}`);
});
