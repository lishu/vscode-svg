import * as vscode from 'vscode';

import * as fs from 'fs';

import * as utils from './features/utils';

vscode.EventEmitter

interface UriMapping {
    srcUri: vscode.Uri;
    previewUri: vscode.Uri;
}

export class SvgPreviwerContentProvider implements vscode.TextDocumentContentProvider, vscode.Disposable
{
    _didChangeEventEmitter = new vscode.EventEmitter<vscode.Uri>();

    onDidChange: vscode.Event<vscode.Uri>;

    uriMappings: UriMapping[] = [];
    
    constructor() {
        this.onDidChange = this._didChangeEventEmitter.event;

        let self = this;
        vscode.workspace.onDidChangeTextDocument(e=>{
            let uriMapping = self.uriMappings.find(m=>e.document.uri.scheme == 'file' && m.srcUri.fsPath == e.document.fileName);
            if(uriMapping) {
                self._didChangeEventEmitter.fire(uriMapping.previewUri);
            }
        });
        vscode.workspace.onDidCloseTextDocument(document=>{
            let uriMapping = self.uriMappings.find(m=>document.uri.scheme == 'file' && m.srcUri.fsPath == document.fileName);
            if(uriMapping) {
                utils.removeItem(self.uriMappings, uriMapping);
            }
        })
    }

    createFileDidChangeWatch(srcUri: vscode.Uri, previewUri: vscode.Uri) : PromiseLike<vscode.TextDocument> {
        let doc = vscode.workspace.textDocuments.find(d=>d.uri.scheme == "file" && d.uri.fsPath == srcUri.fsPath);
        let uriMapping = this.uriMappings.find(m=>m.srcUri.fsPath == srcUri.fsPath);
        if(!uriMapping) {
            let self = this;
            if(doc) {
                let uriMapping = {
                    srcUri: srcUri, 
                    previewUri: previewUri
                };
                self.uriMappings.push(uriMapping);
                return Promise.resolve(doc);
            }

            return vscode.workspace.openTextDocument(srcUri).then(doc=>{
                let uriMapping = {
                    srcUri: srcUri, 
                    previewUri: previewUri
                };
                self.uriMappings.push(uriMapping);
                return doc;
            })
        } else if(doc) {
            return Promise.resolve(doc);
        }
        return Promise.reject("FILE NO FIND");
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Thenable<string> {
        let srcUri = vscode.Uri.file(uri.query);
        return this.createFileDidChangeWatch(srcUri, uri).then(doc=>{
            return doc.getText();
        });
    }

    dispose(){
        this._didChangeEventEmitter.dispose();
    }
}