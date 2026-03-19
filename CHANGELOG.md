# Change Log
All notable changes to the "quick-base-formula" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2017-06-23
- Initial release

## [0.1.0] - 2026-03-18
- Added highlighting for Quickbase formula-query functions such as `GetRecord()`, `GetRecords()`, `GetFieldValues()`, `Size()`, and `SumValues()`
- Added support for Quickbase API query-string operators including `EX`, `GT`, `HAS`, `WC`, and related operators
- Expanded formula syntax coverage for modern variable types and common operators like `=`, `!=`, `<>`, and `&`
- Updated README and extension metadata to reflect formula and query-string support

## [Unreleased]
- Added live Quickbase diagnostics for duplicate variables, unknown variables, malformed query strings, structural expression errors, and baseline type/function validation
- Query field IDs such as `'6'` inside API query blocks now use a variable-style scope instead of a field-name scope
- Variable declarations now scope `var`, the declared data type, and the variable name independently for more consistent coloring
- Bracketed field and table references such as `[_DBID_PROJECTS]` now use the same scope as variable names
- Added PowerShell/Pester grammar regression tests for query field IDs and variable declarations
- Added sample-based grammar snapshot tests that run against representative `.quickbase` fixtures
