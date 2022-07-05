import { commands, ExtensionContext, window, workspace } from 'coc.nvim';
import { download } from '../downloaders/pcfDownloader';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand('php-cs-fixer.download', runDownloadCommand(context)));
}

function runDownloadCommand(context: ExtensionContext) {
  return async () => {
    const downloadMajorVersion = workspace.getConfiguration('php-cs-fixer').get<number>('downloadMajorVersion', 3);
    await downloadWrapper(context, downloadMajorVersion);
  };
}

async function downloadWrapper(context: ExtensionContext, downloadMajorVersion: number) {
  let msg = 'Do you want to download "php-cs-fixer"?';
  const ret = await window.showPrompt(msg);
  if (ret) {
    try {
      await download(context, downloadMajorVersion);
      commands.executeCommand('editor.action.restart');
    } catch (e) {
      console.error(e);
      msg = 'Download php-cs-fixer failed, you can get it from https://github.com/FriendsOfPHP/PHP-CS-Fixer';
      window.showErrorMessage(msg);
      return;
    }
  } else {
    return;
  }
}
