import {
  TextEdit,
  workspace,
  commands,
  ExtensionContext,
  languages,
  Disposable,
  DocumentSelector,
  window,
} from 'coc.nvim';
import fs from 'fs';
import path from 'path';

import FixerFormattingEditProvider, { doFormat, fullDocumentRange } from './format';
import { FixerCodeActionProvider } from './action';
import { download } from './downloader';

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

  const downloadMajorVersion = extensionConfig.get<number>('downloadMajorVersion', 3);
  const isEnableFormatProvider = extensionConfig.get<boolean>('enableFormatProvider', false);
  const isEnableActionProvider = extensionConfig.get<boolean>('enableActionProvider', true);

  const outputChannel = window.createOutputChannel('php-cs-fixer');

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath);
  }

  let toolPath = extensionConfig.get('toolPath', '');
  if (!toolPath) {
    if (fs.existsSync(path.join('vendor', 'bin', 'php-cs-fixer'))) {
      toolPath = path.join('vendor', 'bin', 'php-cs-fixer');
    } else if (fs.existsSync(path.join(context.storagePath, 'php-cs-fixer'))) {
      toolPath = path.join(context.storagePath, 'php-cs-fixer');
    }
  }

  if (!toolPath) {
    await downloadWrapper(context, downloadMajorVersion);
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

  context.subscriptions.push(
    commands.registerCommand('php-cs-fixer.fix', async () => {
      const doc = await workspace.document;

      const code = await doFormat(context, outputChannel, doc.textDocument, undefined);
      const edits = [TextEdit.replace(fullDocumentRange(doc.textDocument), code)];
      if (edits) {
        await doc.applyEdits(edits);
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand('php-cs-fixer.download', async () => {
      await downloadWrapper(context, downloadMajorVersion);
    })
  );

  if (isEnableActionProvider) {
    context.subscriptions.push(languages.registerCodeActionProvider(languageSelector, actionProvider, 'php-cs-fixer'));
  }
}

async function downloadWrapper(context: ExtensionContext, downloadMajorVersion: number) {
  let msg = 'Do you want to download "php-cs-fixer"?';

  let ret = 0;
  ret = await window.showQuickpick(['Yes', 'Cancel'], msg);
  if (ret === 0) {
    try {
      await download(context, downloadMajorVersion);
    } catch (e) {
      console.error(e);
      msg = 'Download php-cs-fixer failed, you can get it from https://github.com/FriendsOfPHP/PHP-CS-Fixer';
      window.showMessage(msg, 'error');
      return;
    }
  } else {
    return;
  }
}
