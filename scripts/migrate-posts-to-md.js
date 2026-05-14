import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const postsJson = JSON.parse(readFileSync(join(rootDir, 'src/data/posts.json'), 'utf-8'));
const outDir = join(rootDir, 'src/content/posts');

mkdirSync(outDir, { recursive: true });

function escapeYaml(str) {
  if (!str) return '""';
  // Wrap in quotes if it contains special YAML chars
  if (/[:#\[\]{}&*!|>'"%@`,?-]/.test(str) || str.includes('\n') || str.trim() !== str) {
    return JSON.stringify(str); // JSON-style double-quoting is valid YAML
  }
  return str;
}

let count = 0;

for (const post of postsJson) {
  const categories = (post.categories || []).map(c => `  - ${escapeYaml(c)}`).join('\n');

  const frontmatter = [
    '---',
    `title: ${escapeYaml(post.title)}`,
    `slug: ${escapeYaml(post.slug)}`,
    `date: ${escapeYaml(post.date)}`,
    `author: ${escapeYaml(post.author)}`,
    `categories:`,
    categories,
    `excerpt: ${escapeYaml(post.excerpt || '')}`,
    `image: ${escapeYaml(post.image || '')}`,
    '---',
  ].join('\n');

  const content = post.content || '';
  const fileContent = frontmatter + '\n\n' + content + '\n';

  const filename = `${post.slug}.md`;
  writeFileSync(join(outDir, filename), fileContent, 'utf-8');
  count++;
}

console.log(`Migrated ${count} posts to ${outDir}`);
