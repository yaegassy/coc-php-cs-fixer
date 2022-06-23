import { commands, Disposable, DocumentSelector, ExtensionContext, languages, window, workspace } from 'coc.nvim';
import fs from 'fs';
import path from 'path';

import { FixerCodeActionProvider } from './action';
import * as downloadCommandFeature from './commands/download';
import * as fixCommandFeature from './commands/fix';
import FixerFormattingEditProvider from './format';

let formatterHandler: undefined | Disposable;

function disposeHandlers(): void {
  if (formatterHandler) {
    formatterHandler.dispose();
  }
  formatterHandler = undefined;
}

export async function activate(context: ExtensionContext): Promise<void> {
  const extensionConfig = workspace.getConfiguration('php-cs-fixer');
  const isEnable = extensionConfig.get<boolean>('enable', true);
  if (!isEnable) return;

  const isEnableFormatProvider = extensionConfig.get<boolean>('enableFormatProvider', false);
  const isEnableActionProvider = extensionConfig.get<boolean>('enableActionProvider', true);

  const outputChannel = window.createOutputChannel('php-cs-fixer');

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath);
  }

  // register command feature
  fixCommandFeature.activate(context, outputChannel);
  downloadCommandFeature.activate(context);

  let toolPath = extensionConfig.get('toolPath', '');
  if (!toolPath) {
    if (fs.existsSync(path.join('vendor', 'bin', 'php-cs-fixer'))) {
      toolPath = path.join('vendor', 'bin', 'php-cs-fixer');
    } else if (fs.existsSync(path.join(context.storagePath, 'php-cs-fixer'))) {
      toolPath = path.join(context.storagePath, 'php-cs-fixer');
    }
  }
  if (!toolPath) {
    commands.executeCommand('php-cs-fixer.download');
  }

  const editProvider = new FixerFormattingEditProvider(context, outputChannel);
  const actionProvider = new FixerCodeActionProvider();

  const priority = 1;
  const languageSelector: DocumentSelector = [{ language: 'php', scheme: 'file' }];

  function registerFormatter(): void {
    disposeHandlers();

    if (isEnableFormatProvider) {
      formatterHandler = languages.registerDocumentFormatProvider(languageSelector, editProvider, priority);
    }
  }
  registerFormatter();

  if (isEnableActionProvider) {
    context.subscriptions.push(languages.registerCodeActionProvider(languageSelector, actionProvider, 'php-cs-fixer'));
  }
}
