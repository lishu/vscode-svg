import { Range, TextEdit, CompletionItemKind, Command } from 'vscode';


/**
 * A snippet string is a template which allows to insert text
 * and to control the editor cursor when insertion happens.
 *
 * A snippet can define tab stops and placeholders with `$1`, `$2`
 * and `${3:foo}`. `$0` defines the final tab stop, it defaults to
 * the end of the snippet. Placeholders with equal identifiers are linked,
 * that is typing in one will update others too.
 */
export class SnippetString {

    /**
     * The snippet string.
     */
    value: string;

    constructor(value?: string);

    /**
     * Builder-function that appends the given string to
     * the [`value`](#SnippetString.value) of this snippet string.
     *
     * @param string A value to append 'as given'. The string will be escaped.
     */
    appendText(string: string): SnippetString;

    /**
     * Builder-function that appends a tabstop (`$1`, `$2` etc) to
     * the [`value`](#SnippetString.value) of this snippet string.
     *
     * @param number The number of this tabstop, defaults to an auto-incremet
     * value starting at 1.
     */
    appendTabstop(number?: number): SnippetString;

    /**
     * Builder-function that appends a placeholder (`${1:value}`) to
     * the [`value`](#SnippetString.value) of this snippet string.
     *
     * @param value The value of this placeholder - either a string or a function
     * with which a nested snippet can be created.
     * @param number The number of this tabstop, defaults to an auto-incremet
     * value starting at 1.
     */
    appendPlaceholder(value: string | ((snippet: SnippetString) => any), number?: number): SnippetString;
}

export class CompletionItem {
    //..
    /**
     * A string or snippet that should be inserted in a document when selecting
     * this completion. When `falsy` the [label](#CompletionItem.label)
     * is used.
     */
    insertText: string | SnippetString;

    /**
     * A range of text that should be replaced by this completion item.
     *
     * Defaults to a range from the start of the [current word](#TextDocument.getWordRangeAtPosition) to the
     * current position.
     *
     * *Note:* The range must be a [single line](#Range.isSingleLine) and it must
     * [contain](#Range.contains) the position at which completion has been [requested](#CompletionItemProvider.provideCompletionItems).
     */
    range: Range;

    /**
     * @deprecated **Deprecated** in favor of `CompletionItem.insertText` and `CompletionItem.range`.
     *
     * ~~An [edit](#TextEdit) which is applied to a document when selecting
     * this completion. When an edit is provided the value of
     * [insertText](#CompletionItem.insertText) is ignored.~~
     *
     * ~~The [range](#Range) of the edit must be single-line and on the same
     * line completions were [requested](#CompletionItemProvider.provideCompletionItems) at.~~
     */
    textEdit: TextEdit;



    /**
     * The label of this completion item. By default
     * this is also the text that is inserted when selecting
     * this completion.
     */
    label: string;

    /**
     * The kind of this completion item. Based on the kind
     * an icon is chosen by the editor.
     */
    kind: CompletionItemKind;

    /**
     * A human-readable string with additional information
     * about this item, like type or symbol information.
     */
    detail: string;

    /**
     * A human-readable string that represents a doc-comment.
     */
    documentation: string;

    /**
     * A string that should be used when comparing this item
     * with other items. When `falsy` the [label](#CompletionItem.label)
     * is used.
     */
    sortText: string;

    /**
     * A string that should be used when filtering a set of
     * completion items. When `falsy` the [label](#CompletionItem.label)
     * is used.
     */
    filterText: string;

    /**
     * An optional array of additional [text edits](#TextEdit) that are applied when
     * selecting this completion. Edits must not overlap with the main [edit](#CompletionItem.textEdit)
     * nor with themselves.
     */
    additionalTextEdits: TextEdit[];

    /**
     * command
     */
    command?: Command;

    /**
     * Creates a new completion item.
     *
     * Completion items must have at least a [label](#CompletionItem.label) which then
     * will be used as insert text as well as for sorting and filtering.
     *
     * @param label The label of the completion.
     * @param kind The [kind](#CompletionItemKind) of the completion.
     */
    constructor(label: string, kind?: CompletionItemKind);
}
