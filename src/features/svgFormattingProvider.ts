import { readdirSync } from 'fs';
import { join, extname } from 'path';
import { DocumentFormattingEditProvider, TextDocument, Position, Range, CancellationToken, ProviderResult, FormattingOptions, TextEdit, workspace } from 'vscode';
import svgo = require('svgo');

export class SvgFormattingProvider implements DocumentFormattingEditProvider {
    private _plugins: string[];

    constructor() {
        this._plugins = readdirSync(join(__dirname, '..', '..', '..', 'node_modules', 'svgo', 'plugins'))
            .map((file) => file.replace(extname(file), ''));
    }

    provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        let config = workspace.getConfiguration('svg.format.plugins');
        let plugins = this._plugins
            .map((configName) => {
                let plugin = {};
                plugin[configName] = config[configName] || false;
                return plugin;
            });
        let formatter = new svgo({
            plugins: plugins,
            js2svg: { pretty: true }
        });

        return new Promise((resolve) => {
            formatter.optimize(document.getText(), (result) => {
                let range = new Range(new Position(0, 0), document.lineAt(document.lineCount - 1).range.end)
                resolve([new TextEdit(range, result.data)]);
            });
        });
    }
}