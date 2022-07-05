import { ExtensionContext, window } from 'coc.nvim';
import { randomBytes } from 'crypto';
import { createWriteStream, promises as fs } from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';
import path from 'path';
import stream from 'stream';
import util from 'util';

const pipeline = util.promisify(stream.pipeline);
const agent = process.env.https_proxy ? new HttpsProxyAgent(process.env.https_proxy as string) : null;

export async function download(context: ExtensionContext): Promise<void> {
  const statusItem = window.createStatusBarItem(0, { progress: true });
  statusItem.text = `Downloading pint`;
  statusItem.show();

  const downloadUrl = 'https://github.com/laravel/pint/releases/latest/download/pint.phar';

  // @ts-ignore
  const resp = await fetch(downloadUrl, { agent });
  if (!resp.ok) {
    statusItem.hide();
    throw new Error('Download failed');
  }

  let cur = 0;
  const len = Number(resp.headers.get('content-length'));
  resp.body.on('data', (chunk: Buffer) => {
    cur += chunk.length;
    const p = ((cur / len) * 100).toFixed(2);
    statusItem.text = `${p}% Downloading pint`;
  });

  const _path = path.join(context.storagePath, 'pint');
  const randomHex = randomBytes(5).toString('hex');
  const tempFile = path.join(context.storagePath, `pint-${randomHex}`);

  const destFileStream = createWriteStream(tempFile, { mode: 0o755 });
  await pipeline(resp.body, destFileStream);
  await new Promise<void>((resolve) => {
    destFileStream.on('close', resolve);
    destFileStream.destroy();
    setTimeout(resolve, 1000);
  });

  await fs.unlink(_path).catch((err) => {
    if (err.code !== 'ENOENT') throw err;
  });
  await fs.rename(tempFile, _path);

  statusItem.hide();
}
