Set-StrictMode -Version Latest

$grammarPath = Join-Path $PSScriptRoot '..\syntaxes\quickbase.tmLanguage.json'
$grammar = Get-Content $grammarPath -Raw | ConvertFrom-Json

Describe 'Quickbase grammar' {
    It 'loads the TextMate grammar JSON' {
        $grammar.scopeName | Should Be 'source.quickbase'
    }

    Context 'API query field IDs and special values' {
        $queryBlockPattern = $grammar.repository.apiQuery.patterns[0]
        $fieldIdPattern = $queryBlockPattern.patterns[0]
        $specialQuotedValuePattern = $queryBlockPattern.patterns[3]
        $specialBareValuePattern = $queryBlockPattern.patterns[4]
        $queryJoinerPattern = $grammar.repository.apiQuery.patterns[3]

        It 'uses a visible block scope for query braces' {
            $queryBlockPattern.beginCaptures.'0'.name | Should Be 'keyword.control.block.quickbase.query'
            $queryBlockPattern.endCaptures.'0'.name | Should Be 'keyword.control.block.quickbase.query'
        }

        It 'uses the string-safe query grammar inside quoted strings' {
            $grammar.repository.strings.patterns[0].include | Should Be '#apiQueryString'
        }

        It 'uses a variable scope for quoted or bare field IDs' {
            $fieldIdPattern.name | Should Be 'variable.other.quickbase.query'
        }

        It 'matches the field ID before the query operator' {
            $sample = '{6.EX.today}'
            $match = [regex]::Match($sample, $fieldIdPattern.match)

            $match.Success | Should Be $true
            $match.Value | Should Be '6'
        }

        It 'matches quoted special query values like today' {
            $sample = "{'13'.EX.'today'}"
            $match = [regex]::Match($sample, $specialQuotedValuePattern.match)

            $specialQuotedValuePattern.name | Should Be 'constant.language.quickbase.query.special'
            $match.Success | Should Be $true
            $match.Value | Should Be "'today'"
        }

        It 'matches relative date inserts like -1 days ago' {
            $sample = "{'13'.EX.'-1 days ago'}"
            $match = [regex]::Match($sample, $specialQuotedValuePattern.match)

            $match.Success | Should Be $true
            $match.Value | Should Be "'-1 days ago'"
        }

        It 'matches bare special query values like today when unquoted' {
            $sample = "{'6'.EX.today}"
            $match = [regex]::Match($sample, $specialBareValuePattern.match)

            $specialBareValuePattern.name | Should Be 'constant.language.quickbase.query.special'
            $match.Success | Should Be $true
            $match.Value | Should Be 'today'
        }

        It 'matches logical joiners between query blocks' {
            $sample = "{'26'.EX.'1'}AND{'11'.EX.'1'}"
            $match = [regex]::Match($sample, $queryJoinerPattern.match)

            $queryJoinerPattern.name | Should Be 'keyword.control.quickbase.query'
            $match.Success | Should Be $true
            $match.Value | Should Be 'AND'
        }
    }

    Context 'variable declarations' {
        $varKeywordPattern = $grammar.repository.storage.patterns[0]
        $bracketReferencePattern = $grammar.repository.variable.patterns[0]
        $variableDeclarationPattern = $grammar.repository.variable.patterns[1]

        It 'gives var a dedicated keyword scope' {
            $varKeywordPattern.name | Should Be 'keyword.control.declaration.quickbase'
            $variableDeclarationPattern.captures.'1'.name | Should Be 'keyword.control.declaration.quickbase'
        }

        It 'captures var, the declared type, and the variable name separately' {
            $sample = 'var Text queryCERS'
            $match = [regex]::Match($sample, $variableDeclarationPattern.match)

            $match.Success | Should Be $true
            $match.Groups[1].Value | Should Be 'var'
            $match.Groups[2].Value | Should Be 'Text'
            $match.Groups[3].Value | Should Be 'queryCERS'
        }

        It 'uses a type-oriented scope for the declared datatype' {
            $variableDeclarationPattern.captures.'2'.name | Should Be 'entity.name.type.quickbase'
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