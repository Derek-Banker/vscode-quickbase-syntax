var fso = new ActiveXObject('Scripting.FileSystemObject');
var scriptDirectory = fso.GetParentFolderName(WScript.ScriptFullName);

function readText(path) {
    var stream = fso.OpenTextFile(path, 1, false);
    var content = stream.ReadAll();
    stream.Close();
    return content;
}

function include(relativePath) {
    eval(readText(fso.BuildPath(scriptDirectory, relativePath)));
}

try {
    include('..\\lib\\quickbase-reference.js');
    include('..\\lib\\quickbase-language-service.js');

    var snippets = eval('(' + readText(fso.BuildPath(scriptDirectory, '..\\snippets\\snippets.json')) + ')');
    var catalog = QuickbaseLanguageService.buildFunctionCatalog(snippets, QuickbaseReference);
    var targetPath = fso.GetAbsolutePathName(WScript.Arguments.Item(0));
    var source = readText(targetPath);
    var validation = QuickbaseLanguageService.validateText(source, catalog);
    var diagnostics = validation.diagnostics;
    var index;
    var item;

    if (!diagnostics.length) {
        WScript.Echo('OK');
        WScript.Quit(0);
    }

    for (index = 0; index < diagnostics.length; index += 1) {
        item = diagnostics[index];
        WScript.Echo(
            item.code + '|' + item.severity + '|' +
            (item.startLine + 1) + ':' + (item.startCharacter + 1) + '|' +
            item.message
        );
    }
} catch (error) {
    WScript.Echo('HARNESS|' + error.message);
    WScript.Quit(1);
}
