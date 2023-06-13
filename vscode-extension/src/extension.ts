// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import MarkdownIt = require('markdown-it');

var codecell = require("../core");
//import * as MarkdownIt from 'markdown-it';

interface Previewer {
    panel: vscode.WebviewPanel;
    editor: vscode.TextEditor;
}

let previewers: { [key: string]: Previewer | null } = {};
let extensionUri: vscode.Uri;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    extensionUri = context.extensionUri;

    context.subscriptions.push(
        vscode.commands.registerCommand("codecell.showPreviewToSide", () => {
            showPreview(vscode.ViewColumn.Two);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("codecell.showPreview", () => {
            showPreview(vscode.ViewColumn.One);
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection((textEditorSelection) => {
            const textEditor = textEditorSelection.textEditor;
            if (textEditor && textEditor.document && textEditor.document.uri) {
                updatePreview(textEditor.document.uri);
            }
        })
    );

    return {
        extendMarkdownIt(md: MarkdownIt) {
            const defaultRenderer = md.renderer.rules.fence;
            md.renderer.rules.fence = function (tokens, idx, options, env, self) {
                const token = tokens[idx];
                if (token.info.trim() === "codecell") {
                    return getHtml(token.content, "b");
                } else {
                    if (defaultRenderer) {
                        return defaultRenderer(tokens, idx, options, env, self);
                    } else {
                        return "";
                    }
                }
            };
            const defaultHighlighter = md.options.highlight;
            md.options.highlight = function (str: string, lang: string, attrs: string): string {
                if (lang == "codecell") {
                    return escapeHtml(str);
                } else if (defaultHighlighter) {
                    return defaultHighlighter(str, lang, attrs);
                } else {
                    return "";
                }
            };
            return md;
        }
    };
}

function getHtml(text: string, headers: string): string {
    const calculated = codecell.parse(text);
    let rv = "";
    console.log(calculated);
    if (calculated.errors.length > 0) {
        for (const err of calculated.errors) {
            rv += `<p>Error: ${escapeHtml((err.type || "") + " " + (err.value || ""))}</p>`;
        }
    }
    if (calculated.viewbox) {
        const key = calculated.viewbox.sheet || Object.keys(calculated.tables)[0];
        if (calculated.tables[key]) {
            rv = renderTable(calculated.tables[key].values.data, calculated.tables[key].styles, calculated.viewbox);
        } else {
            rv = "<p>" + key + "table is undefined</p>"
        }
    } else {
        for (const key in calculated.tables) {
            if (Object.keys(calculated.tables).length > 1) {
                rv += `<${headers}>${escapeHtml(key)}</${headers}>`;
            }
            const rendered = renderTable(calculated.tables[key].values.data, calculated.tables[key].styles, calculated.viewbox);
            rv += rendered;
        }
    }
    return rv;
}

function escapeHtml(str: string): string {
    return str
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;");
}

function renderTable(values: (string | number | boolean | null)[][], styleTable: any, viewbox: any = null): string {
    let w = 0;
    for (let row of values) {
        w = Math.max(row.length, w);
    }

    console.log(styleTable)

    const borderWidth = "0.5px";
    const padding = "0px 3px";

    let html: string = `
<style>
.codecell, .codecell td, .codecell th { 
    border: ${borderWidth} solid white !important;
    border-collapse: collapse;
}
.codecell th {
    text-align: center;
    ${padding ? ("padding:" + padding + "!important;") : ""}
    border: ${borderWidth} solid white !important;
}
.codecell td {
    width: 70px;
    min-width: 70px;
    ${padding ? ("padding:" + padding + "!important;") : ""}
    border: ${borderWidth} solid white !important;
}
.codecell * {
    font-family: "Calibri", var(--markdown-font-family);
    font-size: 14px;
    line-height: 22px;
}
</style>
<table class="codecell"><tr><td></td>`;
    let startX = 0, startY = 1;
    let endX = w - 1, endY = values.length - 1;

    if (viewbox) {
        if (viewbox.isRange) {
            startX = Math.min(viewbox.start.col, viewbox.end.col);
            startY = Math.min(viewbox.start.row, viewbox.end.row);
            endX = Math.max(viewbox.start.col, viewbox.end.col);
            endY = Math.max(viewbox.start.row, viewbox.end.row);
        } else {
            const val = values[viewbox.row][viewbox.column];
            return escapeHtml(val ? val.toString() : "");
        }
    }

    for (let i = startX; i <= endX; i++) {
        html += "<th>" + escapeHtml(codecell.alphabet[i]) + "</th>";
    }
    html += "</tr>";

    for (let y = startY; y <= endY; y++) {
        html += "<tr><th>" + y + "</th>";
        for (let x = startX; x <= endX; x++) {
            let val;
            if (values[y]) {
                val = values[y][x];
            }
            let style = "";
            if (typeof val === "number") {
                style = "text-align: right;";
            }
            if (val === null || val === undefined) {
                val = "";
            }
            const styleCell = styleTable.get(x, y) || {};
            html += `<td style="${style}"}>${codecell.renderStyle(val, styleCell)}</td>`;
        }
        html += "</tr>";
    }
    html += "</table>";

    return html;
}

function showPreview(viewColumn: vscode.ViewColumn) {
    if (vscode.window.activeTextEditor) {
        const uri = vscode.window.activeTextEditor.document.uri;
        if (previewers[uri.toString()]) {
            disposePreview(uri);
        }

        initPreview(uri, vscode.window.activeTextEditor, { viewColumn: viewColumn });
    } else {
        vscode.window.showInformationMessage("Can't open find editor!!!");
    }
}

function initPreview(sourceUri: vscode.Uri, editor: vscode.TextEditor,
    viewOptions: { viewColumn: vscode.ViewColumn }) {
    const preview = previewers[sourceUri.toString()];
    if (preview) {
        preview.panel.reveal();
    }

    const panel = vscode.window.createWebviewPanel(
        "liveHTMLPreviewer", "Preview " + path.basename(sourceUri.toString()),
        viewOptions.viewColumn,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    panel.iconPath = vscode.Uri.joinPath(extensionUri, "media/codecell.svg");

    const previewer = {
        panel: panel,
        editor: editor
    };
    previewers[sourceUri.toString()] = previewer;

    panel.onDidDispose(() => {
        disposePreview(sourceUri);
    });

    updatePreview(sourceUri);
}

function disposePreview(uri: vscode.Uri) {
    const preview = previewers[uri.toString()];
    if (preview) {
        if (preview.panel) {
            preview.panel.dispose();
        }
        previewers[uri.toString()] = null;
    }
}

function updatePreview(uri: vscode.Uri) {
    const preview = previewers[uri.toString()];
    if (preview) {
        if (preview.editor.document.isClosed) {
            disposePreview(uri);
        } else {
            vscode.workspace.openTextDocument(uri).then((document) => {
                let text = document.getText()
                    .replace("\n\r", "\n")
                    .replace("\t", " ".repeat(4));

                preview.panel.webview.html = getHtml(text, "h1");
            });
        }
    }
}

// This method is called when your extension is deactivated
export function deactivate() { }
