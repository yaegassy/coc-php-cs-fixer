import {
  DocumentFormattingEditProvider,
  Range,
  TextDocument,
  TextEdit,
  Uri,
  window,
  workspace,
  ExtensionContext,
  OutputChannel,
} from 'coc.nvim';

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import tmp from 'tmp';

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
  let fixerConfig = extensionConfig.get('config', '');
  const fixerRules = extensionConfig.get('rules', '@PSR12');
  const enableIgnoreEnv = extensionConfig.get<boolean>('enableIgnoreEnv', false);

  // 1. User setting php-cs-fixer
  let toolPath = extensionConfig.get('toolPath', '');
  if (!toolPath) {
    if (fs.existsSync(path.join('vendor', 'bin', 'php-cs-fixer'))) {
      // 2. vendor/bin/php-cs-fixer
      toolPath = path.join('vendor', 'bin', 'php-cs-fixer');
    } else if (fs.existsSync(path.join(context.storagePath, 'php-cs-fixer'))) {
      // 3. builtin php-cs-fixer
      toolPath = path.join(context.storagePath, 'php-cs-fixer');
    } else {
      window.showErrorMessage(`Unable to find the php-cs-fixer tool.`);
      return;
    }
  }

  const text = document.getText(range);
  const args: string[] = [];
  const cwd = Uri.file(workspace.root).fsPath;

  let env: ProcessEnv | undefined = undefined;
  if (enableIgnoreEnv) {
    env = { PHP_CS_FIXER_IGNORE_ENV: '1' };
  }
  const opts = { cwd, env, shell: true };

  args.push(toolPath);
  args.push('fix');

  if (!isUseCache) {
    args.push('--using-cache=no');
  }

  if (isAllowRisky) {
    args.push('--allow-risky=yes');
  }

  if (fixerConfig) {
    if (!path.isAbsolute(fixerConfig)) {
      let currentPath = opts.cwd;
      const triedPaths = [currentPath];
      while (!fs.existsSync(currentPath + path.sep + fixerConfig)) {
        const lastPath = currentPath;
        currentPath = path.dirname(currentPath);
        if (lastPath == currentPath) {
          window.showErrorMessage(`Unable to find ${fixerConfig} file in ${triedPaths.join(', ')}`);
          return '';
        } else {
          triedPaths.push(currentPath);
        }
      }
      fixerConfig = currentPath + path.sep + fixerConfig;
    }

    args.push('--config=' + fixerConfig);
  } else {
    if (
      !fs.existsSync(path.join(workspace.root, '.php-cs-fixer.php')) ||
      !fs.existsSync(path.join(workspace.root, '.php-cs-fixer.dist.php'))
    ) {
      if (fixerRules) {
        args.push(`--rules='${fixerRules}'`);
      }
    }
  }

  const tmpFile = tmp.fileSync();
  fs.writeFileSync(tmpFile.name, text);

  // ---- Output the command to be executed to channel log. ----
  outputChannel.appendLine(`${'#'.repeat(10)} php-cs-fixer\n`);
  outputChannel.appendLine(`Run: php ${args.join(' ')} ${tmpFile.name}`);
  outputChannel.appendLine(`Opts: ${JSON.stringify(opts)}\n`);

  return new Promise(function (resolve) {
    cp.execFile('php', [...args, tmpFile.name], opts, function (err) {
      if (err) {
        tmpFile.removeCallback();

        if (err.code === 'ENOENT') {
          window.showErrorMessage('Unable to find the php-cs-fixer tool.');
          throw err;
        }

        window.showErrorMessage(
          'There was an error while running php-cs-fixer. Check the Developer Tools console for more information.'
        );
        throw err;
      }

      const text = fs.readFileSync(tmpFile.name, 'utf-8');
      tmpFile.removeCallback();

      resolve(text);
    });
  });
}

export function fullDocumentRange(document: TextDocument): Range {
  const lastLineId = document.lineCount - 1;
  const doc = workspace.getDocument(document.uri);

  return Range.create({ character: 0, line: 0 }, { character: doc.getline(lastLineId).length, line: lastLineId });
}

class FixerFormattingEditProvider implements DocumentFormattingEditProvider {
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

export default FixerFormattingEditProvider;
