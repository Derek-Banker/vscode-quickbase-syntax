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

function offsetAt(text, line, character) {
    var currentLine = 1;
    var currentCharacter = 1;
    var index;

    for (index = 0; index < text.length; index += 1) {
        if (currentLine === line && currentCharacter === character) {
            return index;
        }
        if (text.charAt(index) === '\n') {
            currentLine += 1;
            currentCharacter = 1;
        } else {
            currentCharacter += 1;
        }
    }

    return text.length;
}

try {
    include('..\\lib\\quickbase-reference.js');
    include('..\\lib\\quickbase-language-service.js');
    include('..\\lib\\quickbase-hover-service.js');

    var snippets = eval('(' + readText(fso.BuildPath(scriptDirectory, '..\\snippets\\snippets.json')) + ')');
    var catalog = QuickbaseLanguageService.buildFunctionCatalog(snippets, QuickbaseReference);
    var targetPath = fso.GetAbsolutePathName(WScript.Arguments.Item(0));
    var line = parseInt(WScript.Arguments.Item(1), 10);
    var character = parseInt(WScript.Arguments.Item(2), 10);
    var source = readText(targetPath);
    var hover = QuickbaseHoverService.getHoverData(source, offsetAt(source, line, character), catalog, QuickbaseReference);
    var index;

    if (!hover) {
        WScript.Echo('NONE');
        WScript.Quit(0);
    }

    WScript.Echo('KIND|' + hover.kind);
    WScript.Echo('LABEL|' + hover.label);
    if (hover.summary) {
        WScript.Echo('SUMMARY|' + hover.summary);
    }
    if (hover.signatures) {
        for (index = 0; index < hover.signatures.length; index += 1) {
            WScript.Echo('SIGNATURE|' + hover.signatures[index]);
        }
    }
    if (hover.notes) {
        for (index = 0; index < hover.notes.length; index += 1) {
            WScript.Echo('NOTE|' + hover.notes[index]);
        }
    }
    if (hover.docsUrl) {
        WScript.Echo('URL|' + hover.docsUrl);
    }
} catch (error) {
    WScript.Echo('HARNESS|' + error.message);
    WScript.Quit(1);
}
