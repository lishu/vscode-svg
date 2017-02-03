import {SymbolInformation, SymbolKind, DocumentSymbolProvider, Location, TextDocument, Position, CancellationToken} from 'vscode';
import * as utils from './utils';

export class SvgSymbolProvider implements DocumentSymbolProvider {
    provideDocumentSymbols(document: TextDocument, token: CancellationToken): SymbolInformation[]
    {
        var body = document.getText();
        if(token.isCancellationRequested) {
            return undefined;
        }

        let regex = /<[\w\-]+\s+.*?id=\"([^\"]+)\".*?>/gi;
        let symbols = [];
        let e: RegExpExecArray = null;
        while(!token.isCancellationRequested && (e = regex.exec(body))) {
            symbols.push(
                new SymbolInformation(e[1], SymbolKind.Object, null, new Location(document.uri, document.positionAt(e.index)))
            );
        }
        return symbols;
    }
}