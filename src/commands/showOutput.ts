import { commands, ExtensionContext, OutputChannel } from 'coc.nvim';

export function activate(context: ExtensionContext, outputChannel: OutputChannel) {
  context.subscriptions.push(
    commands.registerCommand('php-cs-fixer.showOutput', () => {
      outputChannel.show();
    })
  );
}
