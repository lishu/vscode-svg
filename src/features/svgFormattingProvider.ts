import {DocumentFormattingEditProvider, TextDocument, Position, Range, CancellationToken, ProviderResult, FormattingOptions, TextEdit, workspace} from 'vscode';
import svgo = require('svgo');

export class SvgFormattingProvider implements DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        let config = workspace.getConfiguration('svg.format');
        let plugins = ['convertColors', 'convertShapeToPath', 'convertTransform', 'mergePaths',
            'removeComments', 'removeDesc', 'removeDoctype', 'removeMetadata', 'sortAttrs']
            .map((configName) => {
                let plugin = {};
                plugin[configName] = config.get(configName);
                return plugin;
            });
        let formatter = new svgo({
            plugins: plugins,
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