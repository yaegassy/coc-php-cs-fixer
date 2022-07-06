# coc-php-cs-fixer

[PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer) (PHP Coding Standards Fixer) and [Laravel Pint](https://github.com/laravel/pint) extension for [coc.nvim](https://github.com/neoclide/coc.nvim)

## Install

`:CocInstall coc-php-cs-fixer`

## Features

`php-cs-fixer` and `laravel/pint` are supported.

- Formatter
- Command
- Code Action
- Status Bar
- `pint.json` Auto Completion and JSON validation
- Downloader

## Note

The formatter tool used is `php-cs-fixer` by default. If you want to use `laravel/pint`, change the `php-cs-fixer.activateTool` setting in `coc-settings.json`.

```json
{
  "php-cs-fixer.activateTool": "pint"
}
```

- [DEMO](https://github.com/yaegassy/coc-php-cs-fixer/pull/7#issue-1293669659)

---

Detects the `php-cs-fixer` or `pint` tool. They are prioritized in order from the top.

1. `php-cs-fixer.toolPath` or `php-cs-fixer.pint.toolPath`
1. `vendor/bin/php-cs-fixer` or `vendor/bin/pint`
1. `php-cs-fixer` or `pint` retrieved by the download feature (`:CocCommand php-cs-fixer.download` or `php-cs-fixer.pintDownload`)
   - **php-cs-fixer**:
     - Mac/Linux: `~/.config/coc/extensions/coc-php-cs-fixer-data/php-cs-fixer`
     - Windows: `~/AppData/Local/coc/extensions/coc-php-cs-fixer-data/php-cs-fixer`
   - **pint**:
     - Mac/Linux: `~/.config/coc/extensions/coc-php-cs-fixer-data/pint`
     - Windows: `~/AppData/Local/coc/extensions/coc-php-cs-fixer-data/pint`

If "1" and "2" above are not detected, the download feature will be executed (The prompt will be displayed)

## Usage

`coc-php-cs-fixer` can be executed in multiple ways.

### Auto run when saving a file

Add the settings to `coc-settings.json`.

```jsonc
{
  "coc.preferences.formatOnSaveFiletypes": [
    "php"
  ]
}
```

### Run from CocCommand

- If the `php-cs-fixer.activateTool` setting is `php-cs-fixer`
  - `:CocCommand php-cs-fixer.fix`
- If the `php-cs-fixer.activateTool` setting is `pint`
  - `:CocCommand php-cs-fixer.pintFix`

### Run formatting from call function

- `:call CocAction('format')`

### Run codeAction from call function

- `:call CocAction('codeAction')`
  - If the `php-cs-fixer.activateTool` setting is `php-cs-fixer`
    - Choose action: `"Run: php-cs-fixer.fix"`
  - If the `php-cs-fixer.activateTool` setting is `pint`
    - Choose action: `"Run: php-cs-fixer.pintFix"`

## Precedence of "php-cs-fixer" and "laravel/pint" configuration files and options

### php-cs-fixer

1. `php-cs-fixer.config` setting for this extension.
2. `.php-cs-fixer.php` or `.php-cs-fixer.dist.php` config file in the workspace (project) root.
3. options-reated settings for this extension. e.g. `php-cs-fixer.rules` and more.

### pint

1. `php-cs-fixer.pint.config` setting for this extension.
2. `pint.json` config file in the workspace (project) root.
3. options-reated settings for this extension. `php-cs-fixer.pint.preset`.

## Configuration options

- `php-cs-fixer.enable`: Enable coc-php-cs-fixer extension, default: `true`
- `php-cs-fixer.activateTool`: Formatter tool to be used, valid option `["php-cs-fixer", "pint"]`, default: `"php-cs-fixer"`
- `php-cs-fixer.toolPath`: The path to the php-cs-fixer tool, default: `""`
- `php-cs-fixer.config`: Path to php-cs-fixer config file (--config), default: `""`
- `php-cs-fixer.useCache`: Use a cache file when fixing files (--using-cache), default: `false`
- `php-cs-fixer.allowRisky`: Determines whether risky rules are allowed (--allow-risky), default: `false`
- `php-cs-fixer.rules`: Rules to use when fixing files (--rules), e.g. `"@PSR12,@Symfony"`, default: `"@PSR12"`
- `php-cs-fixer.enableIgnoreEnv`: Add the environment variable `PHP_CS_FIXER_IGNORE_ENV=1` and run php-cs-fixer, default: `false`
- `php-cs-fixer.pint.toolPath`: The path to the pint tool, default: `""`
- `php-cs-fixer.pint.config`: Path to `pint.json` config file (`--config`), default: `""`
- `php-cs-fixer.pint.preset`: Presets define a set of rules that can be used to fix code style issues in your code (`--preset`), valid option `["laravel", "psr12", "symfony"]`, default: `"laravel"`
- `php-cs-fixer.downloadCheckOnStartup`: If `php-cs-fixer` or `pint` is not present at startup, run the built-in download. The tool to be downloaded will follow the `php-cs-fixer.activateTool` configuration, default: `true`
- `php-cs-fixer.downloadMajorVersion`: Specify the major version of php-cs-fixer to download for the extension, valid option `[2, 3]`, default: `3`
- `php-cs-fixer.enableFormatProvider`: Enable format provider, default: `true`
- `php-cs-fixer.enableActionProvider`: Enable codeAction provider, default: `true`
- `php-cs-fixer.terminal.enableSplitRight`: Use vertical belowright for dryRunDiff and pintTest terminal window, default: `false`

## Commands

- `php-cs-fixer.fix`: Run php-cs-fixer fix
- `php-cs-fixer.dryRunDiff`: Run php-cs-fixer fix with `--dry-run` and `--diff` in a terminal window | [DEMO](https://github.com/yaegassy/coc-php-cs-fixer/pull/8)
- `php-cs-fixer.pintFix`: Run pint
- `php-cs-fixer.pintTest`: Run pint with `--test` in a terminal window | [DEMO](https://github.com/yaegassy/coc-php-cs-fixer/pull/9#issue-1295053515)
- `php-cs-fixer.download`: Download php-cs-fixer
   - By default, the "v3" series will be downloaded. If you want to download "v2" series, please change the `php-cs-fixer.downloadMajorVersion` setting.
- `php-cs-fixer.pintDownload`: Download pint
- `php-cs-fixer.showOutput`: Show php-cs-fixer output channel

## Code Actions

- `Run: php-cs-fixer.fix`
- `Run: php-cs-fixer.pintFix`

## Thanks

- <https://github.com/FriendsOfPHP/PHP-CS-Fixer>
- <https://github.com/laravel/pint>
- <https://github.com/mlocati/php-cs-fixer-configurator>
- <https://github.com/open-southeners/vscode-laravel-pint>

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
