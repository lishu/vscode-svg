import {
    CompletionItemProvider,
    TextDocument,
    Position,
    Range,
    Command,
    CancellationToken, 
    CompletionItem, 
    CompletionList, 
    CompletionItemKind,
    TextEdit
} from 'vscode';

import * as fs from 'fs';
import * as path from 'path';
import {ISvgJson, ISvgJsonElement, ISvgJsonAttribute, ISvgJsonCategories, getSvgJson} from './svg';
import * as utils from './utils';

let svg: ISvgJson = null;

export class SVGCompletionItemProvider implements CompletionItemProvider
{

    constructor(){
        if(svg == null){
            svg = getSvgJson();
        }
    }

    /**
     * 创建一个新的自动完成项。
     * @param {string} element 元素名称。
     * @param {ISvgJsonElement} ele 元素信息结构。
     * @returns {CompletionItem} 
     */
    createCompletionItem(element: string, ele: ISvgJsonElement) {
        let item = new CompletionItem(element, CompletionItemKind.Class);
        if(ele.deprecated){
            item.detail = 'DEPRECATED';
        }
        if(ele.documentation){
            item.documentation = ele.documentation;
            if(ele.deprecated){
                item.documentation = ele.documentation + '\n\n**DEPRECATED**';
            }
        }
        if(ele.simple === true) {
            item.insertText = `${item.label} /`;
            item.command = {command: "extension.moveCursor", title: "Cursor To Inside", arguments:[-1]};
        } else if(ele.inline === true) {
            item.insertText = `${item.label}></${item.label}>`;
            item.command = {command: "extension.moveCursor", title: "Cursor To Inside", arguments:[-item.label.length-3]};
        } else {
            item.insertText = `${item.label}>\n\t\n</${item.label}`;
            item.command = {command: "cursorUp", title: "Cursor Up"};
        }
        return item;
    }

    /**
     * 创建一个新的属性完成项。
     * @param {string} attr 属性名称。
     * @param {ISvgJsonAttribute} svgAttr 属性信息结构。
     * @returns {CompletionItem} 
     */
    createAttributeCompletionItem(attr: string, svgAttr?: ISvgJsonAttribute) {
        let item = new CompletionItem(attr, CompletionItemKind.Property);
        if(svgAttr == undefined && svg.attributes[attr]) {
            svgAttr = svg.attributes[attr];
        }
        if(svgAttr){
            if(svgAttr.deprecated){
                item.detail = 'DEPRECATED';
            }
            if(svgAttr.documentation){
                item.documentation = svgAttr.documentation;
                if(svgAttr.deprecated){
                    item.documentation = svgAttr.documentation + '\n\n**DEPRECATED**';
                }
            }
        }
        item.insertText = `${item.label}=""`;
        item.command = {command: "cursorLeft", title: "Cursor Left"};
        return item;
    }

    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): CompletionItem[]
    {
        let prevChar = document.getText(new Range(position.line, position.character - 1, position.line, position.character));
        let nextChar = document.getText(new Range(position.line, position.character, position.line, position.character + 1));
        if(prevChar == '<') {
            return this.provideTagItems(document, position, token);
        }
        else if(prevChar == ' ' && /[\/>\s]/.test(nextChar)) {
            return this.provideAttributesItems(document, position, token);
        }
        return null;
    }

    provideAttributesItems(document: TextDocument, position: Position, token: CancellationToken): CompletionItem[]
    {
        let items: CompletionItem[] = [];
        let startTag = utils.getInStartTag(token, document, position);
        if(startTag && svg.elements[startTag.tagName]) {
            let attributes = svg.elements[startTag.tagName].attributes;
            if(attributes) {
                for(let attr of attributes) {
                    let name = typeof attr == 'string' ? attr : attr.name;
                    // 测试是否已定义此属性
                    if(startTag.tagAttrs.indexOf(` ${name}=`)>-1){
                        continue;
                    }
                    if(typeof attr == 'string') {
                        items.push(this.createAttributeCompletionItem(attr));
                    } else {
                        items.push(this.createAttributeCompletionItem(attr.name, attr));
                    }
                }
            }
        }
        return items;
    }

    provideTagItems(document: TextDocument, position: Position, token: CancellationToken): CompletionItem[]
    {
        let items: CompletionItem[] = [];
        let prevTag = utils.getPrevTag(document, position);
        let parentTag = utils.getParentTag(token, document, position);
        if(prevTag){
            console.log(`prevTag ${prevTag.index} ${prevTag.tagName} ${prevTag.tagAttrs} ${prevTag.simple}`);
        }
        if(parentTag){
            console.log(`parentTag ${parentTag.index} ${parentTag.tagName} ${parentTag.tagAttrs} ${parentTag.simple}`);
        }
        if(prevTag === undefined) {
            let ele = svg.elements['svg'];
            let item = this.createCompletionItem('svg', ele);
            item.textEdit = TextEdit.insert(position, "svg xmlns=\"http://www.w3.org/2000/svg\">\n\t\n</svg");
            return [item];
        }
        if(parentTag) {            
            let parentEle = svg.elements[parentTag.tagName];
            if(parentEle.subElements) {
                for(let subElement of parentEle.subElements) {
                    let item = this.createCompletionItem(subElement, svg.elements[subElement]);
                    items.push(item);
                }
                return items;
            }
        }
        for(let element in svg.elements) {
            let item = this.createCompletionItem(element, svg.elements[element]);
            items.push(item);
        }
        return items;
    }
}