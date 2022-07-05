import { ExtensionContext, OutputChannel, Range, TextDocument, Uri, window, workspace } from 'coc.nvim';

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';
import { getPintPath } from '../common';

export async function doFormat(
  context: ExtensionContext,
  outputChannel: OutputChannel,
  document: TextDocument,
  range?: Range
): Promise<string | undefined> {
  if (document.languageId !== 'php') {
    window.showErrorMessage(`php-cs-fixer.pint cannot run, not a php file`);
    return;
  }

  const extensionConfig = workspace.getConfiguration('php-cs-fixer');
  let extensionPintConfig = extensionConfig.get('pint.config', '');
  const preset = extensionConfig.get('pint.preset', 'laravel');

  const toolPath = getPintPath(context);
  if (!toolPath) {
    window.showErrorMessage(`Unable to find the pint tool.`);
    return;
  }

  const text = document.getText(range);
  const args: string[] = [];
  const cwd = Uri.file(workspace.root).fsPath;

  const opts = { cwd, shell: true };

  args.push(toolPath);

  const existsPintConfigFile = isExistsPintConfigFileFromProjectRoot();

  if (extensionPintConfig) {
    if (!path.isAbsolute(extensionPintConfig)) {
      let currentPath = opts.cwd;
      const triedPaths = [currentPath];
      while (!fs.existsSync(currentPath + path.sep + extensionPintConfig)) {
        const lastPath = currentPath;
        currentPath = path.dirname(currentPath);
        if (lastPath == currentPath) {
          window.showErrorMessage(`Unable to find ${extensionPintConfig} file in ${triedPaths.join(', ')}`);
          return '';
        } else {
          triedPaths.push(currentPath);
        }
      }
      extensionPintConfig = currentPath + path.sep + extensionPintConfig;
    }
    args.push('--config=' + extensionPintConfig);
  } else if (existsPintConfigFile) {
    // If the pint.json config file exists for the project root.
    //
    // ...noop
  } else {
    if (preset) {
      args.push(`--preset=${preset}`);
    }
  }

  const tmpFile = tmp.fileSync();
  fs.writeFileSync(tmpFile.name, text);

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} pint\n`);
  outputChannel.appendLine(`Run: php ${args.join(' ')} ${tmpFile.name}`);
  outputChannel.appendLine(`Opts: ${JSON.stringify(opts)}\n`);

  return new Promise(function (resolve) {
    cp.execFile('php', [...args, tmpFile.name], opts, function (err) {
      if (err) {
        tmpFile.removeCallback();

        if (err.code === 'ENOENT') {
          window.showErrorMessage('Unable to find the pint tool.');
          throw err;
        }

        outputChannel.appendLine(`Err: ${JSON.stringify(err.message)}\n`);
        return;
      }

      const text = fs.readFileSync(tmpFile.name, 'utf-8');
      tmpFile.removeCallback();

      resolve(text);
    });
  });
}

function isExistsPintConfigFileFromProjectRoot() {
  return fs.existsSync(path.join(workspace.root, 'pint.json'));
}
