import { commands, ExtensionContext, Terminal, Uri, window, workspace } from 'coc.nvim';
import { getPintPath, resolveConfigPath, isExistsPintConfigFileFromProjectRoot } from '../common';

let terminal: Terminal | undefined;

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand('php-cs-fixer.pintTest', pintTestCommand(context)));
}

async function runPintTest(context: ExtensionContext, filePath: string) {
  const pintBin = getPintPath(context);

  if (pintBin) {
    if (terminal) {
      if (terminal.bufnr) {
        await workspace.nvim.command(`bd! ${terminal.bufnr}`);
      }
      terminal.dispose();
      terminal = undefined;
    }

    const cwd = workspace.root;
    terminal = await window.createTerminal({ name: 'pint-test', cwd });

    const args: string[] = [];

    const extensionConfig = workspace.getConfiguration('php-cs-fixer');
    const extensionPintConfig = extensionConfig.get('pint.config', '');
    const preset = extensionConfig.get('pint.preset', 'laravel');

    const existsPintConfigFile = isExistsPintConfigFileFromProjectRoot();

    if (extensionPintConfig) {
      const resolvedPintConfig = resolveConfigPath(extensionPintConfig, cwd);
      args.push('--config=' + resolvedPintConfig);
    } else if (existsPintConfigFile) {
      // If the pint.json config file exists for the project root.
      //
      // ...noop
    } else {
      if (preset) {
        args.push(`--preset=${preset}`);
      }
    }

    args.push('--test');
    args.push(`${filePath}`);

    terminal.sendText(`${pintBin} ${args.join(' ')}`);

    const enableSplitRight = workspace
      .getConfiguration('php-cs-fixer')
      .get<boolean>('terminal.enableSplitRight', false);

    if (enableSplitRight) terminal.hide();
    await workspace.nvim.command('stopinsert');
    if (enableSplitRight) {
      await workspace.nvim.command(`vert bel sb ${terminal.bufnr}`);
      await workspace.nvim.command(`wincmd p`);
    }
  } else {
    return window.showErrorMessage('pint not found!');
  }
}

export function pintTestCommand(context: ExtensionContext) {
  return async () => {
    const { document } = await workspace.getCurrentState();
    const filePath = Uri.parse(document.uri).fsPath;

    if (document.languageId !== 'php') {
      return window.showErrorMessage('This file is not a PHP file!');
    }

    runPintTest(context, filePath);
  };
}
