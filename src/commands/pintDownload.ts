import { commands, ExtensionContext, window } from 'coc.nvim';
import { download } from '../downloaders/pintDownloader';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand('php-cs-fixer.pintDownload', runDownloadCommand(context)));
}

function runDownloadCommand(context: ExtensionContext) {
  return async () => {
    await downloadWrapper(context);
  };
}

async function downloadWrapper(context: ExtensionContext) {
  let msg = 'Do you want to download "pint"?';
  const ret = await window.showPrompt(msg);
  if (ret) {
    try {
      await download(context);
      commands.executeCommand('editor.action.restart');
    } catch (e) {
      console.error(e);
      msg = 'Download pint failed, you can get it from https://github.com/laravel/pint/releases';
      window.showErrorMessage(msg);
      return;
    }
  } else {
    return;
  }
}
