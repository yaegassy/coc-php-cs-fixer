import {
  CodeAction,
  CodeActionContext,
  CodeActionProvider,
  Command,
  Document,
  DocumentSelector,
  ExtensionContext,
  languages,
  Range,
  TextDocument,
  workspace,
} from 'coc.nvim';

export function activate(context: ExtensionContext) {
  const documentSelector: DocumentSelector = [{ language: 'php', scheme: 'file' }];

  if (workspace.getConfiguration('php-cs-fixer').get<boolean>('enableActionProvider', true)) {
    context.subscriptions.push(
      languages.registerCodeActionProvider(documentSelector, new PcfFixCodeActionProvider(), 'php-cs-fixer')
    );
  }
}

export class PcfFixCodeActionProvider implements CodeActionProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext) {
    const codeActions: CodeAction[] = [];
    if (document.languageId !== 'php') return;
    const doc = workspace.getDocument(document.uri);

    if (this.wholeRange(doc, range)) {
      const title = `Run: php-cs-fixer.fix`;
      const command: Command = {
        title: '',
        command: 'php-cs-fixer.fix',
      };

      const action: CodeAction = {
        title,
        command,
      };

      codeActions.push(action);
    }

    return codeActions;
  }

  private wholeRange(doc: Document, range: Range): boolean {
    const whole = Range.create(0, 0, doc.lineCount, 0);
    return (
      whole.start.line === range.start.line &&
      whole.start.character === range.start.character &&
      whole.end.line === range.end.line &&
      whole.end.character === whole.end.character
    );
  }
}
