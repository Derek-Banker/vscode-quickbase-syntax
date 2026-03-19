var vscode = require('vscode');
var quickbaseLanguageService = require('./lib/quickbase-language-service');
var snippets = require('./snippets/snippets.json');

function activate(context) {
    var functionCatalog = quickbaseLanguageService.buildFunctionCatalog(snippets);
    var diagnostics = vscode.languages.createDiagnosticCollection('quickbase');
    var timers = Object.create(null);

    function isQuickbaseDocument(document) {
        return document && (document.languageId === 'quickbase' || /\.quickbase$/i.test(document.fileName || ''));
    }

    function toSeverity(level) {
        if (level === 'error') {
            return vscode.DiagnosticSeverity.Error;
        }
        if (level === 'information') {
            return vscode.DiagnosticSeverity.Information;
        }
        if (level === 'hint') {
            return vscode.DiagnosticSeverity.Hint;
        }
        return vscode.DiagnosticSeverity.Warning;
    }

    function validateDocument(document) {
        var validation;
        var items;
        var index;
        var item;
        var range;
        var diagnostic;

        if (!isQuickbaseDocument(document)) {
            return;
        }

        validation = quickbaseLanguageService.validateText(document.getText(), functionCatalog);
        items = [];

        for (index = 0; index < validation.diagnostics.length; index += 1) {
            item = validation.diagnostics[index];
            range = new vscode.Range(document.positionAt(item.start), document.positionAt(item.end));
            diagnostic = new vscode.Diagnostic(range, item.message, toSeverity(item.severity));
            diagnostic.code = item.code;
            diagnostic.source = 'quickbase';
            items.push(diagnostic);
        }

        diagnostics.set(document.uri, items);
    }

    function scheduleValidation(document) {
        var key;

        if (!isQuickbaseDocument(document)) {
            return;
        }

        key = document.uri.toString();
        if (timers[key]) {
            clearTimeout(timers[key]);
        }

        timers[key] = setTimeout(function () {
            delete timers[key];
            validateDocument(document);
        }, 150);
    }

    context.subscriptions.push(diagnostics);
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(validateDocument));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(function (event) {
        scheduleValidation(event.document);
    }));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(function (document) {
        diagnostics.delete(document.uri);
    }));

    if (vscode.window && vscode.window.visibleTextEditors) {
        vscode.window.visibleTextEditors.forEach(function (editor) {
            validateDocument(editor.document);
        });
    }
}

function deactivate() {
}

module.exports = {
    activate: activate,
    deactivate: deactivate
};
