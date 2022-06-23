# coc-php-cs-fixer

[PHP CS Fixer](https://github.com/FriendsOfPHP/PHP-CS-Fixer) (PHP Coding Standards Fixer) extension for [coc.nvim](https://github.com/neoclide/coc.nvim)

## Install

`:CocInstall coc-php-cs-fixer`

## Note

Detects the `php-cs-fixer` command. They are prioritized in order from the top.

1. `php-cs-fixer.toolPath`
1. `vendor/bin/php-cs-fixer`
1. `php-cs-fixer` retrieved by the download feature (`:CocCommand php-cs-fixer.download`)
    - Mac/Linux: `~/.config/coc/extensions/coc-php-cs-fixer-data/php-cs-fixer`
    - Windows: `~/AppData/Local/coc/extensions/coc-php-cs-fixer-data/php-cs-fixer`

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

- `:CocCommand php-cs-fixer.fix`

### Run from Code Action

**Example key mapping (Code Action related)**:

```vim
nmap <silent> gA <Plug>(coc-codeaction)
```

**Actions**:

Call Code Action with the mapped key.

- `gA`

or from the `call` function.

- `:call CocAction('codeAction')`
  - Choose action: "Run: php-cs-fixer.fix"

### Run formatting from call function

If `php-cs-fixer.enableFormatProvider` is `true` (default: `false`).

- `:call CocAction('format')`

## Precedence of php-cs-fixer config files and options

1. `php-cs-fixer.config` setting for this extension.
2. `.php-cs-fixer.php` or `.php-cs-fixer.dist.php` config file in the workspace (project) root.
3. options-reated settings for this extension. e.g. `php-cs-fixer.rules` and more.

## Configuration options

- `php-cs-fixer.enable`: Enable coc-php-cs-fixer extension, default: `true`
- `php-cs-fixer.toolPath`: The path to the php-cs-fixer tool (Absolute path), default: `""`
- `php-cs-fixer.config`: Path to php-cs-fixer config file (--config), default: `""`
- `php-cs-fixer.useCache`: Use a cache file when fixing files (--using-cache), default: `false`
- `php-cs-fixer.allowRisky`: Determines whether risky rules are allowed (--allow-risky), default: `false`
- `php-cs-fixer.rules`: Rules to use when fixing files (--rules), e.g. `"@PSR12,@Symfony"`, default: `"@PSR12"`
- `php-cs-fixer.enableIgnoreEnv`: Add the environment variable `PHP_CS_FIXER_IGNORE_ENV=1` and run php-cs-fixer, default: `false`
- `php-cs-fixer.downloadMajorVersion`: Specify the major version of php-cs-fixer to download for the extension, valid option `[2, 3]`, default: `3`
- `php-cs-fixer.enableFormatProvider`: Enable format provider, default: `true`
- `php-cs-fixer.enableActionProvider`: Enable codeAction provider, default: `true`

## Commands

- `php-cs-fixer.fix`: Run php-cs-fixer fix
- `php-cs-fixer.download`: Download php-cs-fixer
   - By default, the "v3" series will be downloaded. If you want to download "v2" series, please change the `php-cs-fixer.downloadMajorVersion` setting.

## Code Actions

- `Run: php-cs-fixer.fix`

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
