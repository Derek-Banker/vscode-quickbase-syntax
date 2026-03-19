# Quickbase Formula & Query Tools

VS Code language support for Quickbase formulas and query expressions. This extension adds syntax highlighting, snippets, hover documentation, and live validation for `.quickbase` files so formula work is easier to read, write, and review.

![screenshot](https://raw.githubusercontent.com/jdklub/vscode-quickbase-formula/master/images/screenshot.png)

## Requirements

Use the `.quickbase` file extension for Quickbase formulas, formula-query expressions, and standalone query text.

## Features

- Syntax highlighting for Quickbase formulas, comments, operators, variables, variable declarations, bracketed field and table references, and modern Quickbase functions
- Query-aware highlighting for API query strings and formula-query expressions, including operators like `EX`, `GT`, `TV`, `WC`, logical joiners like `AND` and `OR`, and special values such as `'today'` and `'_curuser_'`
- Snippets for Quickbase functions, variables, and common authoring patterns
- Live diagnostics for structural formula errors, malformed query expressions, duplicate variables, invalid variable names, unknown variable types, unknown functions, regex-pattern issues, and baseline argument/type mismatches
- Hover documentation for formula-query functions, query operators, variable declarations, variable types, bracketed references, and special query values
- Grammar, hover, and validation regression coverage through PowerShell/Pester tests and committed tokenization snapshots

## Examples

```quickbase
var RecordList openProjects = GetRecords("{'6'.EX.'In Progress'}", [_DBID_PROJECTS]);
var TextList owners = GetFieldValues($openProjects, 8);

Join($owners, "; ")
```

```quickbase
var Text todayQuery = "{'13'.EX.'today'}AND{'20'.TV.'_curuser_'}";
```

## Current Scope

The extension is intentionally lightweight and editor-focused. It does not execute formulas or connect to Quickbase metadata, so field-level inference and exhaustive function semantics are still conservative.

## Development

Reference notes gathered from current Quickbase documentation live in `docs/quickbase-documentation-notes.md`.

Run the full test suite from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-Pester .\tests"
```

Refresh committed tokenization snapshots after an intentional grammar change:

```powershell
powershell -ExecutionPolicy Bypass -File .\tests\Invoke-QuickbaseTokenization.ps1 update
```

## Attribution

This project builds on the original `vscode-quickbase-formula` extension and its contributors.

- Justin Klubnik created the original extension, published the initial Quickbase syntax support, and remains the named copyright holder in `LICENSE.txt`
- Chris Pliakas contributed later grammar, snippet, scope, and branding updates that expanded the extension's Quickbase coverage
- Derek Banker led the current modernization work, including updated formula and query support, diagnostics, hover documentation, and automated regression testing

## License

MIT-style license. See `LICENSE.txt`.
