import { CompletionItemProvider, Uri, EndOfLine, TextLine, Position, Range, TextDocument, CancellationToken, CompletionContext, CompletionItem, CompletionList, ProviderResult } from "vscode";

import { SVGCompletionItemProvider } from "./svgCompletionItemProvider";

export class EmbeddedSVGCompletionItemProvider implements CompletionItemProvider
{
    private NoSvgBlockRegex = /\<svg\w.*\(<\/svg\>)?/gi.compile();

    constructor(private provider: SVGCompletionItemProvider) {        
    }

    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList> {
        let doc = document.getText();
        let offset = document.offsetAt(position);
        let before = doc.substring(0, offset);
        let beforeEnd = /<\/svg>$/i.exec(before);
        let beforeStart = /<\/svg>$/i.exec(before);

        return null;
    }

}