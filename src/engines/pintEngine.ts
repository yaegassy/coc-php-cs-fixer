import { ExtensionContext, OutputChannel, Range, TextDocument, Uri, window, workspace } from 'coc.nvim';

import cp from 'child_process';
import fs from 'fs';
import tmp from 'tmp';
import { getPintPath, isExistsPintConfigFileFromProjectRoot, resolveConfigPath } from '../common';

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
  const extensionPintConfig = extensionConfig.get('pint.config', '');
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
    const resolvedPintConfig = resolveConfigPath(extensionPintConfig, opts.cwd);
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

  const tmpFile = tmp.fileSync();
  fs.writeFileSync(tmpFile.name, text);

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} pint\n`);
  outputChannel.appendLine(`Run: php ${args.join(' ')} ${tmpFile.name}`);
  outputChannel.appendLine(`Opts: ${JSON.stringify(opts)}`);
  outputChannel.appendLine(`ResolveExtensionConfig: ${extensionPintConfig ? extensionPintConfig : 'not setting'}`);
  outputChannel.appendLine(`PintConfigFile(ProjectRoot): ${existsPintConfigFile ? 'exist' : 'not exist'}\n`);

  return new Promise(function (resolve) {
    cp.execFile('php', [...args, tmpFile.name], opts, function (err, stdout, stderr) {
      if (err) {
        tmpFile.removeCallback();

        if (err.code === 'ENOENT') {
          window.showErrorMessage('Unable to find the pint tool.');
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
