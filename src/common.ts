import { ExtensionContext, Range, TextDocument, workspace } from 'coc.nvim';

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
