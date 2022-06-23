import { commands, ExtensionContext, OutputChannel, TextEdit, workspace } from 'coc.nvim';
import { doFormat, fullDocumentRange } from '../format';

export function activate(context: ExtensionContext, outputChannel: OutputChannel) {
  context.subscriptions.push(commands.registerCommand('php-cs-fixer.fix', runFixCommand(context, outputChannel)));
}

function runFixCommand(context: ExtensionContext, outputChannel: OutputChannel) {
  return async () => {
    const doc = await workspace.document;

    const code = await doFormat(context, outputChannel, doc.textDocument, undefined);
    if (!code) return;

    const edits = [TextEdit.replace(fullDocumentRange(doc.textDocument), code)];
    if (edits) {
      await doc.applyEdits(edits);
    }
  };
}
