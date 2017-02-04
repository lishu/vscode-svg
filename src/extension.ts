'use strict';

import * as vscode from 'vscode';

import {SVGCompletionItemProvider} from './features/svgCompletionItemProvider';
import {SvgSymbolProvider} from './features/svgSymbolProvider';
import {SvgHoverProvider} from './features/svgHoverProvider';

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

function previewSvg(){
    let uri = vscode.Uri.parse("svg-preview:/jock/svg");
    SvgPreviwerContentProvider.lastActiveDocument = vscode.window.activeTextEditor && vscode.window.activeTextEditor.document;
    vscode.commands.executeCommand('vscode.previewHtml', uri, vscode.ViewColumn.Two, `SVG Preview`)
}


export function activate(context: vscode.ExtensionContext) {
    let d1 = vscode.languages.registerCompletionItemProvider(
        SVG_MODE,
        new SVGCompletionItemProvider(),
        "<", " ", "=", "\""
    )
    let d2 = vscode.commands.registerTextEditorCommand('_svg.moveCursor', moveCursor);
    let d3 = vscode.commands.registerTextEditorCommand('_svg.showSvg', previewSvg);
    let d4 = vscode.workspace.registerTextDocumentContentProvider('svg-preview', new SvgPreviwerContentProvider());
    let d5 = vscode.languages.registerDocumentSymbolProvider(SVG_MODE, new SvgSymbolProvider());
    let d6 = vscode.languages.registerHoverProvider(SVG_MODE, new SvgHoverProvider());

    context.subscriptions.push(d1, d2, d3, d4, d5, d6);
}

// this method is called when your extension is deactivated
export function deactivate() {
}