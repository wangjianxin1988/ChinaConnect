const fs = require('fs');
const path = 'src/pages/ai.astro';
let text = fs.readFileSync(path, 'utf8');

// 这个文件有两个 `---` 块 - 把第一个 `---` 改为只有 `---` 一行
// 原:  // @ts-nocheck\n---\nimport ...\n...\nconst aiSchemas = [ ... ];\n---\n\n<BaseLayout ... />
// 修:  // @ts-nocheck\n---\nimport ...\n...\nconst aiSchemas = [ ... ];\n---\n\n<BaseLayout ... />
// 实际是文件已经有 --- 但有 2 个块。删除多余的 ---, 让 2 个 `---` 都生效
// 实际上检查 - 文件确实有 2 个 ---, 但 Astro 期望只有 1 个 frontmatter 块
// 修复: 移除中间多余的 --- 或调整结构

// 我们的文件结构:
//   // @ts-nocheck
//   ---            <-- frontmatter 开始
//   import ...
//   const aiSchemas = [...]
//   ---            <-- frontmatter 结束
//   
//   <BaseLayout>   <-- 模板开始
//   ...
//
// 但文件实际只有 1 个 frontmatter 块 (前 2 个 ---)
// 等等, 文件里是 1 个 frontmatter + 模板 - 这是正常的
// 让我看实际字节
const hasBoth = text.includes('---\nimport AIChatPage') && text.includes('---\n\n<BaseLayout');
console.log('Has both --- patterns:', hasBoth);
const occurrences = (text.match(/^---$/gm) || []).length;
console.log('Total --- occurrences:', occurrences);
