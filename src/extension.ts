'use strict';

import * as vscode from 'vscode';

import {SVGCompletionItemProvider} from './features/svgCompletionItemProvider';

import {SvgPreviwerContentProvider} from './previewer'

const SVG_MODE : vscode.DocumentSelector = {
    scheme: "file",
    pattern: "**/*.svg"
};

function moveCursor(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, offset: number){
    let selection = textEditor.selection;
    let doc = textEditor.document;
    let location = doc.offsetAt(selection.active);
    location += offset;
    let pos = doc.positionAt(location);
    textEditor.selection = new vscode.Selection(pos, pos);
}

function showSvg(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, offset: number){
    let uri = vscode.Uri.parse("svg:?" + textEditor.document.uri.path);
    let name = uri.path.split(/[\/\\]/).pop();
    vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.Two, `Preview ${name}`)
}


export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "svg" is now active!');

    let d1 = vscode.languages.registerCompletionItemProvider(
        SVG_MODE,
        new SVGCompletionItemProvider(),
        "<", " "
    )

    let d2 = vscode.commands.registerTextEditorCommand('extension.moveCursor', moveCursor);

    let d3 = vscode.commands.registerTextEditorCommand('extension.showSvg', showSvg);

    let d4 = vscode.workspace.registerTextDocumentContentProvider('svg', new SvgPreviwerContentProvider())

    context.subscriptions.push(d1, d2, d3, d4);
}

// this method is called when your extension is deactivated
export function deactivate() {
}