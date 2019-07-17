import { HoverProvider, Hover, TextDocument, Position, CancellationToken, Range } from 'vscode'

import {ISvgJson, ISvgJsonElement, ISvgJsonAttribute, ISvgJsonCategories, getSvgJson} from './svg';

import * as utils from './utils';

let svg : ISvgJson = null;

export class SvgHoverProvider implements HoverProvider {

    constructor() {
        if(svg == null) {
            svg = getSvgJson();
        }
    }

    provideHover(document: TextDocument, position: Position, token: CancellationToken): Hover
    {
        let range = document.getWordRangeAtPosition(position);

        let prevChar = utils.getOffsetString(document, range.start, -1);
        let nextChar = utils.getOffsetString(document, range.end, 1);
        let tag = null, attribute = null;
        if(prevChar == '-'){
            // prevWord
            var prevPosition = document.positionAt(document.offsetAt(range.start) - 2);
            let prevRange = document.getWordRangeAtPosition(prevPosition);
            if(prevRange.start.compareTo(range.start) < 0) {
                range = new Range(prevRange.start, range.end);
            }
            prevChar = utils.getOffsetString(document, range.start, -1);
        }
        else if(nextChar == '-')
        {
            // nextWord
            var nextPosition = document.positionAt(document.offsetAt(range.end) + 2);
            let nextRange = document.getWordRangeAtPosition(nextPosition);
            if(nextRange.end.compareTo(range.end) > 0) {
                range = new Range(range.start, nextRange.end);
            }
            nextChar = utils.getOffsetString(document, range.end, 1);
        }
        if(prevChar == '<' && nextChar == ' ') {
            tag = document.getText(range);
        }
        else if(/\s/.test(prevChar) && nextChar == '=') {
            attribute = document.getText(range);
        }

        if(tag) {
            if(svg.elements[tag]){
                let ele = svg.elements[tag];
                return new Hover({
                    language: 'markdown',
                    value: '<' + tag +'>\n' + ele.documentation
                })
            }
        }

        if(attribute) {
            if(svg.attributes[attribute]){
                let ele = svg.attributes[attribute];
                return new Hover({
                    language: 'markdown',
                    value: '[' + attribute +']\n' + ele.documentation
                }, range)
            }
        }

        return undefined;
    }
}