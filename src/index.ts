import { commands, ExtensionContext, window, workspace } from 'coc.nvim';

import fs from 'fs';
import path from 'path';

import * as fixCodeActionFeature from './actions/fix';
import * as downloadCommandFeature from './commands/download';
import * as fixCommandFeature from './commands/fix';
import * as showOutputCommandFeature from './commands/showOutput';
import * as fixerDocumentFormatFeature from './documentFormats/fixer';
import * as statusBarFeature from './statusBar';

export async function activate(context: ExtensionContext): Promise<void> {
  if (!workspace.getConfiguration('php-cs-fixer').get<boolean>('enable', true)) return;

  const outputChannel = window.createOutputChannel('php-cs-fixer');
  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath);
  }

  fixCommandFeature.activate(context, outputChannel);
  downloadCommandFeature.activate(context);
  showOutputCommandFeature.activate(context, outputChannel);

  let toolPath = workspace.getConfiguration('php-cs-fixer').get('toolPath', '');
  if (!toolPath) {
    if (fs.existsSync(path.join(workspace.root, 'vendor', 'bin', 'php-cs-fixer'))) {
      toolPath = path.join(workspace.root, 'vendor', 'bin', 'php-cs-fixer');
    } else if (fs.existsSync(path.join(context.storagePath, 'php-cs-fixer'))) {
      toolPath = path.join(context.storagePath, 'php-cs-fixer');
    }
  }
  if (!toolPath) {
    commands.executeCommand('php-cs-fixer.download');
  }

  fixerDocumentFormatFeature.activate(context, outputChannel);
  fixCodeActionFeature.activate(context);
  statusBarFeature.activate(context);
}
