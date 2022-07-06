import { commands, ExtensionContext, window, workspace } from 'coc.nvim';

import fs from 'fs';

import * as pcfFixCodeActionFeature from './actions/pcfFix';
import * as pintFixCodeActionFeature from './actions/pintFix';
import * as pcfDownloadCommandFeature from './commands/pcfDownload';
import * as pcfDryRunDiffCommandFeature from './commands/pcfDryRunDiff';
import * as pcfFixCommandFeature from './commands/pcfFix';
import * as pintDonwloadCommandFeature from './commands/pintDownload';
import * as pintFixCommandFeature from './commands/pintFix';
import * as pintTestCommandFeature from './commands/pintTest';
import * as showOutputCommandFeature from './commands/showOutput';
import { getPcfPath, getPintPath } from './common';
import * as pcfFixDocumentFormatFeature from './documentFormats/pcfFix';
import * as pintFixDocumentFormatFeature from './documentFormats/pintFix';
import * as statusBarFeature from './statusBar';

export async function activate(context: ExtensionContext): Promise<void> {
  if (!workspace.getConfiguration('php-cs-fixer').get<boolean>('enable', true)) return;

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath);
  }

  const outputChannel = window.createOutputChannel('php-cs-fixer');
  showOutputCommandFeature.activate(context, outputChannel);
  pcfDownloadCommandFeature.activate(context);
  pintDonwloadCommandFeature.activate(context);

  const activateTool = workspace.getConfiguration('php-cs-fixer').get<string>('activateTool', 'php-cs-fixer');

  let toolPath: string | undefined;
  if (activateTool === 'php-cs-fixer') {
    toolPath = getPcfPath(context);
    if (workspace.getConfiguration('php-cs-fixer').get('downloadCheckOnStartup', true)) {
      if (!toolPath) {
        commands.executeCommand('php-cs-fixer.download');
      }
    }
  } else if (activateTool === 'pint') {
    toolPath = getPintPath(context);
    if (workspace.getConfiguration('php-cs-fixer').get('downloadCheckOnStartup', true)) {
      if (!toolPath) {
        commands.executeCommand('php-cs-fixer.pintDownload');
      }
    }
  }
  if (!toolPath) return;

  if (activateTool === 'php-cs-fixer') {
    pcfFixCommandFeature.activate(context, outputChannel);
    pcfDryRunDiffCommandFeature.activate(context);
    pcfFixDocumentFormatFeature.activate(context, outputChannel);
    pcfFixCodeActionFeature.activate(context);
  } else if (activateTool === 'pint') {
    pintFixCommandFeature.activate(context, outputChannel);
    pintTestCommandFeature.activate(context);
    pintFixDocumentFormatFeature.activate(context, outputChannel);
    pintFixCodeActionFeature.activate(context);
  }

  if (activateTool === 'php-cs-fixer' || activateTool === 'pint') statusBarFeature.activate(context);
}
