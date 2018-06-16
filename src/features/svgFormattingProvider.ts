import { readdirSync } from 'fs';
import { join, extname } from 'path';
import { DocumentFormattingEditProvider, TextDocument, Position, Range, CancellationToken, ProviderResult, FormattingOptions, TextEdit, workspace, window, commands, TextDocumentWillSaveEvent, TextDocumentSaveReason } from 'vscode';
let svgo = require('svgo');

export class SvgFormattingProvider implements DocumentFormattingEditProvider {
    private _plugins: string[];

    private disableFormatOnSave: boolean = false;

    private _lastKnownFormatDocument: string;
    private _lastKnownFormatTime: number = 0;
    private _lastKnownFormatChanged = false;

    constructor() {
        var pluginDirs = join(__dirname, '..', '..', '..', 'node_modules', 'svgo', 'plugins');
        this._plugins = readdirSync(pluginDirs)
            .map((file) => file.replace(extname(file), ''));


        workspace.onDidChangeConfiguration(() => {
            this.updateConfiguration();
        });
        this.updateConfiguration();

        workspace.onWillSaveTextDocument(e => {
            if (this.disableFormatOnSave && this._lastKnownFormatChanged && e.document.fileName == this._lastKnownFormatDocument && this._lastKnownFormatTime + 50 > new Date().getTime()) {
                // In Save Format.
                this.restoreUnformatDocument(e);
            }
        }, this);
    }

    updateConfiguration() {
        let svgConf = workspace.getConfiguration('svg');
        this.disableFormatOnSave = svgConf.get<boolean>("disableFormatOnSave");
    }

    restoreUnformatDocument(e: TextDocumentWillSaveEvent) {
        commands.executeCommand('default:undo');
    }

    provideDocumentFormattingEdits(document: TextDocument, options: FormattingOptions, token: CancellationToken): ProviderResult<TextEdit[]> {
        let config = workspace.getConfiguration('svg.format.plugins');
        let plugins = this._plugins
            .map((configName) => {
                let plugin = {};
                plugin[configName] = config[configName] || false;
                return plugin;
            }) as any[];
        let formatter = new svgo({
            plugins: plugins,
            js2svg: { pretty: true }
        });

        return new Promise((resolve, reject) => {
            var oldText = document.getText();
            formatter.optimize(oldText, (result) => {
                if('data' in result) {
                    let range = new Range(new Position(0, 0), document.lineAt(document.lineCount - 1).range.end)
                    resolve([new TextEdit(range, result.data)]);
                    this._lastKnownFormatChanged = (oldText != result.data);
                    this._lastKnownFormatDocument = document.fileName;
                    this._lastKnownFormatTime = new Date().getTime();
                } else if('error' in result){
                    window.showWarningMessage('Unable to format because of an error\n'+result.error);
                    reject(result.error);
                }
            });
        });
    }
}