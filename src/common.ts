import { ExtensionContext, Range, TextDocument, window, workspace } from 'coc.nvim';

import fs from 'fs';
import path from 'path';

export function fullDocumentRange(document: TextDocument): Range {
  const lastLineId = document.lineCount - 1;
  const doc = workspace.getDocument(document.uri);

  return Range.create({ character: 0, line: 0 }, { character: doc.getline(lastLineId).length, line: lastLineId });
}

export function getPcfPath(context: ExtensionContext) {
  // 1. User setting php-cs-fixer
  let toolPath = workspace.getConfiguration('php-cs-fixer').get('toolPath', '');
  if (!toolPath) {
    if (fs.existsSync(path.join(workspace.root, 'vendor', 'bin', 'php-cs-fixer'))) {
      // 2. vendor/bin/php-cs-fixer
      toolPath = path.join(workspace.root, 'vendor', 'bin', 'php-cs-fixer');
    } else if (fs.existsSync(path.join(context.storagePath, 'php-cs-fixer'))) {
      // 3. builtin php-cs-fixer
      toolPath = path.join(context.storagePath, 'php-cs-fixer');
    }
  }

  return toolPath;
}

export function getPintPath(context: ExtensionContext) {
  // 1. User setting pint
  let toolPath = workspace.getConfiguration('php-cs-fixer').get('pint.toolPath', '');
  if (!toolPath) {
    if (fs.existsSync(path.join(workspace.root, 'vendor', 'bin', 'pint'))) {
      // 2. vendor/bin/pint
      toolPath = path.join(workspace.root, 'vendor', 'bin', 'pint');
    } else if (fs.existsSync(path.join(context.storagePath, 'pint'))) {
      // 3. builtin pint
      toolPath = path.join(context.storagePath, 'pint');
    }
  }
  return toolPath;
}

export function resolveConfigPath(configPath: string, cwd: string) {
  if (!path.isAbsolute(configPath)) {
    let currentPath = cwd;
    const triedPaths = [currentPath];
    while (!fs.existsSync(currentPath + path.sep + configPath)) {
      const lastPath = currentPath;
      currentPath = path.dirname(currentPath);
      if (lastPath == currentPath) {
        window.showErrorMessage(`Unable to find ${configPath} file in ${triedPaths.join(', ')}`);
        return '';
      } else {
        triedPaths.push(currentPath);
      }
    }
    configPath = currentPath + path.sep + configPath;
  }
  return configPath;
}

export function isExistsFixerConfigFileFromProjectRoot() {
  return (
    fs.existsSync(path.join(workspace.root, '.php-cs-fixer.php')) ||
    fs.existsSync(path.join(workspace.root, '.php-cs-fixer.dist.php'))
  );
}

export function isExistsPintConfigFileFromProjectRoot() {
  return fs.existsSync(path.join(workspace.root, 'pint.json'));
}
