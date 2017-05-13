import * as vscode from 'vscode';

import * as fs from 'fs';

import * as utils from './features/utils';

export class SvgPreviwerContentProvider implements vscode.TextDocumentContentProvider, vscode.Disposable
{

    static lastActiveDocument: vscode.TextDocument;

    _didChangeEventEmitter = new vscode.EventEmitter<vscode.Uri>();

    onDidChange: vscode.Event<vscode.Uri>;
    
    constructor() {
        this.onDidChange = this._didChangeEventEmitter.event;

        vscode.workspace.onDidChangeTextDocument(e=>{
            if(e.document == SvgPreviwerContentProvider.lastActiveDocument) {
                this._didChangeEventEmitter.fire(vscode.Uri.parse('svg-preview:/jock/svg'));
            }
        });

        vscode.window.onDidChangeActiveTextEditor(e=>{
            this._didChangeEventEmitter.fire(vscode.Uri.parse('svg-preview:/jock/svg'));
        });

        let self = this;
    }

    isSvgDocument(document:vscode.TextDocument): boolean {
        return /\.svg$/i.test(document.uri.path) || document.languageId == 'svg' || document.languageId == 'xml' && /^<svg\b/.test(document.getText());
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Thenable<string> {
        let activeTextEditor = vscode.window.activeTextEditor;
        if(activeTextEditor) {
            if(this.isSvgDocument(activeTextEditor.document)) {
                SvgPreviwerContentProvider.lastActiveDocument = activeTextEditor.document;
                return this.getLastContent();
            } 
            return this.getLastContent();
        } 
        return this.getLastContent();
    }

    getLastContent(): Thenable<string> {
        if(this.isSvgDocument(SvgPreviwerContentProvider.lastActiveDocument)) {
            return this.getContextHTML(SvgPreviwerContentProvider.lastActiveDocument.getText());
        }
        return this.getReportHtml('Switch to or open a ".svg" file will show preview.');
    }

    getContextHTML(svgHTML: string): Thenable<string> {
        return Promise.resolve(`<html>
<head>
    <style type="text/css">
        body{
            padding:0;
            background: url(data:image/gif;base64,R0lGODlhEAAQAIAAAP///8zMzCH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTI0NUU1RTAzNzdFMTFFNzk2QkFDN0I4QUEyNzlDQkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTI0NUU1RTEzNzdFMTFFNzk2QkFDN0I4QUEyNzlDQkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMjQ1RTVERTM3N0UxMUU3OTZCQUM3QjhBQTI3OUNCRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMjQ1RTVERjM3N0UxMUU3OTZCQUM3QjhBQTI3OUNCRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAAAAAAALAAAAAAQABAAAAIfhG+hq4jM3IFLJhoswNly/XkcBpIiVaInlLJr9FZWAQA7);
        }
    </style>
</head>
<body>
<div id="$-toolbar">
</div>
${svgHTML}
</body>
</html>`);
    }

    getReportHtml(body): Thenable<string> {
        return Promise.resolve(`<html>
<head>
<title>No Content</title>
</head>
<body>
<p style="color:#900">${body}</p>
</body>
</html>`);
    }

    dispose(){
        this._didChangeEventEmitter.dispose();
    }
}