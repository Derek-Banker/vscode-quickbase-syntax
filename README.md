# Quickbase Formula & Query Tools

Highlights and validates Quickbase formulas, formula-query functions, and API query strings.

![screenshot](https://raw.githubusercontent.com/jdklub/vscode-quickbase-formula/master/images/screenshot.png)

## Requirements

Files must have a .quickbase extension

## What's Included

- Formula function highlighting for the legacy built-ins plus newer Quickbase additions like `GetRecords()`, `GetFieldValues()`, `Size()`, `SumValues()`, `Join()`, `Median()`, regex functions, `SHA256()`, and `ToUnixTime()`
- Query-string highlighting for Quickbase API and formula-query expressions such as `"{'6'.EX.'1'}OR{'7'.GT.'5'}"`, including bare values like `today` and `_curuser_`
- Support for newer formula variable types like `TextList` and `RecordList`
- Updated operator coverage for common Quickbase formula syntax such as `=`, `!=`, `<>`, and `&`
- Live diagnostics for duplicate variables, invalid variable names, malformed query strings, regex-pattern literal rules, structural formula errors, and baseline function/type mismatches

## Examples

```quickbase
var RecordList openProjects = GetRecords("{'6'.EX.'In Progress'}", [_DBID_PROJECTS]);
var TextList owners = GetFieldValues($openProjects, 8);

Join($owners, "; ")
```

```quickbase
"{'6'.EX.'1'}OR{'7'.GT.'5'}"
```

## Known Issues

Automated grammar regression tests cover key query and variable patterns, sample-based grammar snapshots cover representative `.quickbase` files, and executable diagnostics fixtures cover the new validator behavior. Field-level type inference and exhaustive Quickbase function semantics are still intentionally conservative.

## Development

Curated Quickbase formula and query documentation notes for validator work live in `docs/quickbase-documentation-notes.md`.

Hover documentation is available for formula-query functions, query operators, variable declarations, and bracketed references.

Run the full grammar test suite from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-Pester .\tests"
```

Refresh the committed grammar snapshots after an intentional grammar change:

```powershell
powershell -ExecutionPolicy Bypass -File .\tests\Invoke-QuickbaseTokenization.ps1 update
```

## Release Notes

### 0.1.0

Refreshes the grammar for newer Quickbase formulas and adds API query-string highlighting.



