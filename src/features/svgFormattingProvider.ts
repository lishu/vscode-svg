import {DocumentFormattingEditProvider, TextDocument, Position, Range, CancellationToken, ProviderResult, FormattingOptions, TextEdit} from 'vscode';
import svgo = require('svgo');

export class SvgFormattingProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        let formatter = new svgo({
            plugins: [{sortAttrs: true}],
            js2svg: {pretty: true}
        });
        return new Promise((resolve) => {
            formatter.optimize(document.getText(), (result) => {
                let range = new Range(new Position(0, 0), document.lineAt(document.lineCount - 1).range.end)
                resolve([new TextEdit(range, result.data)]);
            });
        });
    }
}