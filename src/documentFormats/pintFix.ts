import {
  DocumentFormattingEditProvider,
  DocumentSelector,
  ExtensionContext,
  languages,
  OutputChannel,
  Range,
  TextDocument,
  TextEdit,
  workspace,
} from 'coc.nvim';
import { fullDocumentRange } from '../common';
import { doFormat } from '../engines/pintEngine';

export function activate(context: ExtensionContext, outputChannel: OutputChannel) {
  if (workspace.getConfiguration('php-cs-fixer').get<boolean>('enableFormatProvider', true)) {
    const languageSelector: DocumentSelector = [{ language: 'php', scheme: 'file' }];
    const priority = 1;

    context.subscriptions.push(
      languages.registerDocumentFormatProvider(
        languageSelector,
        new PintFixFormattingEditProvider(context, outputChannel),
        priority
      )
    );
  }
}

class PintFixFormattingEditProvider implements DocumentFormattingEditProvider {
  public _context: ExtensionContext;
  public _outputChannel: OutputChannel;

  constructor(context: ExtensionContext, outputChannel: OutputChannel) {
    this._context = context;
    this._outputChannel = outputChannel;
  }

  public provideDocumentFormattingEdits(document: TextDocument): Promise<TextEdit[]> {
    return this._provideEdits(document, undefined);
  }

  private async _provideEdits(document: TextDocument, range?: Range): Promise<TextEdit[]> {
    const code = await doFormat(this._context, this._outputChannel, document, range);
    if (!code) return [];
    if (!range) {
      range = fullDocumentRange(document);
    }
    return [TextEdit.replace(range, code)];
  }
}
