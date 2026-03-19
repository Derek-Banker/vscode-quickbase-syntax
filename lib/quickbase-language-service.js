(function (root, factory) {
    var api = factory();

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    }

    if (root) {
        root.QuickbaseLanguageService = api;
    }
}(this, function () {
    var QUERY_OPERATORS = {
        CT: true,
        XCT: true,
        WC: true,
        HAS: true,
        XHAS: true,
        EX: true,
        TV: true,
        XTV: true,
        XEX: true,
        SW: true,
        XSW: true,
        BF: true,
        OBF: true,
        AF: true,
        OAF: true,
        IR: true,
        XIR: true,
        LT: true,
        LTE: true,
        GT: true,
        GTE: true
    };

    var VARIABLE_TYPES = {
        bool: true,
        number: true,
        text: true,
        textlist: true,
        date: true,
        datetime: true,
        duration: true,
        timeofday: true,
        workdate: true,
        user: true,
        userlist: true,
        recordlist: true
    };

    var MANUAL_SIGNATURES = {
        'if': {
            special: 'if'
        },
        'case': {
            special: 'case'
        },
        'includes': {
            signatures: [
                {
                    params: [{ type: 'userlist' }, { type: 'userlist' }],
                    minArgs: 2,
                    maxArgs: Infinity,
                    variadic: true,
                    variadicType: 'userlist'
                }
            ],
            returnStrategy: 'bool'
        }
    };

    var RETURN_STRATEGIES = {
        abs: 'same-as-first',
        adjustmonth: 'date',
        adjustyear: 'date',
        appid: 'text',
        average: 'same-as-first',
        avg: 'number',
        base64decode: 'text',
        base64encode: 'text',
        begins: 'bool',
        ceil: 'same-as-first',
        contains: 'bool',
        count: 'number',
        date: 'date',
        day: 'number',
        dayofweek: 'number',
        dayofyear: 'number',
        days: 'duration',
        dbid: 'text',
        ends: 'bool',
        exp: 'number',
        firstdayofmonth: 'date',
        firstdayofperiod: 'date',
        firstdayofweek: 'date',
        firstdayofyear: 'date',
        floor: 'same-as-first',
        frac: 'number',
        getaccesskey: 'text',
        getfieldproperty: 'text',
        getfieldvalues: 'textlist',
        getrecord: 'recordlist',
        getrecordbyuniquefield: 'recordlist',
        getrecords: 'recordlist',
        htmltotext: 'text',
        hour: 'number',
        hours: 'duration',
        includes: 'bool',
        int: 'number',
        isleapday: 'bool',
        isleapyear: 'bool',
        isnull: 'bool',
        isuseremail: 'bool',
        isweekday: 'bool',
        join: 'text',
        lastdayofmonth: 'date',
        lastdayofperiod: 'date',
        lastdayofweek: 'date',
        lastdayofyear: 'date',
        left: 'text',
        length: 'number',
        list: 'text',
        ln: 'number',
        log: 'number',
        lower: 'text',
        max: 'same-as-first',
        median: 'number',
        mid: 'text',
        min: 'same-as-first',
        minute: 'number',
        minutes: 'duration',
        mod: 'same-as-first',
        month: 'number',
        msecond: 'number',
        mseconds: 'duration',
        nameofmonth: 'text',
        nextdayofweek: 'date',
        notleft: 'text',
        notright: 'text',
        now: 'datetime',
        nz: 'same-as-first',
        padleft: 'text',
        padright: 'text',
        part: 'text',
        prevdayofweek: 'date',
        pv: 'number',
        qb32decode: 'text',
        qb32encode: 'text',
        regexextract: 'text',
        regexmatch: 'bool',
        regexreplace: 'text',
        rem: 'number',
        right: 'text',
        round: 'number',
        searchandreplace: 'text',
        second: 'number',
        seconds: 'duration',
        sha256: 'text',
        size: 'number',
        split: 'textlist',
        sqrt: 'number',
        sum: 'same-as-first',
        sumvalues: 'number',
        toboolean: 'bool',
        todate: 'date',
        toformattedtext: 'text',
        tohours: 'number',
        tominutes: 'number',
        tomseconds: 'number',
        tonumber: 'number',
        toseconds: 'number',
        totext: 'text',
        totimeofday: 'timeofday',
        totimestamp: 'datetime',
        tounixtime: 'number',
        touser: 'user',
        touserlist: 'userlist',
        toweekdayn: 'date',
        toweekdayp: 'date',
        toweeks: 'number',
        toworkdate: 'workdate',
        trim: 'text',
        upper: 'text',
        urlencode: 'text',
        urlroot: 'text',
        user: 'user',
        userlisttoemails: 'textlist',
        userlisttoids: 'textlist',
        userlisttonames: 'textlist',
        userroles: 'textlist',
        usertoemail: 'text',
        usertoid: 'number',
        usertoname: 'text',
        weekdayadd: 'date',
        weekdaysub: 'date',
        weekofyear: 'number',
        weeks: 'duration',
        workdayadd: 'workdate',
        year: 'number'
    };

    function trim(value) {
        return String(value || '').replace(/^\s+|\s+$/g, '');
    }

    function startsWith(value, search) {
        return String(value).slice(0, search.length) === search;
    }

    function isDigit(character) {
        return character >= '0' && character <= '9';
    }

    function isIdentifierStart(character) {
        return !!character && /[A-Za-z_]/.test(character);
    }

    function isIdentifierPart(character) {
        return !!character && /[A-Za-z0-9_]/.test(character);
    }

    function createLineStarts(text) {
        var lineStarts = [0];
        var index;

        for (index = 0; index < text.length; index += 1) {
            if (text.charAt(index) === '\n') {
                lineStarts.push(index + 1);
            }
        }

        return lineStarts;
    }

    function positionAt(lineStarts, offset) {
        var safeOffset = offset;
        var low = 0;
        var high = lineStarts.length - 1;
        var mid;

        if (safeOffset < 0) {
            safeOffset = 0;
        }

        while (low <= high) {
            mid = Math.floor((low + high) / 2);
            if (lineStarts[mid] > safeOffset) {
                high = mid - 1;
            } else if (mid + 1 < lineStarts.length && lineStarts[mid + 1] <= safeOffset) {
                low = mid + 1;
            } else {
                return {
                    line: mid,
                    character: safeOffset - lineStarts[mid]
                };
            }
        }

        return {
            line: 0,
            character: safeOffset
        };
    }

    function normalizeTypeName(typeName) {
        var normalized = trim(typeName).toLowerCase();

        normalized = normalized.replace(/[<>]/g, '');
        normalized = normalized.replace(/\s+/g, '');
        normalized = normalized.replace(/date\/time/g, 'datetime');

        if (normalized === 'boolean') {
            return 'bool';
        }
        if (normalized === 'time') {
            return 'timeofday';
        }
        if (normalized === 'table' || normalized === 'alias') {
            return 'table';
        }
        if (normalized === 'field') {
            return 'field';
        }
        if (normalized === 'record') {
            return 'recordlist';
        }
        if (normalized === 'null' || normalized === 'empty') {
            return 'null';
        }
        if (normalized === 'any') {
            return 'any';
        }

        return normalized;
    }

    function displayType(typeName) {
        var normalized = normalizeTypeName(typeName);
        var labels = {
            any: 'Any',
            bool: 'Boolean',
            number: 'Number',
            text: 'Text',
            textlist: 'TextList',
            date: 'Date',
            datetime: 'DateTime',
            duration: 'Duration',
            timeofday: 'TimeOfDay',
            workdate: 'WorkDate',
            user: 'User',
            userlist: 'UserList',
            recordlist: 'RecordList',
            table: 'Table',
            field: 'Field',
            'null': 'Null',
            reference: 'Reference',
            unknown: 'Unknown'
        };

        return labels[normalized] || typeName;
    }

    function normalizeFunctionName(name) {
        var compact = trim(name).replace(/\s+/g, ' ');
        var duplicateMatch = /^([A-Za-z_][A-Za-z0-9_]*)\s+\1$/i.exec(compact);

        if (duplicateMatch) {
            compact = duplicateMatch[1];
        }

        return compact;
    }

    function splitParameters(parameterText) {
        var rawParts = parameterText.split(',');
        var parts = [];
        var index;

        for (index = 0; index < rawParts.length; index += 1) {
            parts.push(trim(rawParts[index]));
        }

        return parts;
    }

    function parseParameter(part, previousType) {
        var value = trim(part);
        var variadic = false;
        var match;
        var typeName;

        if (!value) {
            return null;
        }

        if (value === '...') {
            return {
                type: previousType || 'any',
                variadic: true,
                placeholder: true
            };
        }

        if (/\.\.\.?$/.test(value)) {
            variadic = true;
            value = trim(value.replace(/\.\.\.?$/, ''));
        }

        match = /^<([^>]+)>/.exec(value);
        if (match) {
            typeName = match[1];
        } else {
            match = /^([A-Za-z]+(?:\/[A-Za-z]+)?)/.exec(value);
            typeName = match ? match[1] : 'any';
        }

        return {
            type: normalizeTypeName(typeName),
            variadic: variadic
        };
    }

    function createSignature(parameters) {
        var signature = {
            params: [],
            minArgs: 0,
            maxArgs: 0,
            variadic: false,
            variadicType: 'any'
        };
        var index;
        var parameter;
        var previousType = 'any';

        for (index = 0; index < parameters.length; index += 1) {
            parameter = parseParameter(parameters[index], previousType);
            if (!parameter) {
                continue;
            }

            if (parameter.placeholder && parameter.variadic) {
                signature.variadic = true;
                signature.variadicType = previousType || 'any';
                continue;
            }

            signature.params.push({ type: parameter.type });
            signature.minArgs += 1;
            signature.maxArgs += 1;
            previousType = parameter.type;

            if (parameter.variadic) {
                signature.variadic = true;
                signature.variadicType = parameter.type;
                signature.maxArgs = Infinity;
            }
        }

        return signature;
    }

    function parseSignatureKey(key) {
        var match = /^(.*?)\s*\((.*)\)$/.exec(key);
        var functionName;
        var parameterText;
        var signature;

        if (!match) {
            return null;
        }

        functionName = normalizeFunctionName(match[1]);
        parameterText = trim(match[2]);

        if (!functionName) {
            return null;
        }

        signature = createSignature(parameterText ? splitParameters(parameterText) : []);

        return {
            name: functionName,
            lowerName: functionName.toLowerCase(),
            signature: signature
        };
    }

    function ensureCatalogEntry(catalog, name) {
        if (!catalog[name]) {
            catalog[name] = {
                name: name,
                signatures: [],
                returnStrategy: RETURN_STRATEGIES[name] || null,
                special: null
            };
        }

        return catalog[name];
    }

    function buildFunctionCatalog(snippets) {
        var catalog = {};
        var key;
        var parsed;
        var entry;
        var override;
        var signatureIndex;

        for (key in snippets) {
            if (snippets.hasOwnProperty && !snippets.hasOwnProperty(key)) {
                continue;
            }

            parsed = parseSignatureKey(key);
            if (!parsed) {
                continue;
            }

            entry = ensureCatalogEntry(catalog, parsed.lowerName);
            entry.name = parsed.name;
            entry.signatures.push(parsed.signature);
        }

        for (key in MANUAL_SIGNATURES) {
            if (MANUAL_SIGNATURES.hasOwnProperty && !MANUAL_SIGNATURES.hasOwnProperty(key)) {
                continue;
            }

            override = MANUAL_SIGNATURES[key];
            entry = ensureCatalogEntry(catalog, key);
            if (override.special) {
                entry.special = override.special;
            }
            if (override.returnStrategy) {
                entry.returnStrategy = override.returnStrategy;
            }
            if (override.signatures) {
                entry.signatures = [];
                for (signatureIndex = 0; signatureIndex < override.signatures.length; signatureIndex += 1) {
                    entry.signatures.push(override.signatures[signatureIndex]);
                }
            }
        }

        return catalog;
    }

    function createDiagnostic(code, severity, message, start, end, lineStarts) {
        var startPosition = positionAt(lineStarts, start);
        var endPosition = positionAt(lineStarts, end < start ? start : end);

        return {
            code: code,
            severity: severity,
            message: message,
            start: start,
            end: end < start ? start : end,
            startLine: startPosition.line,
            startCharacter: startPosition.character,
            endLine: endPosition.line,
            endCharacter: endPosition.character
        };
    }

    function Tokenizer(text, lineStarts) {
        this.text = text || '';
        this.length = this.text.length;
        this.offset = 0;
        this.lineStarts = lineStarts;
        this.diagnostics = [];
    }

    Tokenizer.prototype.peek = function (distance) {
        var safeDistance = typeof distance === 'number' ? distance : 0;
        var index = this.offset + safeDistance;

        if (index < 0 || index >= this.length) {
            return '';
        }

        return this.text.charAt(index);
    };

    Tokenizer.prototype.advance = function () {
        this.offset += 1;
    };

    Tokenizer.prototype.skipTrivia = function () {
        var character;

        while (this.offset < this.length) {
            character = this.peek(0);

            if (character === '/' && this.peek(1) === '/') {
                while (this.offset < this.length && this.peek(0) !== '\n') {
                    this.advance();
                }
                continue;
            }

            if (/\s/.test(character)) {
                this.advance();
                continue;
            }

            break;
        }
    };

    Tokenizer.prototype.createToken = function (type, value, start, end, extras) {
        var token = {
            type: type,
            value: value,
            start: start,
            end: end
        };
        var key;

        if (extras) {
            for (key in extras) {
                if (extras.hasOwnProperty && !extras.hasOwnProperty(key)) {
                    continue;
                }
                token[key] = extras[key];
            }
        }

        return token;
    };

    Tokenizer.prototype.readNumber = function () {
        var start = this.offset;
        var sawDecimal = false;

        while (this.offset < this.length) {
            if (isDigit(this.peek(0))) {
                this.advance();
                continue;
            }

            if (this.peek(0) === '.' && !sawDecimal && isDigit(this.peek(1))) {
                sawDecimal = true;
                this.advance();
                continue;
            }

            break;
        }

        return this.createToken('number', this.text.slice(start, this.offset), start, this.offset);
    };

    Tokenizer.prototype.readIdentifier = function () {
        var start = this.offset;
        var value;
        var lowerValue;

        this.advance();
        while (isIdentifierPart(this.peek(0))) {
            this.advance();
        }

        value = this.text.slice(start, this.offset);
        lowerValue = value.toLowerCase();

        if (lowerValue === 'var') {
            return this.createToken('keyword', lowerValue, start, this.offset);
        }

        if (lowerValue === 'and' || lowerValue === 'or' || lowerValue === 'not') {
            return this.createToken('operatorKeyword', lowerValue, start, this.offset);
        }

        if (lowerValue === 'true' || lowerValue === 'false') {
            return this.createToken('boolean', lowerValue, start, this.offset);
        }

        if (lowerValue === 'null') {
            return this.createToken('null', lowerValue, start, this.offset);
        }

        return this.createToken('identifier', value, start, this.offset);
    };

    Tokenizer.prototype.readVariableReference = function () {
        var start = this.offset;

        this.advance();
        if (!isIdentifierStart(this.peek(0))) {
            this.diagnostics.push(createDiagnostic('QB001', 'error', 'Expected a variable name after $.', start, this.offset, this.lineStarts));
            return this.createToken('unknown', '$', start, this.offset);
        }

        while (isIdentifierPart(this.peek(0))) {
            this.advance();
        }

        return this.createToken('variableReference', this.text.slice(start, this.offset), start, this.offset);
    };

    Tokenizer.prototype.readBracketReference = function () {
        var start = this.offset;
        var closed = false;

        this.advance();
        while (this.offset < this.length) {
            if (this.peek(0) === ']') {
                this.advance();
                closed = true;
                break;
            }
            if (this.peek(0) === '\n') {
                break;
            }
            this.advance();
        }

        if (!closed) {
            this.diagnostics.push(createDiagnostic('QB003', 'error', 'Unterminated bracketed reference.', start, this.offset, this.lineStarts));
        }

        return this.createToken('bracketReference', this.text.slice(start, this.offset), start, this.offset);
    };

    Tokenizer.prototype.readString = function () {
        var start = this.offset;
        var innerStart;
        var closed = false;

        this.advance();
        innerStart = this.offset;

        while (this.offset < this.length) {
            if (this.peek(0) === '\\') {
                this.advance();
                if (this.offset < this.length) {
                    this.advance();
                }
                continue;
            }

            if (this.peek(0) === '"') {
                closed = true;
                break;
            }

            if (this.peek(0) === '\n') {
                break;
            }

            this.advance();
        }

        if (closed) {
            this.advance();
        } else {
            this.diagnostics.push(createDiagnostic('QB002', 'error', 'Unterminated string literal.', start, this.offset, this.lineStarts));
        }

        return this.createToken('string', this.text.slice(innerStart, closed ? this.offset - 1 : this.offset), start, this.offset, {
            raw: this.text.slice(start, this.offset),
            contentStart: innerStart,
            terminated: closed
        });
    };

    Tokenizer.prototype.nextToken = function () {
        var start;
        var twoCharacterOperator;
        var character;

        this.skipTrivia();

        if (this.offset >= this.length) {
            return this.createToken('eof', '', this.offset, this.offset);
        }

        start = this.offset;
        character = this.peek(0);
        twoCharacterOperator = character + this.peek(1);

        if (character === '$') {
            return this.readVariableReference();
        }

        if (character === '[') {
            return this.readBracketReference();
        }

        if (character === '"') {
            return this.readString();
        }

        if (isDigit(character)) {
            return this.readNumber();
        }

        if (isIdentifierStart(character)) {
            return this.readIdentifier();
        }

        if (twoCharacterOperator === '>=' || twoCharacterOperator === '<=' || twoCharacterOperator === '!=' || twoCharacterOperator === '<>') {
            this.advance();
            this.advance();
            return this.createToken('operator', twoCharacterOperator, start, this.offset);
        }

        if (character === '=' || character === '>' || character === '<' || character === '+' || character === '-' || character === '*' || character === '/' || character === '&' || character === '^') {
            this.advance();
            return this.createToken('operator', character, start, this.offset);
        }

        if (character === '(') {
            this.advance();
            return this.createToken('lparen', character, start, this.offset);
        }
        if (character === ')') {
            this.advance();
            return this.createToken('rparen', character, start, this.offset);
        }
        if (character === ',') {
            this.advance();
            return this.createToken('comma', character, start, this.offset);
        }
        if (character === ';') {
            this.advance();
            return this.createToken('semicolon', character, start, this.offset);
        }

        this.advance();
        this.diagnostics.push(createDiagnostic('QB001', 'error', 'Unexpected character "' + character + '".', start, this.offset, this.lineStarts));
        return this.createToken('unknown', character, start, this.offset);
    };

    function tokenize(text, lineStarts) {
        var tokenizer = new Tokenizer(text, lineStarts);
        var tokens = [];
        var token;

        do {
            token = tokenizer.nextToken();
            tokens.push(token);
        } while (token.type !== 'eof');

        return {
            tokens: tokens,
            diagnostics: tokenizer.diagnostics
        };
    }

    function Parser(tokens, lineStarts) {
        this.tokens = tokens;
        this.lineStarts = lineStarts;
        this.index = 0;
        this.diagnostics = [];
    }

    Parser.prototype.current = function () {
        return this.tokens[this.index];
    };

    Parser.prototype.previous = function () {
        return this.tokens[this.index - 1] || this.tokens[0];
    };

    Parser.prototype.isAtEnd = function () {
        return this.current().type === 'eof';
    };

    Parser.prototype.advance = function () {
        if (!this.isAtEnd()) {
            this.index += 1;
        }
        return this.previous();
    };

    Parser.prototype.check = function (type, value) {
        var token = this.current();

        if (!token) {
            return false;
        }
        if (token.type !== type) {
            return false;
        }
        if (typeof value !== 'undefined' && token.value !== value) {
            return false;
        }
        return true;
    };

    Parser.prototype.match = function (type, value) {
        if (this.check(type, value)) {
            this.advance();
            return true;
        }
        return false;
    };

    Parser.prototype.consume = function (type, message) {
        var token = this.current();

        if (this.check(type)) {
            return this.advance();
        }

        this.diagnostics.push(createDiagnostic('QB001', 'error', message, token.start, token.end, this.lineStarts));
        return {
            type: type,
            value: '',
            start: token.start,
            end: token.end
        };
    };

    Parser.prototype.parseDocument = function () {
        var statements = [];
        var statement;

        while (!this.isAtEnd()) {
            if (this.match('semicolon')) {
                continue;
            }

            if (this.check('keyword', 'var')) {
                statement = this.parseVariableDeclaration();
            } else {
                statement = this.parseExpressionStatement();
            }

            statements.push(statement);

            if (this.match('semicolon')) {
                continue;
            }

            if (!this.isAtEnd() && !this.check('rparen') && !this.check('comma')) {
                this.diagnostics.push(createDiagnostic('QB001', 'error', 'Expected a semicolon or the end of the formula.', this.current().start, this.current().end, this.lineStarts));
                this.advance();
            }
        }

        return {
            statements: statements,
            diagnostics: this.diagnostics
        };
    };

    Parser.prototype.parseVariableDeclaration = function () {
        var varToken = this.advance();
        var typeToken = this.consume('identifier', 'Expected a Quickbase data type after var.');
        var nameToken = this.consume('identifier', 'Expected a variable name after the declared type.');
        var initializer = null;

        if (this.match('operator', '=')) {
            initializer = this.parseExpression();
        } else {
            this.diagnostics.push(createDiagnostic('QB001', 'error', 'Expected = followed by a variable initializer.', this.current().start, this.current().end, this.lineStarts));
        }

        return {
            type: 'VariableDeclaration',
            keyword: varToken,
            declaredType: typeToken.value,
            name: nameToken.value,
            nameStart: nameToken.start,
            nameEnd: nameToken.end,
            start: varToken.start,
            end: initializer ? initializer.end : nameToken.end,
            initializer: initializer
        };
    };

    Parser.prototype.parseExpressionStatement = function () {
        var expression = this.parseExpression();

        return {
            type: 'ExpressionStatement',
            expression: expression,
            start: expression.start,
            end: expression.end
        };
    };

    Parser.prototype.parseExpression = function () {
        return this.parseBinaryExpression(1);
    };

    Parser.prototype.parseBinaryExpression = function (minimumPrecedence) {
        var left = this.parseUnaryExpression();
        var token;
        var precedence;
        var operator;
        var right;

        while (!this.isAtEnd()) {
            token = this.current();
            precedence = getPrecedence(token);
            if (precedence < minimumPrecedence) {
                break;
            }

            this.advance();
            operator = token.value;
            right = this.parseBinaryExpression(precedence + 1);
            left = {
                type: 'BinaryExpression',
                operator: operator,
                left: left,
                right: right,
                start: left.start,
                end: right.end
            };
        }

        return left;
    };

    Parser.prototype.parseUnaryExpression = function () {
        var token = this.current();
        var expression;

        if ((token.type === 'operatorKeyword' && token.value === 'not') || (token.type === 'operator' && token.value === '-')) {
            this.advance();
            expression = this.parseUnaryExpression();
            return {
                type: 'UnaryExpression',
                operator: token.value,
                expression: expression,
                start: token.start,
                end: expression.end
            };
        }

        return this.parsePrimaryExpression();
    };

    Parser.prototype.parsePrimaryExpression = function () {
        var token = this.current();
        var expression;
        var args;
        var nameToken;

        if (this.match('number')) {
            return {
                type: 'NumberLiteral',
                value: Number(token.value),
                raw: token.value,
                start: token.start,
                end: token.end
            };
        }

        if (this.match('string')) {
            return {
                type: 'StringLiteral',
                value: token.value,
                raw: token.raw,
                contentStart: token.contentStart,
                terminated: token.terminated,
                start: token.start,
                end: token.end
            };
        }

        if (this.match('boolean')) {
            return {
                type: 'BooleanLiteral',
                value: token.value === 'true',
                start: token.start,
                end: token.end
            };
        }

        if (this.match('null')) {
            return {
                type: 'NullLiteral',
                value: null,
                start: token.start,
                end: token.end
            };
        }

        if (this.match('variableReference')) {
            return {
                type: 'VariableReference',
                name: token.value.slice(1),
                raw: token.value,
                start: token.start,
                end: token.end
            };
        }

        if (this.match('bracketReference')) {
            return {
                type: 'BracketReference',
                name: token.value,
                start: token.start,
                end: token.end
            };
        }

        if (this.match('identifier')) {
            nameToken = token;
            if (this.match('lparen')) {
                args = this.parseArguments();
                return {
                    type: 'CallExpression',
                    callee: nameToken.value,
                    arguments: args.arguments,
                    start: nameToken.start,
                    end: args.end
                };
            }

            return {
                type: 'Identifier',
                name: nameToken.value,
                start: nameToken.start,
                end: nameToken.end
            };
        }

        if (this.match('lparen')) {
            expression = this.parseExpression();
            token = this.consume('rparen', 'Expected ) to close the parenthesized expression.');
            return {
                type: 'ParenthesizedExpression',
                expression: expression,
                start: expression.start,
                end: token.end
            };
        }

        this.diagnostics.push(createDiagnostic('QB001', 'error', 'Expected an expression.', token.start, token.end, this.lineStarts));
        this.advance();
        return {
            type: 'ErrorExpression',
            start: token.start,
            end: token.end
        };
    };

    Parser.prototype.parseArguments = function () {
        var args = [];
        var closingToken;

        if (this.match('rparen')) {
            return {
                arguments: args,
                end: this.previous().end
            };
        }

        do {
            args.push(this.parseExpression());
        } while (this.match('comma'));

        closingToken = this.consume('rparen', 'Expected ) to close the function call.');
        return {
            arguments: args,
            end: closingToken.end
        };
    };

    function getPrecedence(token) {
        if (!token) {
            return 0;
        }
        if (token.type === 'operatorKeyword') {
            if (token.value === 'or') {
                return 1;
            }
            if (token.value === 'and') {
                return 2;
            }
        }
        if (token.type === 'operator') {
            if (token.value === '=' || token.value === '!=' || token.value === '<>' || token.value === '>' || token.value === '<' || token.value === '>=' || token.value === '<=') {
                return 3;
            }
            if (token.value === '&') {
                return 4;
            }
            if (token.value === '+' || token.value === '-') {
                return 5;
            }
            if (token.value === '*' || token.value === '/' || token.value === '^') {
                return 6;
            }
        }
        return 0;
    }

    function collectDiagnostics(result, diagnostics) {
        var index;

        for (index = 0; index < diagnostics.length; index += 1) {
            result.push(diagnostics[index]);
        }

        result.sort(function (left, right) {
            if (left.start !== right.start) {
                return left.start - right.start;
            }
            if (left.end !== right.end) {
                return left.end - right.end;
            }
            return left.code < right.code ? -1 : 1;
        });
    }

    function isKnownVariableType(typeName) {
        return !!VARIABLE_TYPES[normalizeTypeName(typeName)];
    }

    function canAssignType(targetType, sourceType) {
        var target = normalizeTypeName(targetType);
        var source = normalizeTypeName(sourceType);

        if (target === 'any' || source === 'any' || source === 'unknown') {
            return true;
        }
        if (source === 'null') {
            return true;
        }
        if (target === source) {
            return true;
        }

        return false;
    }

    function isNumberLike(typeName) {
        var normalized = normalizeTypeName(typeName);
        return normalized === 'number' || normalized === 'duration';
    }

    function signatureAllowsCount(signature, argCount) {
        if (signature.variadic) {
            return argCount >= signature.minArgs;
        }
        return argCount >= signature.minArgs && argCount <= signature.maxArgs;
    }

    function getExpectedTypeForArgument(signature, index) {
        if (index < signature.params.length) {
            return signature.params[index].type;
        }
        if (signature.variadic) {
            return signature.variadicType || 'any';
        }
        return null;
    }

    function getArgumentTypes(args, state) {
        var argTypes = [];
        var index;

        for (index = 0; index < args.length; index += 1) {
            argTypes.push(inferExpressionType(args[index], state));
        }

        return argTypes;
    }

    function findQueryBlock(text, startIndex) {
        var index = startIndex + 1;
        var placeholderEnd;

        if (!startsWith(text.slice(startIndex), '{\'')) {
            return null;
        }

        while (index < text.length) {
            if (text.slice(index, index + 2) === '{{') {
                placeholderEnd = text.indexOf('}}', index + 2);
                if (placeholderEnd < 0) {
                    return null;
                }
                index = placeholderEnd + 2;
                continue;
            }

            if (text.charAt(index) === '}') {
                return {
                    start: startIndex,
                    end: index + 1,
                    text: text.slice(startIndex, index + 1)
                };
            }

            index += 1;
        }

        return null;
    }

    function isValidQueryValue(valueText) {
        if (!valueText) {
            return false;
        }
        if (/^'[^']*'$/.test(valueText)) {
            return true;
        }
        if (/^"[^"]*"$/.test(valueText)) {
            return true;
        }
        if (/^\{\{[^{}]+\}\}$/.test(valueText)) {
            return true;
        }
        return false;
    }

    function validateQueryBlock(block, stringNode, state) {
        var queryText = block.text;
        var innerText = trim(queryText.slice(1, queryText.length - 1));
        var firstDot = innerText.indexOf('.');
        var secondDot;
        var fieldText;
        var operatorText;
        var valueText;
        var sourceStart = stringNode.contentStart + block.start;
        var operatorStart;

        if (firstDot < 0) {
            state.diagnostics.push(createDiagnostic('QB108', 'error', 'Malformed Quickbase query block.', sourceStart, sourceStart + queryText.length, state.lineStarts));
            return;
        }

        secondDot = innerText.indexOf('.', firstDot + 1);
        if (secondDot < 0) {
            state.diagnostics.push(createDiagnostic('QB108', 'error', 'Malformed Quickbase query block.', sourceStart, sourceStart + queryText.length, state.lineStarts));
            return;
        }

        fieldText = trim(innerText.slice(0, firstDot));
        operatorText = trim(innerText.slice(firstDot + 1, secondDot)).toUpperCase();
        valueText = trim(innerText.slice(secondDot + 1));

        if (!/^'[^']+'$/.test(fieldText)) {
            state.diagnostics.push(createDiagnostic('QB108', 'error', 'Malformed Quickbase query field reference.', sourceStart, sourceStart + queryText.length, state.lineStarts));
        }

        operatorStart = sourceStart + 1 + firstDot + 1;
        if (!QUERY_OPERATORS[operatorText]) {
            state.diagnostics.push(createDiagnostic('QB107', 'error', 'Invalid Quickbase query operator "' + operatorText + '".', operatorStart, operatorStart + operatorText.length, state.lineStarts));
        }

        if (!isValidQueryValue(valueText)) {
            state.diagnostics.push(createDiagnostic('QB108', 'error', 'Malformed Quickbase query value.', sourceStart, sourceStart + queryText.length, state.lineStarts));
        }
    }

    function validateQueryStrings(stringNode, state) {
        var text = stringNode.value || '';
        var index;
        var block;
        var scanIndex = 0;

        while (scanIndex < text.length) {
            index = text.indexOf('{', scanIndex);
            if (index < 0) {
                break;
            }

            if (text.charAt(index + 1) === '{') {
                scanIndex = index + 2;
                continue;
            }

            block = findQueryBlock(text, index);
            if (!block) {
                state.diagnostics.push(createDiagnostic('QB108', 'error', 'Unclosed Quickbase query block.', stringNode.contentStart + index, stringNode.contentStart + text.length, state.lineStarts));
                break;
            }

            validateQueryBlock(block, stringNode, state);
            scanIndex = block.end;
        }
    }

    function mergeTypes(types) {
        var merged = 'unknown';
        var index;
        var normalized;

        for (index = 0; index < types.length; index += 1) {
            normalized = normalizeTypeName(types[index]);
            if (normalized === 'unknown' || normalized === 'null') {
                continue;
            }
            if (merged === 'unknown') {
                merged = normalized;
                continue;
            }
            if (merged !== normalized) {
                return 'unknown';
            }
        }

        return merged;
    }

    function inferReturnType(functionName, argTypes) {
        var strategy = RETURN_STRATEGIES[functionName] || 'unknown';
        var resultTypes;
        var index;
        var typeName;

        if (strategy === 'same-as-first') {
            return argTypes.length ? argTypes[0] : 'unknown';
        }

        if (strategy !== 'unknown') {
            return strategy;
        }

        if (functionName === 'if') {
            resultTypes = [];
            for (index = 1; index < argTypes.length; index += 2) {
                resultTypes.push(argTypes[index]);
            }
            if (argTypes.length % 2 === 1) {
                resultTypes.push(argTypes[argTypes.length - 1]);
            }
            return mergeTypes(resultTypes);
        }

        if (functionName === 'case') {
            resultTypes = [];
            for (index = 2; index < argTypes.length; index += 2) {
                resultTypes.push(argTypes[index]);
            }
            if (argTypes.length % 2 === 0) {
                resultTypes.push(argTypes[argTypes.length - 1]);
            }
            return mergeTypes(resultTypes);
        }

        for (index = 0; index < argTypes.length; index += 1) {
            typeName = normalizeTypeName(argTypes[index]);
            if (typeName !== 'unknown' && typeName !== 'null') {
                return typeName;
            }
        }

        return 'unknown';
    }

    function validateIfCall(node, argTypes, state) {
        var index;
        var resultTypes = [];

        if (argTypes.length < 2) {
            state.diagnostics.push(createDiagnostic('QB103', 'warning', 'If() expects at least a condition and a result.', node.start, node.end, state.lineStarts));
            return 'unknown';
        }

        for (index = 0; index < argTypes.length - 1; index += 2) {
            if (normalizeTypeName(argTypes[index]) !== 'bool' && normalizeTypeName(argTypes[index]) !== 'unknown') {
                state.diagnostics.push(createDiagnostic('QB104', 'warning', 'If() condition arguments must be Boolean.', node.arguments[index].start, node.arguments[index].end, state.lineStarts));
            }
            if (index + 1 < argTypes.length) {
                resultTypes.push(argTypes[index + 1]);
            }
        }

        if (argTypes.length % 2 === 1) {
            resultTypes.push(argTypes[argTypes.length - 1]);
        }

        return mergeTypes(resultTypes);
    }

    function validateCaseCall(node, argTypes, state) {
        var selectorType;
        var index;
        var resultTypes = [];

        if (argTypes.length < 3) {
            state.diagnostics.push(createDiagnostic('QB103', 'warning', 'Case() expects a selector, one match value, and one result.', node.start, node.end, state.lineStarts));
            return 'unknown';
        }

        selectorType = normalizeTypeName(argTypes[0]);
        for (index = 1; index < argTypes.length - 1; index += 2) {
            if (selectorType !== 'unknown' && normalizeTypeName(argTypes[index]) !== selectorType && normalizeTypeName(argTypes[index]) !== 'unknown') {
                state.diagnostics.push(createDiagnostic('QB104', 'warning', 'Case() comparison values must match the selector type.', node.arguments[index].start, node.arguments[index].end, state.lineStarts));
            }
            if (index + 1 < argTypes.length) {
                resultTypes.push(argTypes[index + 1]);
            }
        }

        if (argTypes.length % 2 === 0) {
            resultTypes.push(argTypes[argTypes.length - 1]);
        }

        return mergeTypes(resultTypes);
    }

    function isTypeCompatible(expectedType, actualType, node) {
        var expected = normalizeTypeName(expectedType);
        var actual = normalizeTypeName(actualType);

        if (!expected || expected === 'any' || actual === 'any' || actual === 'unknown' || actual === 'null') {
            return true;
        }
        if (expected === actual) {
            return true;
        }
        if ((expected === 'table' || expected === 'field') && node.type === 'BracketReference') {
            return true;
        }

        return false;
    }

    function validateGenericCall(node, entry, argTypes, state) {
        var arityMatches = [];
        var signatureIndex;
        var argIndex;
        var signature;
        var firstMismatch = null;
        var expectedType;
        var mismatch;

        for (signatureIndex = 0; signatureIndex < entry.signatures.length; signatureIndex += 1) {
            signature = entry.signatures[signatureIndex];
            if (signatureAllowsCount(signature, node.arguments.length)) {
                arityMatches.push(signature);
            }
        }

        if (!arityMatches.length) {
            state.diagnostics.push(createDiagnostic('QB103', 'warning', 'No overload of ' + entry.name + ' accepts ' + node.arguments.length + ' argument(s).', node.start, node.end, state.lineStarts));
            return inferReturnType(node.callee.toLowerCase(), argTypes);
        }

        for (signatureIndex = 0; signatureIndex < arityMatches.length; signatureIndex += 1) {
            signature = arityMatches[signatureIndex];
            mismatch = null;
            for (argIndex = 0; argIndex < node.arguments.length; argIndex += 1) {
                expectedType = getExpectedTypeForArgument(signature, argIndex);
                if (!isTypeCompatible(expectedType, argTypes[argIndex], node.arguments[argIndex])) {
                    mismatch = {
                        index: argIndex,
                        expectedType: expectedType,
                        actualType: argTypes[argIndex]
                    };
                    break;
                }
            }

            if (!mismatch) {
                return inferReturnType(node.callee.toLowerCase(), argTypes);
            }

            if (!firstMismatch) {
                firstMismatch = mismatch;
            }
        }

        if (firstMismatch) {
            state.diagnostics.push(createDiagnostic(
                'QB104',
                'warning',
                entry.name + '() argument ' + (firstMismatch.index + 1) + ' expects ' + displayType(firstMismatch.expectedType) + ' but received ' + displayType(firstMismatch.actualType) + '.',
                node.arguments[firstMismatch.index].start,
                node.arguments[firstMismatch.index].end,
                state.lineStarts
            ));
        }

        return inferReturnType(node.callee.toLowerCase(), argTypes);
    }

    function inferExpressionType(node, state) {
        var leftType;
        var rightType;
        var entry;
        var argTypes;
        var normalizedType;

        if (!node) {
            return 'unknown';
        }

        switch (node.type) {
        case 'NumberLiteral':
            return 'number';
        case 'StringLiteral':
            validateQueryStrings(node, state);
            return 'text';
        case 'BooleanLiteral':
            return 'bool';
        case 'NullLiteral':
            return 'null';
        case 'VariableReference':
            if (!state.symbols[node.name]) {
                state.diagnostics.push(createDiagnostic('QB101', 'error', 'Unknown variable $' + node.name + '.', node.start, node.end, state.lineStarts));
                return 'unknown';
            }
            return state.symbols[node.name].type;
        case 'BracketReference':
            return 'unknown';
        case 'Identifier':
            return 'unknown';
        case 'ParenthesizedExpression':
            return inferExpressionType(node.expression, state);
        case 'UnaryExpression':
            leftType = inferExpressionType(node.expression, state);
            if (node.operator === 'not') {
                normalizedType = normalizeTypeName(leftType);
                if (normalizedType !== 'bool' && normalizedType !== 'unknown') {
                    state.diagnostics.push(createDiagnostic('QB104', 'warning', 'The not operator expects a Boolean value.', node.expression.start, node.expression.end, state.lineStarts));
                }
                return 'bool';
            }
            if (node.operator === '-') {
                if (!isNumberLike(leftType) && normalizeTypeName(leftType) !== 'unknown') {
                    state.diagnostics.push(createDiagnostic('QB104', 'warning', 'Unary - expects a numeric value.', node.expression.start, node.expression.end, state.lineStarts));
                }
                return leftType;
            }
            return 'unknown';
        case 'BinaryExpression':
            leftType = inferExpressionType(node.left, state);
            rightType = inferExpressionType(node.right, state);
            if (node.operator === 'and' || node.operator === 'or') {
                if (normalizeTypeName(leftType) !== 'bool' && normalizeTypeName(leftType) !== 'unknown') {
                    state.diagnostics.push(createDiagnostic('QB104', 'warning', 'Logical operators expect Boolean operands.', node.left.start, node.left.end, state.lineStarts));
                }
                if (normalizeTypeName(rightType) !== 'bool' && normalizeTypeName(rightType) !== 'unknown') {
                    state.diagnostics.push(createDiagnostic('QB104', 'warning', 'Logical operators expect Boolean operands.', node.right.start, node.right.end, state.lineStarts));
                }
                return 'bool';
            }
            if (node.operator === '=' || node.operator === '!=' || node.operator === '<>' || node.operator === '>' || node.operator === '<' || node.operator === '>=' || node.operator === '<=') {
                return 'bool';
            }
            if (node.operator === '&') {
                return 'text';
            }
            if (node.operator === '+' || node.operator === '-' || node.operator === '*' || node.operator === '/' || node.operator === '^') {
                if ((!isNumberLike(leftType) && normalizeTypeName(leftType) !== 'unknown') || (!isNumberLike(rightType) && normalizeTypeName(rightType) !== 'unknown')) {
                    state.diagnostics.push(createDiagnostic('QB104', 'warning', 'Arithmetic operators expect numeric values.', node.start, node.end, state.lineStarts));
                    return 'unknown';
                }
                if (normalizeTypeName(leftType) === 'duration' || normalizeTypeName(rightType) === 'duration') {
                    return 'duration';
                }
                return 'number';
            }
            return 'unknown';
        case 'CallExpression':
            entry = state.functionCatalog[node.callee.toLowerCase()];
            argTypes = getArgumentTypes(node.arguments, state);
            if (!entry) {
                state.diagnostics.push(createDiagnostic('QB105', 'warning', 'Unknown Quickbase function ' + node.callee + '().', node.start, node.end, state.lineStarts));
                return 'unknown';
            }
            if (entry.special === 'if') {
                return validateIfCall(node, argTypes, state);
            }
            if (entry.special === 'case') {
                return validateCaseCall(node, argTypes, state);
            }
            return validateGenericCall(node, entry, argTypes, state);
        case 'ErrorExpression':
            return 'unknown';
        default:
            return 'unknown';
        }
    }

    function validateStatements(statements, functionCatalog, lineStarts) {
        var diagnostics = [];
        var symbols = {};
        var state = {
            diagnostics: diagnostics,
            functionCatalog: functionCatalog || {},
            lineStarts: lineStarts,
            symbols: symbols
        };
        var index;
        var statement;
        var declaredType;
        var initializerType;
        var existingSymbol;

        for (index = 0; index < statements.length; index += 1) {
            statement = statements[index];

            if (statement.type === 'VariableDeclaration') {
                declaredType = normalizeTypeName(statement.declaredType);
                if (!isKnownVariableType(declaredType)) {
                    diagnostics.push(createDiagnostic('QB106', 'warning', 'Unknown Quickbase variable type ' + statement.declaredType + '.', statement.start, statement.nameEnd, lineStarts));
                    declaredType = 'unknown';
                }

                existingSymbol = symbols[statement.name];
                if (existingSymbol) {
                    diagnostics.push(createDiagnostic('QB100', 'error', 'Duplicate variable declaration $' + statement.name + '.', statement.nameStart, statement.nameEnd, lineStarts));
                }

                initializerType = statement.initializer ? inferExpressionType(statement.initializer, state) : 'unknown';
                if (statement.initializer && !canAssignType(declaredType, initializerType)) {
                    diagnostics.push(createDiagnostic('QB102', 'warning', 'Declared type ' + displayType(declaredType) + ' does not match initializer type ' + displayType(initializerType) + '.', statement.initializer.start, statement.initializer.end, lineStarts));
                }

                symbols[statement.name] = {
                    type: declaredType,
                    declaration: statement
                };
                continue;
            }

            if (statement.type === 'ExpressionStatement') {
                inferExpressionType(statement.expression, state);
            }
        }

        return diagnostics;
    }

    function validateText(text, functionCatalog) {
        var sourceText = text || '';
        var lineStarts = createLineStarts(sourceText);
        var lexical = tokenize(sourceText, lineStarts);
        var parser = new Parser(lexical.tokens, lineStarts);
        var parsed = parser.parseDocument();
        var diagnostics = [];
        var semanticDiagnostics = validateStatements(parsed.statements, functionCatalog || {}, lineStarts);

        collectDiagnostics(diagnostics, lexical.diagnostics);
        collectDiagnostics(diagnostics, parsed.diagnostics);
        collectDiagnostics(diagnostics, semanticDiagnostics);

        return {
            diagnostics: diagnostics,
            statements: parsed.statements
        };
    }

    return {
        buildFunctionCatalog: buildFunctionCatalog,
        validateText: validateText
    };
}));

