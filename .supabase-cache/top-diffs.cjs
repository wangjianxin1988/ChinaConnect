const { execSync } = require('child_process');
const result = execSync('git diff HEAD --name-only --diff-filter=M', { encoding: 'utf8' });
const files = result.split('\n').filter(Boolean);
const sizes = files.map(f => {
  try {
    const diff = execSync(`git diff HEAD -- "${f}"`, { encoding: 'utf8' });
    return { f, lines: diff.split('\n').length };
  } catch (e) { return { f, lines: 0 }; }
});
sizes.sort((a, b) => b.lines - a.lines);
console.log('Top 20 largest diffs:');
sizes.slice(0, 20).forEach(s => console.log(s.lines + ' lines: ' + s.f));
