'use strict';

import * as vscode from 'vscode';

import {SVGCompletionItemProvider} from './features/svgCompletionItemProvider';
import {SvgSymbolProvider} from './features/svgSymbolProvider';

import {SvgPreviwerContentProvider} from './previewer'

const SVG_MODE : vscode.DocumentSelector = [
    'svg',
    {
        scheme: "file",
        language: "xml",
        pattern: "**/*.svg"
    }
];

function moveCursor(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, offset: number, showCompletionItems?:boolean){
    let selection = textEditor.selection;
    let doc = textEditor.document;
    let location = doc.offsetAt(selection.active);
    location += offset;
    let pos = doc.positionAt(location);
    textEditor.selection = new vscode.Selection(pos, pos);
    if(showCompletionItems === true) {
        vscode.commands.executeCommand('editor.action.triggerSuggest');
    }
}

function showSvg(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, offset: number){
    let uri = vscode.Uri.parse("svg:?" + textEditor.document.uri.path);
    let name = uri.path.split(/[\/\\]/).pop();
    vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.Two, `Preview ${name}`)
}


export function activate(context: vscode.ExtensionContext) {
    let d1 = vscode.languages.registerCompletionItemProvider(
        SVG_MODE,
        new SVGCompletionItemProvider(),
        "<", " ", "=", "\""
    )
    let d2 = vscode.commands.registerTextEditorCommand('_svg.moveCursor', moveCursor);
    let d3 = vscode.commands.registerTextEditorCommand('_svg.showSvg', showSvg);
    let d4 = vscode.workspace.registerTextDocumentContentProvider('svg', new SvgPreviwerContentProvider())
    let d5 = vscode.languages.registerDocumentSymbolProvider(SVG_MODE, new SvgSymbolProvider())

    context.subscriptions.push(d1, d2, d3, d4, d5);
}

// this method is called when your extension is deactivated
export function deactivate() {
}