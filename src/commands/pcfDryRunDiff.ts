import { commands, ExtensionContext, Terminal, Uri, window, workspace } from 'coc.nvim';
import { getPcfPath, isExistsFixerConfigFileFromProjectRoot, resolveConfigPath } from '../common';

interface ProcessEnv {
  [key: string]: string | undefined;
}

let terminal: Terminal | undefined;

export function activate(context: ExtensionContext) {
  context.subscriptions.push(commands.registerCommand('php-cs-fixer.dryRunDiff', pcfDryRunDiffCommand(context)));
}

async function runPcfDryRunDiff(context: ExtensionContext, filePath: string) {
  const pcfBin = getPcfPath(context);

  if (pcfBin) {
    if (terminal) {
      if (terminal.bufnr) {
        await workspace.nvim.command(`bd! ${terminal.bufnr}`);
      }
      terminal.dispose();
      terminal = undefined;
    }

    const extensionConfig = workspace.getConfiguration('php-cs-fixer');
    const isUseCache = extensionConfig.get('useCache', false);
    const isAllowRisky = extensionConfig.get('allowRisky', true);
    const extensionFixerConfig = extensionConfig.get('config', '');
    const fixerRules = extensionConfig.get('rules', '@PSR12');
    const enableIgnoreEnv = extensionConfig.get<boolean>('enableIgnoreEnv', false);

    const existsFixerConfigFile = isExistsFixerConfigFileFromProjectRoot();

    const cwd = workspace.root;
    let env: ProcessEnv | undefined = undefined;
    if (enableIgnoreEnv) {
      env = {
        ...process.env,
        PHP_CS_FIXER_IGNORE_ENV: '1',
      };
    }

    terminal = await window.createTerminal({ name: 'pcf-dry-run-diff', cwd, env });

    const args: string[] = [];

    if (extensionFixerConfig) {
      const resolvedFixerConfig = resolveConfigPath(extensionFixerConfig, cwd);
      args.push('--config=' + resolvedFixerConfig);
    } else if (existsFixerConfigFile) {
      // If the pint.json config file exists for the project root.
      //
      // ...noop
    } else {
      if (!isUseCache) {
        args.push('--using-cache=no');
      }
      if (isAllowRisky) {
        args.push('--allow-risky=yes');
      }
      if (fixerRules) {
        args.push(`--rules='${fixerRules}'`);
      }
    }

    args.push('fix');
    args.push(filePath);
    args.push('--dry-run');
    args.push('--diff');

    terminal.sendText(`${pcfBin} ${args.join(' ')}`);

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
    return window.showErrorMessage('php-cs-fixer not found!');
  }
}

export function pcfDryRunDiffCommand(context: ExtensionContext) {
  return async () => {
    const { document } = await workspace.getCurrentState();
    const filePath = Uri.parse(document.uri).fsPath;

    if (document.languageId !== 'php') {
      return window.showErrorMessage('This file is not a PHP file!');
    }

    runPcfDryRunDiff(context, filePath);
  };
}
