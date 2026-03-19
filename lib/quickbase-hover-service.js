(function (root, factory) {
    var api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    if (root) {
        root.QuickbaseHoverService = api;
    }
}(this, function () {
    function normalizeName(value) {
        return String(value || '').toLowerCase();
    }

    function displayType(typeName) {
        var normalized = normalizeName(typeName);
        var labels = {
            bool: 'Boolean',
            date: 'Date',
            datetime: 'DateTime',
            duration: 'Duration',
            field: 'Field',
            number: 'Number',
            recordlist: 'RecordList',
            table: 'Table',
            text: 'Text',
            textlist: 'TextList',
            timeofday: 'TimeOfDay',
            user: 'User',
            userlist: 'UserList',
            workdate: 'WorkDate'
        };

        return labels[normalized] || typeName || 'Value';
    }

    function inRange(offset, start, end) {
        return offset >= start && offset < end;
    }

    function cloneArray(values) {
        var result = [];
        var index;

        if (!values || !values.length) {
            return result;
        }

        for (index = 0; index < values.length; index += 1) {
            result.push(values[index]);
        }

        return result;
    }

    function buildDeclarations(text) {
        var declarations = [];
        var pattern = /\bvar\s+([A-Za-z]+)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
        var match;
        var fullText;
        var fullStart;
        var typeText;
        var nameText;
        var typeStart;
        var nameStart;

        while ((match = pattern.exec(text))) {
            fullText = match[0];
            fullStart = match.index;
            typeText = match[1];
            nameText = match[2];
            typeStart = fullStart + fullText.indexOf(typeText);
            nameStart = fullStart + fullText.lastIndexOf(nameText);

            declarations.push({
                keywordStart: fullStart,
                keywordEnd: fullStart + 3,
                type: typeText,
                typeStart: typeStart,
                typeEnd: typeStart + typeText.length,
                name: nameText,
                nameStart: nameStart,
                nameEnd: nameStart + nameText.length
            });
        }

        return declarations;
    }

    function findDeclarationByOffset(declarations, offset) {
        var index;
        var declaration;

        for (index = 0; index < declarations.length; index += 1) {
            declaration = declarations[index];
            if (inRange(offset, declaration.keywordStart, declaration.keywordEnd)) {
                return {
                    declaration: declaration,
                    part: 'keyword'
                };
            }
            if (inRange(offset, declaration.typeStart, declaration.typeEnd)) {
                return {
                    declaration: declaration,
                    part: 'type'
                };
            }
            if (inRange(offset, declaration.nameStart, declaration.nameEnd)) {
                return {
                    declaration: declaration,
                    part: 'name'
                };
            }
        }

        return null;
    }

    function findDeclarationByName(declarations, name, offset) {
        var index;
        var declaration = null;

        for (index = 0; index < declarations.length; index += 1) {
            if (declarations[index].name === name && declarations[index].nameStart <= offset) {
                declaration = declarations[index];
            }
        }

        return declaration;
    }

    function findVariableReference(text, offset) {
        var pattern = /\$[A-Za-z_][A-Za-z0-9_]*/g;
        var match;

        while ((match = pattern.exec(text))) {
            if (inRange(offset, match.index, match.index + match[0].length)) {
                return {
                    text: match[0],
                    name: match[0].slice(1),
                    start: match.index,
                    end: match.index + match[0].length
                };
            }
        }

        return null;
    }

    function findBracketReference(text, offset) {
        var pattern = /\[[^\]\r\n]+\]/g;
        var match;

        while ((match = pattern.exec(text))) {
            if (inRange(offset, match.index, match.index + match[0].length)) {
                return {
                    text: match[0],
                    start: match.index,
                    end: match.index + match[0].length
                };
            }
        }

        return null;
    }

    function findFunctionToken(text, offset, functionCatalog) {
        var pattern = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
        var match;
        var name;
        var start;

        while ((match = pattern.exec(text))) {
            name = match[1];
            start = match.index;
            if (!functionCatalog[normalizeName(name)]) {
                continue;
            }
            if (inRange(offset, start, start + name.length)) {
                return {
                    name: name,
                    start: start,
                    end: start + name.length
                };
            }
        }

        return null;
    }

    function findQueryOperator(text, offset, referenceData) {
        var pattern = /\.([A-Za-z]{2,4})\./g;
        var match;
        var operator;
        var start;

        while ((match = pattern.exec(text))) {
            operator = String(match[1] || '').toUpperCase();
            if (!referenceData.getQueryOperatorMetadata(operator)) {
                continue;
            }
            start = match.index + 1;
            if (inRange(offset, start, start + match[1].length)) {
                return {
                    operator: operator,
                    rawText: match[1],
                    start: start,
                    end: start + match[1].length
                };
            }
        }

        return null;
    }


    function findQuerySpecialValue(text, offset, referenceData) {
        var pattern = /\{\s*('(?:[^']+)'|\d+)\s*\.([A-Za-z]{2,4})\s*\.('(?:today|_curuser_|-?\d+\s+days\s+ago)'|today|_curuser_)\s*\}/gi;
        var match;
        var value;
        var relativeStart;
        var start;
        var metadata;

        while ((match = pattern.exec(text))) {
            value = match[3];
            metadata = referenceData.getQuerySpecialValueMetadata(value);
            if (!metadata) {
                continue;
            }
            relativeStart = match[0].lastIndexOf(value);
            start = match.index + relativeStart;
            if (inRange(offset, start, start + value.length)) {
                return {
                    value: value,
                    start: start,
                    end: start + value.length,
                    metadata: metadata
                };
            }
        }

        return null;
    }

    function findQueryField(text, offset) {
        var pattern = /\{\s*('(?:[^']+)'|\d+)\s*\./g;
        var match;
        var value;
        var relativeStart;
        var start;

        while ((match = pattern.exec(text))) {
            value = match[1];
            relativeStart = match[0].indexOf(value);
            start = match.index + relativeStart;
            if (inRange(offset, start, start + value.length)) {
                return {
                    value: value,
                    start: start,
                    end: start + value.length
                };
            }
        }

        return null;
    }

    function signatureToString(name, signature) {
        var parts = [];
        var index;

        for (index = 0; index < signature.params.length; index += 1) {
            parts.push(displayType(signature.params[index].type));
        }

        if (signature.variadic) {
            if (parts.length) {
                parts[parts.length - 1] = parts[parts.length - 1] + ', ...';
            } else {
                parts.push(displayType(signature.variadicType) + ', ...');
            }
        }

        return name + '(' + parts.join(', ') + ')';
    }

    function buildFunctionHover(entry) {
        var signatures = [];
        var index;

        for (index = 0; index < entry.signatures.length; index += 1) {
            signatures.push(signatureToString(entry.name, entry.signatures[index]));
        }

        return {
            kind: 'function',
            label: entry.name,
            summary: entry.summary || 'Quickbase formula function.',
            signatures: signatures,
            notes: cloneArray(entry.notes),
            docsUrl: entry.docsUrl || 'https://help.quickbase.com/docs/formula-components'
        };
    }

    function getHoverData(text, offset, functionCatalog, referenceData) {
        var declarations = buildDeclarations(text || '');
        var match;
        var metadata;
        var declaration;
        var entry;
        var variableReference;
        var bracketReference;
        var functionToken;
        var queryOperator;
        var querySpecialValue;
        var queryField;

        referenceData = referenceData || {};

        queryOperator = findQueryOperator(text, offset, referenceData);
        if (queryOperator) {
            metadata = referenceData.getQueryOperatorMetadata(queryOperator.operator);
            return {
                start: queryOperator.start,
                end: queryOperator.end,
                kind: 'queryOperator',
                label: queryOperator.operator,
                summary: metadata.summary,
                notes: cloneArray(metadata.notes),
                docsUrl: metadata.docsUrl
            };
        }


        querySpecialValue = findQuerySpecialValue(text, offset, referenceData);
        if (querySpecialValue) {
            metadata = querySpecialValue.metadata || referenceData.getQuerySpecialValueMetadata(querySpecialValue.value);
            return {
                start: querySpecialValue.start,
                end: querySpecialValue.end,
                kind: 'querySpecialValue',
                label: querySpecialValue.value,
                summary: metadata.summary,
                notes: cloneArray(metadata.notes),
                docsUrl: metadata.docsUrl
            };
        }
        queryField = findQueryField(text, offset);
        if (queryField) {
            metadata = referenceData.getSyntaxMetadata('queryField');
            return {
                start: queryField.start,
                end: queryField.end,
                kind: 'queryField',
                label: queryField.value,
                summary: metadata.summary,
                docsUrl: metadata.docsUrl,
                notes: []
            };
        }

        variableReference = findVariableReference(text, offset);
        if (variableReference) {
            declaration = findDeclarationByName(declarations, variableReference.name, variableReference.start);
            metadata = referenceData.getSyntaxMetadata('variableReference');
            return {
                start: variableReference.start,
                end: variableReference.end,
                kind: 'variableReference',
                label: variableReference.text,
                summary: declaration ? ('Declared as ' + displayType(declaration.type) + '.') : metadata.summary,
                notes: [],
                docsUrl: metadata.docsUrl
            };
        }

        match = findDeclarationByOffset(declarations, offset);
        if (match) {
            if (match.part === 'keyword') {
                metadata = referenceData.getSyntaxMetadata('variableKeyword');
                return {
                    start: match.declaration.keywordStart,
                    end: match.declaration.keywordEnd,
                    kind: 'variableKeyword',
                    label: metadata.label,
                    summary: metadata.summary,
                    notes: [],
                    docsUrl: metadata.docsUrl
                };
            }
            if (match.part === 'type') {
                metadata = referenceData.getVariableTypeMetadata(match.declaration.type);
                if (metadata) {
                    return {
                        start: match.declaration.typeStart,
                        end: match.declaration.typeEnd,
                        kind: 'variableType',
                        label: metadata.label,
                        summary: metadata.summary,
                        notes: [],
                        docsUrl: metadata.docsUrl
                    };
                }
            }
            if (match.part === 'name') {
                metadata = referenceData.getSyntaxMetadata('variableReference');
                return {
                    start: match.declaration.nameStart,
                    end: match.declaration.nameEnd,
                    kind: 'variableDeclaration',
                    label: '$' + match.declaration.name,
                    summary: 'Declared as ' + displayType(match.declaration.type) + '.',
                    notes: [],
                    docsUrl: metadata.docsUrl
                };
            }
        }

        functionToken = findFunctionToken(text, offset, functionCatalog || {});
        if (functionToken) {
            entry = functionCatalog[normalizeName(functionToken.name)];
            if (entry) {
                metadata = buildFunctionHover(entry);
                metadata.start = functionToken.start;
                metadata.end = functionToken.end;
                return metadata;
            }
        }

        bracketReference = findBracketReference(text, offset);
        if (bracketReference) {
            metadata = referenceData.getSyntaxMetadata('bracketReference');
            return {
                start: bracketReference.start,
                end: bracketReference.end,
                kind: 'bracketReference',
                label: bracketReference.text,
                summary: metadata.summary,
                notes: [],
                docsUrl: metadata.docsUrl
            };
        }

        return null;
    }

    return {
        getHoverData: getHoverData
    };
}));
