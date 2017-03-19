import {DefinitionProvider, TextDocument, Position, CancellationToken, ProviderResult, Definition, Location} from 'vscode';
import * as utils from './utils';

export class SvgDefinitionProvider implements DefinitionProvider {
    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition> {
        let idRefRange = document.getWordRangeAtPosition(position, /url\(#[^\)\r\n]+\)/);
        if(idRefRange && !idRefRange.isEmpty) {
            let body = document.getText();
            let idRef = document.getText(idRefRange);
            let id = idRef.substr(5, idRef.length - 6);
            let definePoint = body.indexOf(' id="'+id+'"');
            if(definePoint > 0) {
                let startTag = utils.getInStartTagFromOffset(token, body, definePoint);
                if(startTag) {
                    let pos = document.positionAt(startTag.index);
                    return new Location(document.uri, pos);
                }
            }
        }
        return null;
    }
}