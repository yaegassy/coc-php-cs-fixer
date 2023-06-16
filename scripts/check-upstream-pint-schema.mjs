import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const FEATCH_URL = 'https://raw.githubusercontent.com/open-southeners/vscode-laravel-pint/main/pint-schema.json';
const SCHEMA_PATH = path.join(new URL('..', import.meta.url).pathname, 'schemas', 'pint-schema.json');

async function fetchContent(url) {
  const response = await fetch(url);
  if (!response.ok) return;

  return await response.text();
}

function isDiff(srcText, filePath) {
  const destText = fs.readFileSync(filePath, { encoding: 'utf8' });
  return srcText === destText;
}

// Entry Point
(async () => {
  const content = await fetchContent(FEATCH_URL);
  if (!content) {
    console.log('Fetch has failed.');
    process.exit(1);
  }

  if (isDiff(content, SCHEMA_PATH)) {
    console.log('OK');
    process.exit(0);
  } else {
    console.log('NG');
    process.exit(1);
  }
})();
