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
        return /\.svg$/i.test(document.uri.path);
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
            return Promise.resolve(SvgPreviwerContentProvider.lastActiveDocument.getText());
        }
        return this.getReportHtml('Switch to or open a ".svg" file will show preview.');
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