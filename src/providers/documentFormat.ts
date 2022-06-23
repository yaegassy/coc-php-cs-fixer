import { DocumentSelector, ExtensionContext, languages, OutputChannel, workspace } from 'coc.nvim';
import { FixerFormattingEditProvider } from '../format';

export function activate(context: ExtensionContext, outputChannel: OutputChannel) {
  if (workspace.getConfiguration('php-cs-fixer').get<boolean>('enableFormatProvider', true)) {
    const languageSelector: DocumentSelector = [{ language: 'php', scheme: 'file' }];
    const priority = 1;

    context.subscriptions.push(
      languages.registerDocumentFormatProvider(
        languageSelector,
        new FixerFormattingEditProvider(context, outputChannel),
        priority
      )
    );
  }
}
