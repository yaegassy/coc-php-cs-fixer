import fs from 'node:fs';

const RESOURCE_FILE_PATH = new URL(`../schemas/pint-schema.json`, import.meta.url).pathname;

if (fs.readFileSync(RESOURCE_FILE_PATH, { encoding: 'utf8' }).split('\n').length === 1) {
  console.log('NG');
  process.exit(1);
}
