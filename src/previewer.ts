import * as vscode from 'vscode';

import * as path from 'path';

import * as utils from './features/utils';

export class SvgPreviwerContentProvider
{
    webviewPanel : vscode.WebviewPanel;
    d1: vscode.Disposable;
    d2: vscode.Disposable;
    previewUri: string;
    scale: number = 1;
    //lastDocument: vscode.TextDocument;

    /**
     *
     */
    constructor() {
        this.d1 = vscode.workspace.onDidChangeTextDocument(e=>this.onDidChangeTextDocument(e));
        this.d2 = vscode.window.onDidChangeActiveTextEditor(e=>this.onDidChangeActiveTextEditor(e));
    }

    onDidChangeTextDocument(e: vscode.TextDocumentChangeEvent): any {
        if(this.isSvgDocument(e.document)) {
            this.showDocument(e.document);
        }
    }

    onDidChangeActiveTextEditor(e: vscode.TextEditor): any {
        if(this.isSvgDocument(e && e.document)) {
            this.showDocument(e.document);
        }
    }

    show() {
        if(this.webviewPanel == null) {
            let scriptRoot = vscode.Uri.file(__dirname);
            console.log('scriptRoot', scriptRoot);
            this.webviewPanel = vscode.window.createWebviewPanel('svg-preview', 'Svg Preview', vscode.ViewColumn.Three, {enableScripts: true});
            this.webviewPanel.webview.onDidReceiveMessage(e=>this.onDidReceiveMessage(e));
            this.webviewPanel.onDidDispose(()=>this.webviewPanel = null);
        }
        if(!this.webviewPanel.visible) {
            this.webviewPanel.reveal();
        }
        this.onDidChangeActiveTextEditor(vscode.window.activeTextEditor);
    }

    onDidReceiveMessage(e: any): any {
        switch (e.action) {
            case 'bg':
                vscode.workspace.getConfiguration('svg.preview').update('background', e.color).then(()=>{
                    console.log('svg.preview.background updated');
                });
                break;
            case 'scale':
                this.scale = e.scale;
                break;
            default:
                console.warn(`unknown action message ${e.action}`);
                break;
        }
    }

    isSvgDocument(document:vscode.TextDocument): boolean {
        return document && (/\.svg$/i.test(document.uri.path) || document.languageId == 'svg' || document.languageId == 'xml' && /^<svg\b/.test(document.getText()));
    }

    private showDocument(doc: vscode.TextDocument) {
        if(!this.webviewPanel){
            return;
        }
        if(this.previewUri != doc.uri.toString())
        {
            // this.lastDocument = doc;
            this.previewUri = doc.uri.toString();
            this.webviewPanel.title = path.basename(doc.uri.fsPath) + '[Preview]';
        }
        this.webviewPanel.webview.html = this.createHtml(doc);
    }

    private createHtml(doc: vscode.TextDocument):string
    {
        let bg = vscode.workspace.getConfiguration('svg.preview').get<string>('background') || 'transparent';
        let bgCustom = vscode.workspace.getConfiguration('svg.preview').get<string>('backgroundCustom') || '#eee';
        let svg = doc.getText();
        const html = [];
        html.push('<!DOCTYPE html>\n');
        html.push('<html>');
        html.push('<head></head>');
        html.push(`<style type="text/css">
        .bg-trans {
            background: url(data:image/gif;base64,R0lGODlhEAAQAIAAAP///8zMzCH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxMzggNzkuMTU5ODI0LCAyMDE2LzA5LzE0LTAxOjA5OjAxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTI0NUU1RTAzNzdFMTFFNzk2QkFDN0I4QUEyNzlDQkQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTI0NUU1RTEzNzdFMTFFNzk2QkFDN0I4QUEyNzlDQkQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFMjQ1RTVERTM3N0UxMUU3OTZCQUM3QjhBQTI3OUNCRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFMjQ1RTVERjM3N0UxMUU3OTZCQUM3QjhBQTI3OUNCRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAAAAAAALAAAAAAQABAAAAIfhG+hq4jM3IFLJhoswNly/XkcBpIiVaInlLJr9FZWAQA7);
        }
        .bg-white {
            background: white;
        }
        .bg-black {
            background: black;
        }
        .bg-custom{
            background: ${bgCustom};
        }
        body{
            margin:0;
            margin-top: 24px;
            padding:0;
        }
        #__toolbar{
            box-sizing: border-box;
            position: fixed;
            left: 0;
            top:0;
            height: 24px;
            width: 100%;
            z-index: 10000;
            background: var(--vscode-tab-activeBackground);
            border-bottom: solid 1px var(--vscode-tab-activeBorder);
        }

        #__toolbar>.btn-group {
            display:inline-block;
            margin: 0 4px;
        }
        #__toolbar>.btn-group>.btn-bg{
            margin-top: 3px;
            width: 17px;
            height: 17px;
            border: solid 1px #eee;
        }
        #__toolbar>.btn-group>.btn{
            position:relative;
            top: -3px;
            font-size: 10px;
            height: 17px;
            border: solid 1px #eee;
        }
        #__toolbar>.btn-group>.label{
            position:relative;
            padding:0 2px;
            top: -2px;
            font-size: 10px;
            height: 17px;
            cursor: default;
        }
        #__svg{
            transform-origin:top left;
            transform:scale(${this.scale});
        }
        </style>`);
        switch (bg) {
            case 'white':
                html.push('<body class="bg-white">');
                break;
            case 'black':
                html.push('<body class="bg-black">');
                break;
            case 'custom':
                html.push('<body class="bg-custom">');
                break;        
            default:
                html.push('<body class="bg-trans">');
                break;
        }
        html.push('<div id="__toolbar"></div>')
        html.push('<div id="__svg">');
        html.push(svg);
        html.push('</div>');
        html.push(`<script>
        var toolbar, groupBackground, labelZoom;

function createButtonGroup(){
    var group = document.createElement('div');
    group.className = 'btn-group';
    toolbar.appendChild(group);
    return group;
}

function createButton(parent, content, handler) {
    var btn = document.createElement('button');
    btn.type = 'button';
    parent.appendChild(btn);
    btn.onclick = handler;
    if(content) {
        btn.innerHTML = content;
    }
    return btn;
}

const vscode = acquireVsCodeApi();

var minScale = 0.08;
var maxScale = 8;
var scale = ${this.scale};

function normalScale() {
    if(scale < minScale) {
        scale = minScale
    }
    else if(scale > maxScale)
    {
        scale = maxScale;
    }
    showZoom();
}

function showZoom(){
    labelZoom.innerText = (scale * 100).toFixed(0) + '%';
}

function init() {
    toolbar = document.getElementById('__toolbar');
    groupBackground = createButtonGroup();
    var btnBg = createButton(groupBackground, null, e=>{document.body.className='bg-trans';vscode.postMessage({action:'bg', color:'transparent'})});
    btnBg.title = 'Use Transparent Background';
    btnBg.className = 'btn-bg bg-trans';
    btnBg = createButton(groupBackground, null, e=>{document.body.className='bg-white';vscode.postMessage({action:'bg', color:'white'})});
    btnBg.title = 'Use White Background';
    btnBg.className = 'btn-bg bg-white';
    btnBg = createButton(groupBackground, null, e=>{document.body.className='bg-black';vscode.postMessage({action:'bg', color:'black'})});
    btnBg.title = 'Use Black Background';
    btnBg.className = 'btn-bg bg-black';
    btnBg = createButton(groupBackground, null, e=>{document.body.className='bg-custom';vscode.postMessage({action:'bg', color:'custom'})});
    btnBg.title = 'Use Custom Background\\nModifty \\'svg.preview.backgroundCustom\\' Setting.';
    btnBg.className = 'btn-bg bg-custom';

    var groupZoom = createButtonGroup();
    labelZoom = document.createElement('span');
    labelZoom.style.fontSize = "10px";
    labelZoom.className = 'label';
    showZoom();
    groupZoom.appendChild(labelZoom);
    createButton(groupZoom, 'Original', e=>{
        scale = 1;
        showZoom();
        document.getElementById('__svg').style.transform = 'scale('+scale+')';
        vscode.postMessage({action: 'scale', scale: scale});
    }).className = 'btn';
    createButton(groupZoom, 'Zoom In', e=>{
        scale*=2;
        normalScale();
        document.getElementById('__svg').style.transform = 'scale('+scale+')';
        vscode.postMessage({action: 'scale', scale: scale});
    }).className = 'btn';
    createButton(groupZoom, 'Zoom Out', e=>{
        scale/=2;
        normalScale();
        document.getElementById('__svg').style.transform = 'scale('+scale+')';
        vscode.postMessage({action: 'scale', scale: scale});
    }).className = 'btn';
}

console.warn('document.readyState', document.readyState);

if(document.readyState != 'loading') {
    init();
} else {
    document.onreadystatechange = function(){
        if(document.readyState == 'interactive') {
            init();
        }
    }
} 
        </script></body>`);
        html.push('</html>');
        return html.join('');
    }

    dispose():any {
        this.d1.dispose();
        this.d2.dispose();
    }
}