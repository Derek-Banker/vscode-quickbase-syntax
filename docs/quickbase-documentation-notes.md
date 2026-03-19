# Quickbase Documentation Notes

Updated: 2026-03-19

Purpose: capture the current official Quickbase formula and query documentation we should use as the source of truth for syntax, validation, and future completion/hover work in this extension.

## Official sources reviewed

- Formula components: https://help.quickbase.com/docs/formula-components
- Formula variables: https://help.quickbase.com/docs/formula-variables
- Creating and using application variables: https://help.quickbase.com/variables
- What are formula queries?: https://help.quickbase.com/docs/what-are-formula-queries
- Build queries for your formulas: https://help.quickbase.com/docs/build-queries-for-your-formulas
- Formula queries: field types, type conversions, and variables: https://help.quickbase.com/docs/formula-queries-field-types-type-conversions-and-variables
- Formula queries and performance: https://help.quickbase.com/docs/formula-queries-and-performance
- Find field, record IDs, and table aliases: https://help.quickbase.com/docs/find-field-record-ids-and-table-aliases
- API_DoQuery: https://help.quickbase.com/docs/api-doquery
- Regex in formulas: https://help.quickbase.com/hc/en-us/articles/32800503697044-Regex-in-formulas
- Quickbase December 2022 release notes: https://help.quickbase.com/docs/quickbase-december-2022-release-notes
- Quickbase January 2025 release notes: https://help.quickbase.com/docs/quickbase-january-2025-release-notes
- Quickbase April 2025 release notes: https://help.quickbase.com/hc/en-us/articles/36386041144852-Quickbase-April-2025-Release-Notes
- Quickbase May 2025 release notes: https://help.quickbase.com/docs/quickbase-may-2025-release-notes
- Secure links: https://help.quickbase.com/hc/en-us/articles/29353956195220-Secure-links

## Local seed files reviewed

- `C:\CFS - Derek\Reference Documents\QuickBase Formula Documentation.csv`
- `C:\CFS - Derek\Refrence Documents\QuickBase Formula Examples.csv`

The documentation CSV still looks useful as a seed list of functions and signatures, but it appears to predate several newer formula-query additions and newer text/query helpers.

## Stable syntax rules to support

### Formula variables

- Declaration format: `var <type> <name> = <formula snippet>;`
- Official declared types currently documented:
  - `bool`
  - `number`
  - `text`
  - `textlist`
  - `date`
  - `datetime`
  - `duration`
  - `timeofday`
  - `workdate`
  - `user`
  - `recordlist`
- Variables are referenced with `$name`.
- Variable names must contain letters only. No numbers, spaces, or special characters are documented.
- `var recordlist` is specifically called out for formula queries.

### Field references and application variables

- Field references use square brackets, for example `[Manager]`.
- Application variables also use bracket syntax, for example `[Project Start Date]`.
- Application variables are always treated as text unless they are converted with a formula function such as `ToDate()`.

### Formula queries

- Official formula-query functions:
  - `GetRecord()`
  - `GetRecordByUniqueField()`
  - `GetRecords()`
  - `GetFieldValues()`
  - `SumValues()`
  - `Size()`
- Query strings in formula-query functions should be enclosed in double quotes.
- A query block uses `{field.operator.value}` structure.
- Single quotes around the field ID are optional in formula queries.
- Comparison operators must be uppercase.
- Multiple query blocks can be combined with `AND` or `OR`.
- To inject a field value into a query string, concatenate with `&`, for example:
  - `"{'5'.EX.'" & [Manager name] & "'}"`
- For user-field queries, prefer `TV` and wrap the field reference in `UserToID()` or `UserToEmail()`.
- When querying another table, Quickbase recommends using the table alias instead of the raw DBID.

## Query operators confirmed from API_DoQuery

- `CT`: contains
- `XCT`: does not contain
- `WC`: wildcard search with `*` and `?`
- `HAS`: contains values in List - User or Multi-select Text fields
- `XHAS`: does not contain values in List - User or Multi-select Text fields
- `EX`: equals
- `TV`: true value comparison, including user fields and relationship keys
- `XTV`: not equal using true-value comparison
- `XEX`: not equal
- `SW`: starts with
- `XSW`: does not start with
- `BF`: before
- `OBF`: on or before
- `AF`: after
- `OAF`: on or after
- `IR`: is during a relative date range
- `XIR`: is not during a relative date range
- `LT`: less than
- `LTE`: less than or equal
- `GT`: greater than
- `GTE`: greater than or equal

## Type and structure guidance from the docs

- `GetFieldValues()` can be used directly in Formula - Multi-select text fields.
- `SumValues()` and `Size()` can be used directly in Formula - Numeric fields.
- To use formula-query results in other field types, Quickbase expects either:
  - a conversion function such as `ToText()`, or
  - additional formula logic around the query result.
- `recordlist` values are intermediate values. They are normally consumed by `GetFieldValues()`, `SumValues()`, `Size()`, or converted to text.
- Regex support is documented as:
  - `RegexExtract()`
  - `RegexReplace()`
  - `RegexMatch()`
- Regex patterns must be written directly in the formula call and cannot come from a field or variable.

## Performance guidance worth validating against later

- Prefer table relationships when a simple relationship or summary field already solves the problem.
- Avoid filtering, sorting, or grouping reports on formula-query fields when possible.
- Avoid making formula-query fields searchable unless needed.
- Start queries with the most selective comparison when possible.
- Prefer exact matches over broader operators like contains or wildcard matching when performance matters.

## Gaps between the local CSV and current docs

The local CSV is still a strong starting point, but the official docs confirm newer capabilities that should drive future validator coverage:

- `GetRecordByUniqueField()` is officially documented in the Quickbase December 2022 release notes and formula-query docs, but it is not present in the local documentation CSV.
- `RegexExtract()`, `RegexReplace()`, and `RegexMatch()` are officially documented in current help content and January 2025 release notes, but they are not present in the local documentation CSV.
- `Join()` and `Median()` are called out in the April 2025 release notes and should be treated as current syntax.
- Aggregate functions on formula-query results such as `Avg()`, `Min()`, `Max()`, and `Median()` are called out in the May 2025 release notes.
- `SHA256()` and `ToUnixTime()` are evidenced in the Secure links help article and should be treated as live formula syntax.
- `GetAccessKey()` appears in the snippet catalog, but I did not confirm a current official help-center page for it during this pass, so it should stay marked as "needs source confirmation."

## Useful follow-up work

- Normalize the local CSV into structured JSON so validator signatures can be generated instead of hand-maintained.
- Add a curated metadata layer for formula-query functions and query operators from the official docs.
- Tighten variable-name validation to match the documented "letters only" rule.
- Add diagnostics for unsupported use of formula-query return types in incompatible field contexts once field metadata is available.
