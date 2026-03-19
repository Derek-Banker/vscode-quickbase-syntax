Set-StrictMode -Version Latest

$grammarPath = Join-Path $PSScriptRoot '..\syntaxes\quickbase.tmLanguage.json'
$grammar = Get-Content $grammarPath -Raw | ConvertFrom-Json

Describe 'Quickbase grammar' {
    It 'loads the TextMate grammar JSON' {
        $grammar.scopeName | Should Be 'source.quickbase'
    }

    Context 'API query field IDs' {
        $queryBlockPattern = $grammar.repository.apiQuery.patterns[0]
        $fieldIdPattern = $queryBlockPattern.patterns[0]

        It 'uses a variable scope for quoted field IDs' {
            $fieldIdPattern.name | Should Be 'variable.other.quickbase.query'
        }

        It 'matches the quoted field ID before the query operator' {
            $sample = "{'6'.EX.'1'}"
            $match = [regex]::Match($sample, $fieldIdPattern.match)

            $match.Success | Should Be $true
            $match.Value | Should Be "'6'"
        }
    }

    Context 'variable declarations' {
        $varKeywordPattern = $grammar.repository.storage.patterns[0]
        $bracketReferencePattern = $grammar.repository.variable.patterns[0]
        $variableDeclarationPattern = $grammar.repository.variable.patterns[1]

        It 'gives var a dedicated scope' {
            $varKeywordPattern.name | Should Be 'storage.type.var.quickbase'
            $variableDeclarationPattern.captures.'1'.name | Should Be 'storage.type.var.quickbase'
        }

        It 'captures var, the declared type, and the variable name separately' {
            $sample = 'var Text queryCERS'
            $match = [regex]::Match($sample, $variableDeclarationPattern.match)

            $match.Success | Should Be $true
            $match.Groups[1].Value | Should Be 'var'
            $match.Groups[2].Value | Should Be 'Text'
            $match.Groups[3].Value | Should Be 'queryCERS'
        }

        It 'keeps the datatype and variable name on their own scopes' {
            $variableDeclarationPattern.captures.'2'.name | Should Be 'storage.modifier.quickbase'
            $variableDeclarationPattern.captures.'3'.name | Should Be 'variable.other.quickbase'
        }

        It 'scopes bracketed field and table references like variable names' {
            $sample = '[_DBID_RECERTIFICATIONS___RECERTS]'
            $match = [regex]::Match($sample, $bracketReferencePattern.match)

            $bracketReferencePattern.name | Should Be 'variable.other.quickbase'
            $match.Success | Should Be $true
            $match.Value | Should Be '[_DBID_RECERTIFICATIONS___RECERTS]'
        }
    }
}
