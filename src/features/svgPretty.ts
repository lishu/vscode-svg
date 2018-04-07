import { Range, Position, TextEditor, TextEditorEdit } from 'vscode';
import svgo = require('svgo');

export function svgPretty(textEditor: TextEditor, edit: TextEditorEdit) {
    let optimizer = new svgo({
        js2svg: {pretty: true}
    });
    let document = textEditor.document;

    return new Promise((resolve, reject) => {
        optimizer.optimize(document.getText(), (result) => {
            if (result.error) reject(result.error);
            let range = new Range(new Position(0, 0), document.lineAt(document.lineCount - 1).range.end)
            edit.replace(range, result.data);
            resolve();
        });
    });
}
