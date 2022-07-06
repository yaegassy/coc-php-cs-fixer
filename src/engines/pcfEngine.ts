import { ExtensionContext, OutputChannel, Range, TextDocument, Uri, window, workspace } from 'coc.nvim';

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { getPcfPath, isExistsFixerConfigFileFromProjectRoot, resolveConfigPath } from '../common';

interface ProcessEnv {
  [key: string]: string | undefined;
}

export async function doFormat(
  context: ExtensionContext,
  outputChannel: OutputChannel,
  document: TextDocument,
  range?: Range
): Promise<string | undefined> {
  if (document.languageId !== 'php') {
    window.showErrorMessage(`php-cs-fixer.fix cannot run, not a php file`);
    return;
  }

  const filepath = Uri.parse(document.uri).fsPath;
  const filename = path.basename(filepath);

  if (filename === '.php-cs-fixer.php' || filename === '.php-cs-fixer.dist.php') {
    window.showWarningMessage(`php-cs-fixer config file is excluded from the formatting process.`);
    return;
  }

  const extensionConfig = workspace.getConfiguration('php-cs-fixer');

  const isUseCache = extensionConfig.get('useCache', false);
  const isAllowRisky = extensionConfig.get('allowRisky', true);
  const extensionFixerConfig = extensionConfig.get('config', '');
  const fixerRules = extensionConfig.get('rules', '@PSR12');
  const enableIgnoreEnv = extensionConfig.get<boolean>('enableIgnoreEnv', false);

  const toolPath = getPcfPath(context);
  if (!toolPath) {
    window.showErrorMessage(`Unable to find the php-cs-fixer tool.`);
    return;
  }

  const text = document.getText(range);
  const args: string[] = [];
  const cwd = Uri.file(workspace.root).fsPath;

  let env: ProcessEnv | undefined = undefined;
  if (enableIgnoreEnv) {
    env = {
      ...process.env,
      PHP_CS_FIXER_IGNORE_ENV: '1',
    };
  }
  const opts = { cwd, shell: true, env };

  args.push(toolPath);
  args.push('fix');

  const existsFixerConfigFile = isExistsFixerConfigFileFromProjectRoot();

  if (extensionFixerConfig) {
    const resolvedFixerConfig = resolveConfigPath(extensionFixerConfig, opts.cwd);
    args.push('--config=' + resolvedFixerConfig);
  } else if (existsFixerConfigFile) {
    // If the php-cs-fixer config file exists for the project root.
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

  const tmpFile = tmp.fileSync();
  fs.writeFileSync(tmpFile.name, text);

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} php-cs-fixer\n`);
  outputChannel.appendLine(`Run: php ${args.join(' ')} ${tmpFile.name}`);
  outputChannel.appendLine(`Opts: ${JSON.stringify(opts)}`);
  outputChannel.appendLine(`ResolveExtensionConfig: ${extensionFixerConfig ? extensionFixerConfig : 'not setting'}`);
  outputChannel.appendLine(`FixerConfigFile(ProjectRoot): ${existsFixerConfigFile ? 'exist' : 'not exist'}\n`);

  return new Promise(function (resolve) {
    cp.execFile('php', [...args, tmpFile.name], opts, function (err, stdout, stderr) {
      if (err) {
        tmpFile.removeCallback();

        if (err.code === 'ENOENT') {
          window.showErrorMessage('Unable to find the php-cs-fixer tool.');
          throw err;
        }

        outputChannel.appendLine(`==== Err ====\n`);
        outputChannel.appendLine(`Code: ${err.code ? JSON.stringify(err.code) : 'none'}`);
        outputChannel.appendLine(`Message: ${JSON.stringify(err.message)}`);
        outputChannel.appendLine(`Stdout: ${JSON.stringify(stdout)}`);
        outputChannel.appendLine(`Stderr: ${JSON.stringify(stderr)}\n`);
        return;
      }

      const text = fs.readFileSync(tmpFile.name, 'utf-8');
      tmpFile.removeCallback();

      resolve(text);
    });
  });
}
