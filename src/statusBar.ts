import { events, ExtensionContext, window, workspace } from 'coc.nvim';

export async function activate(context: ExtensionContext) {
  const statusBar = window.createStatusBarItem(99);

  updateStatusBar();

  events.on(
    'BufEnter',
    async () => {
      updateStatusBar();
    },
    null,
    context.subscriptions
  );

  async function updateStatusBar() {
    const { document } = await workspace.getCurrentState();
    if (!workspace.getConfiguration('php-cs-fixer').get('enable')) {
      statusBar.hide();
    } else if (['php'].includes(document.languageId)) {
      const activateTool = workspace.getConfiguration('php-cs-fixer').get<string>('activateTool', 'php-cs-fixer');
      if (activateTool === 'php-cs-fixer') {
        statusBar.text = 'PhpCsFixer';
        statusBar.show();
      } else if (activateTool === 'pint') {
        statusBar.text = 'Pint';
        statusBar.show();
      }
    } else {
      statusBar.hide();
    }
  }
}
