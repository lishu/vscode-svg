import {RenameProvider, TextDocument, Position, Range, CancellationToken, ProviderResult, WorkspaceEdit, TextEdit, window} from 'vscode';
import * as utils from './utils';

export class SvgRenameProvider implements RenameProvider {

    showNonameMessage() {
        window.showInformationMessage('Rename only work in tag name, id attribute or #id.');
    }

    calcRange(document: TextDocument, start: number | Position, size: number) : Range {
        if(typeof start == 'number') {
            var startPos = document.positionAt(start);
            var endPos = document.positionAt(start + size);
            return new Range(startPos, endPos);
        } else {
            return this.calcRange(document, document.offsetAt(start), size);
        }
    }

    provideIdRename(document: TextDocument, oldId: string, newId: string, token: CancellationToken): ProviderResult<WorkspaceEdit> {
        var body = document.getText();
        var workspaceEdit = new WorkspaceEdit();
        let regex = new RegExp(`((id="${oldId}")|(url\\(#${oldId}\\)))`, 'g');
        let exp: RegExpExecArray = null;
        let offset: number = 0;
        while(!token.isCancellationRequested && (exp = regex.exec(body))) {
            if(exp[2]) {
                workspaceEdit.replace(document.uri, this.calcRange(document, exp.index + 4, oldId.length), newId);
                offset += newId.length - oldId.length;
            }
            else if(exp[3]) {    
                workspaceEdit.replace(document.uri, this.calcRange(document, exp.index + 5, oldId.length), newId);
                offset += newId.length - oldId.length;
            }
        }
        return workspaceEdit;
    }

    provideRenameStartTag(document: TextDocument, position: Position, oldName, newName) : ProviderResult<WorkspaceEdit> {
        let level = 0;
        let body = document.getText();
        let offset = document.offsetAt(position);

        let tagInfo : utils.ITagMatchInfo = null;
        let workspaceEdit = new WorkspaceEdit();
        while(tagInfo = utils.getPrevTagFromOffset(body, offset)) {
            if(!tagInfo.tagName.startsWith('/') && !tagInfo.simple){
                level--;
                if(level <=0 ) {
                    workspaceEdit.replace(document.uri, this.calcRange(document, tagInfo.index + 1, oldName.length), newName);
                    workspaceEdit.replace(document.uri, this.calcRange(document, position, oldName.length), newName);
                    break; 
                }
            }
            else if(tagInfo.tagName.startsWith('/')) {
                level++;
            }
            offset = tagInfo.index - 2;
        }
        return workspaceEdit;
    }

    provideRenameEndTag(document: TextDocument, position: Position, oldName: string, newName: string) : ProviderResult<WorkspaceEdit> {
        let level = 0;
        let body = document.getText();
        let startOffset = document.offsetAt(position);
        let offset = startOffset + oldName.length;

        let tagInfo : utils.ITagMatchInfo = null;
        let workspaceEdit = new WorkspaceEdit();
        while(tagInfo = utils.getNextTagFromOffset(body, offset)) {
            // console.log('tagInfo', tagInfo.tagName);
            if(!tagInfo.tagName.startsWith('/') && !tagInfo.simple){
                level++;
            }
            else if(tagInfo.tagName.startsWith('/')) {
                level--;
                if(level <=0 ) {
                    workspaceEdit.replace(document.uri, this.calcRange(document, tagInfo.index + 2, oldName.length), newName);
                    workspaceEdit.replace(document.uri, this.calcRange(document, position, oldName.length), newName);
                    break; 
                }
            }
            offset = tagInfo.index + oldName.length;
        }
        return workspaceEdit;
    }

    provideRenameEdits(document: TextDocument, position: Position, newName: string, token: CancellationToken): ProviderResult<WorkspaceEdit> {
        let wordRange = document.getWordRangeAtPosition(position, /[(<\/)<#]?[a-zA-Z0-9_]+/);
        if(wordRange && !wordRange.isEmpty) {
            let word = document.getText(wordRange);
            // console.log('word', word);
            if(word.startsWith('</')) {
                return this.provideRenameStartTag(document, wordRange.start.translate(0, 2), word.substr(2), newName);
            }
            else if(word.startsWith('/')) {
                return this.provideRenameStartTag(document, wordRange.start.translate(0, 1), word.substr(1), newName);
            }
            else if(word.startsWith('<')) {
                return this.provideRenameEndTag(document, wordRange.start.translate(0, 1), word.substr(1), newName);
            }
            else if(word.startsWith('#')) {
                return this.provideIdRename(document, word.substr(1), newName, token);
            }
            else {
                wordRange = document.getWordRangeAtPosition(position, /id="[a-zA-Z0-9_]+"/);
                if(wordRange && !wordRange.isEmpty) {
                    return this.provideIdRename(document, word, newName, token);
                }
            }
        }
        return null;
    }
}