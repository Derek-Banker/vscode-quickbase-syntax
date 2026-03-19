(function (root, factory) {
    var api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    if (root) {
        root.QuickbaseReference = api;
    }
}(this, function () {
    var FUNCTION_METADATA = {
        avg: {
            summary: 'Returns the average value from a RecordList and field ID.',
            docsUrl: 'https://help.quickbase.com/docs/quickbase-may-2025-release-notes'
        },
        getaccesskey: {
            summary: 'Returns a secure access key value for link-generation scenarios.',
            docsUrl: 'https://help.quickbase.com/hc/en-us/articles/29353956195220-Secure-links',
            notes: [
                'Official help-center coverage for this function is limited; keep this function marked for source confirmation.'
            ]
        },
        getfieldvalues: {
            summary: 'Returns the values from one field across the records in a RecordList.',
            docsUrl: 'https://help.quickbase.com/docs/what-are-formula-queries',
            notes: [
                'Use this with GetRecords() or GetRecord() results.',
                'Quickbase documents this as a core formula-query function.'
            ]
        },
        getrecord: {
            summary: 'Returns a RecordList containing one record by record ID.',
            docsUrl: 'https://help.quickbase.com/docs/what-are-formula-queries'
        },
        getrecordbyuniquefield: {
            summary: 'Returns a RecordList containing one record located by a unique field value.',
            docsUrl: 'https://help.quickbase.com/docs/quickbase-december-2022-release-notes'
        },
        getrecords: {
            summary: 'Returns a RecordList of records that match a Quickbase query string.',
            docsUrl: 'https://help.quickbase.com/docs/build-queries-for-your-formulas',
            queryArgumentIndexes: [0],
            notes: [
                'Query strings should be wrapped in double quotes.',
                'Use AND or OR to combine multiple query blocks.'
            ]
        },
        join: {
            summary: 'Combines a TextList into a single Text value using a delimiter.',
            docsUrl: 'https://help.quickbase.com/hc/en-us/articles/36386041144852-Quickbase-April-2025-Release-Notes'
        },
        max: {
            summary: 'Returns the maximum value, including formula-query aggregate usage on RecordLists.',
            docsUrl: 'https://help.quickbase.com/docs/quickbase-may-2025-release-notes'
        },
        median: {
            summary: 'Returns the median value from a RecordList and field ID.',
            docsUrl: 'https://help.quickbase.com/hc/en-us/articles/36386041144852-Quickbase-April-2025-Release-Notes'
        },
        min: {
            summary: 'Returns the minimum value, including formula-query aggregate usage on RecordLists.',
            docsUrl: 'https://help.quickbase.com/docs/quickbase-may-2025-release-notes'
        },
        regexextract: {
            summary: 'Returns text matched by a regular expression pattern.',
            docsUrl: 'https://help.quickbase.com/hc/en-us/articles/32800503697044-Regex-in-formulas',
            literalArgumentIndexes: [1],
            literalArgumentMessage: 'Regex pattern arguments must be string literals in Quickbase formulas.'
        },
        regexmatch: {
            summary: 'Returns true when the input matches a regular expression pattern.',
            docsUrl: 'https://help.quickbase.com/hc/en-us/articles/32800503697044-Regex-in-formulas',
            literalArgumentIndexes: [1],
            literalArgumentMessage: 'Regex pattern arguments must be string literals in Quickbase formulas.'
        },
        regexreplace: {
            summary: 'Returns text after replacing matches from a regular expression pattern.',
            docsUrl: 'https://help.quickbase.com/hc/en-us/articles/32800503697044-Regex-in-formulas',
            literalArgumentIndexes: [1],
            literalArgumentMessage: 'Regex pattern arguments must be string literals in Quickbase formulas.'
        },
        sha256: {
            summary: 'Returns a SHA-256 hash for the input text.',
            docsUrl: 'https://help.quickbase.com/hc/en-us/articles/29353956195220-Secure-links'
        },
        size: {
            summary: 'Returns the size of a RecordList, TextList, or UserList.',
            docsUrl: 'https://help.quickbase.com/docs/what-are-formula-queries'
        },
        sumvalues: {
            summary: 'Returns the numeric total for one field across the records in a RecordList.',
            docsUrl: 'https://help.quickbase.com/docs/what-are-formula-queries'
        },
        tounixtime: {
            summary: 'Returns the Unix time representation of a Date/Time value.',
            docsUrl: 'https://help.quickbase.com/hc/en-us/articles/29353956195220-Secure-links'
        }
    };

    var QUERY_OPERATOR_METADATA = {
        AF: {
            summary: 'Matches values after the target date.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        BF: {
            summary: 'Matches values before the target date.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        CT: {
            summary: 'Contains the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        EX: {
            summary: 'Matches records where the field is equal to the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        GT: {
            summary: 'Matches values greater than the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        GTE: {
            summary: 'Matches values greater than or equal to the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        HAS: {
            summary: 'Used with List - User and Multi-select Text fields to require specific values.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        IR: {
            summary: 'Matches dates during a relative date range.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        LT: {
            summary: 'Matches values less than the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        LTE: {
            summary: 'Matches values less than or equal to the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        OAF: {
            summary: 'Matches values on or after the target date.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        OBF: {
            summary: 'Matches values on or before the target date.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        SW: {
            summary: 'Matches values that start with the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        TV: {
            summary: 'Matches a field true value, including relationship keys and user values.',
            docsUrl: 'https://help.quickbase.com/docs/build-queries-for-your-formulas',
            notes: [
                'Quickbase recommends TV for user-field comparisons in formula queries.'
            ]
        },
        WC: {
            summary: 'Wildcard match using * and ? characters.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        XCT: {
            summary: 'Does not contain the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        XEX: {
            summary: 'Matches records where the field is not equal to the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        XHAS: {
            summary: 'Used with List - User and Multi-select Text fields to exclude specific values.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        XIR: {
            summary: 'Matches dates not during a relative date range.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        XSW: {
            summary: 'Matches values that do not start with the target value.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        },
        XTV: {
            summary: 'True-value inequality comparison, often used with user fields.',
            docsUrl: 'https://help.quickbase.com/docs/api-doquery'
        }
    };

    var VARIABLE_TYPE_METADATA = {
        bool: {
            label: 'Bool',
            summary: 'Boolean variable type for true or false values.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        },
        date: {
            label: 'Date',
            summary: 'Date variable type.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        },
        datetime: {
            label: 'DateTime',
            summary: 'Date and time variable type.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        },
        duration: {
            label: 'Duration',
            summary: 'Duration variable type.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        },
        number: {
            label: 'Number',
            summary: 'Numeric variable type.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        },
        recordlist: {
            label: 'RecordList',
            summary: 'Intermediate list of records, typically consumed by formula-query functions.',
            docsUrl: 'https://help.quickbase.com/docs/what-are-formula-queries'
        },
        text: {
            label: 'Text',
            summary: 'Text variable type.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        },
        textlist: {
            label: 'TextList',
            summary: 'List of text values, often returned by GetFieldValues().',
            docsUrl: 'https://help.quickbase.com/docs/what-are-formula-queries'
        },
        timeofday: {
            label: 'TimeOfDay',
            summary: 'Time-of-day variable type.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        },
        user: {
            label: 'User',
            summary: 'User variable type.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        },
        workdate: {
            label: 'WorkDate',
            summary: 'WorkDate variable type.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        }
    };

    var SYNTAX_METADATA = {
        bracketReference: {
            label: 'Field or Application Variable',
            summary: 'Square-bracket references resolve a field value or an application variable.',
            docsUrl: 'https://help.quickbase.com/docs/formula-components'
        },
        queryField: {
            label: 'Quickbase Query Field ID',
            summary: 'The first part of a query block identifies the field ID being filtered.',
            docsUrl: 'https://help.quickbase.com/docs/build-queries-for-your-formulas'
        },
        variableKeyword: {
            label: 'var',
            summary: 'Declares a formula variable using `var <type> <name> = <value>;`.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        },
        variableReference: {
            label: 'Formula Variable',
            summary: 'Formula variables are referenced with a leading `$`.',
            docsUrl: 'https://help.quickbase.com/docs/formula-variables'
        }
    };

    function normalizeName(value) {
        return String(value || '').toLowerCase();
    }

    function cloneEntry(entry) {
        var clone = {};
        var key;

        if (!entry) {
            return null;
        }

        for (key in entry) {
            if (entry.hasOwnProperty && !entry.hasOwnProperty(key)) {
                continue;
            }
            clone[key] = entry[key];
        }

        return clone;
    }

    function getFunctionMetadata(name) {
        return cloneEntry(FUNCTION_METADATA[normalizeName(name)]);
    }

    function getQueryOperatorMetadata(name) {
        return cloneEntry(QUERY_OPERATOR_METADATA[String(name || '').toUpperCase()]);
    }

    function getVariableTypeMetadata(name) {
        return cloneEntry(VARIABLE_TYPE_METADATA[normalizeName(name)]);
    }

    function getSyntaxMetadata(name) {
        return cloneEntry(SYNTAX_METADATA[name]);
    }

    return {
        functionMetadata: FUNCTION_METADATA,
        queryOperatorMetadata: QUERY_OPERATOR_METADATA,
        syntaxMetadata: SYNTAX_METADATA,
        variableTypeMetadata: VARIABLE_TYPE_METADATA,
        getFunctionMetadata: getFunctionMetadata,
        getQueryOperatorMetadata: getQueryOperatorMetadata,
        getSyntaxMetadata: getSyntaxMetadata,
        getVariableTypeMetadata: getVariableTypeMetadata
    };
}));
