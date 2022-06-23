import {
  CodeAction,
  CodeActionContext,
  CodeActionProvider,
  Command,
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
      languages.registerCodeActionProvider(documentSelector, new FixCodeActionProvider(), 'php-cs-fixer')
    );
  }
}

export class FixCodeActionProvider implements CodeActionProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext) {
    if (document.languageId !== 'php') return;

    const codeActions: CodeAction[] = [];

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

    return codeActions;
  }
}
