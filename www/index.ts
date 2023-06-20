/// <reference path="../core/core.d.ts" />

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

namespace Main {
    const saveAvalible = true;
    let calculated: Core.CalculatedTable;
    let jar: CodeJar;
    let selectedPage: string;
    let renderer: TableRenderer;

    const text =
        'A1: "Power of 2", "Col A + 1", "Col A * 2", "BANAnNnNAS"\n' +
        "A2: 1\n" +
        "A3-A20: =A2 * 2\n" +
        "B2-B20: =A2 - 1\n" +
        "C2-C20: =A2 * 2\n" +
        '# BANAnNnNAS\n' +
        'D2-D20: ="BANAnNnNAS" & " - " & A2';

    const keyWordRegex = new RegExp('(\\b(?=\\w)' +
        (<string[]>Object.keys(formulas)).join('|') + '\\b(?<=\\w))', "gm");

    let exportBtn: HTMLButtonElement;
    let exportFormula: HTMLSelectElement;
    let exportExtension: HTMLSelectElement;
    let exportMinify: HTMLInputElement;
    let exportPreview: HTMLTextAreaElement;

    export function highlight(editor: HTMLElement) {
        let code = escapeHtml(editor.innerText);

        code = code
            .replace(/(&quot;)((?:(?!\1).|\\.)*)((?:\1|$))/gm, '<font class=quota>$1$2$3</font>')
            .replace(keyWordRegex, '<font color="red">$1</font>')
            .replace(/((\w!)?\${0,1}[A-Z]\${0,1}[0-9]+)/gm, '<font color="blue">$1</font>')
            .replace(/(-+):/gm, '<font color="blue">$1</font>:')
            .replace(/(#.*\n|#.*$)/mg, '<font class=comment>$1</font>')
            .replace(/(@.*\n|@.*$)/mg, '<font class=sheet>$1</font>');

        editor.innerHTML = code;
    }

    function init() {
        const options = {
            tab: "  "
        }
        jar = CodeJar(<HTMLElement>document.getElementById("editor"), highlight, options);
        if (document.location.hash == "") {
            jar.updateCode(text);
        } else {
            jar.updateCode(decodeURI(document.location.hash.slice(1)));
        }

        renderer = new TableRenderer(
            document.querySelector(".table-container"),
            document.querySelector("#formula-line"));

        jar.onUpdate(() => {
            update();
        });

        exportBtn = <HTMLButtonElement>document.getElementById("export");
        exportFormula = <HTMLSelectElement>document.getElementById("export-formulas");
        exportExtension = <HTMLSelectElement>document.getElementById("export-ext");
        exportMinify = <HTMLInputElement>document.getElementById("export-minify");
        exportPreview = <HTMLTextAreaElement>document.getElementById("export-preview");

        exportBtn.addEventListener("click", updateExport);
        exportFormula.addEventListener("change", updateExport);
        exportExtension.addEventListener("change", updateExport);
        exportMinify.addEventListener("click", updateExport);

        document.getElementById("export-copy").addEventListener("click", () => {
            navigator.clipboard.writeText(exportText);
        });

        document.addEventListener("keydown", (ev) => {
            if ((<any>ev.target).id != "editor") {
                const replace: { [key: string]: string } = {
                    "ArrowRight": "right",
                    "ArrowLeft": "left",
                    "ArrowDown": "down",
                    "ArrowUp": "up"
                }
                if (replace[ev.code]) {
                    renderer.relativeChangeSelection(replace[ev.code]);
                    ev.preventDefault();
                }
            }
        });

        document.getElementById("export-download").addEventListener("click", () => {
            let file = new Blob([exportText]);
            let extensions = ["md", "csv"];
            let name = "codecell-untitled." + extensions[exportExtension.selectedIndex];
            let url = URL.createObjectURL(file);
            try {
                let linkElem = document.createElement("a");
                linkElem.href = url;
                linkElem.download = name;
                linkElem.click();
            }
            finally {
                URL.revokeObjectURL(url);
            }
        });

        update();
    }

    function updateTabs() {
        const tabs = <HTMLElement>document.getElementById("tabs");
        tabs.innerHTML = "";

        for (const key in calculated.tables) {
            const page = calculated.tables[key];
            const newInput = tabs.appendChild(document.createElement("input"));
            newInput.type = "radio";
            newInput.className = "btn-check";
            newInput.name = "page";
            newInput.id = "page-" + key;
            if (selectedPage == key) {
                newInput.checked = true;
            }
            newInput.addEventListener("click", () => {
                selectedPage = key;
                render();
            });

            const newLabel = tabs.appendChild(document.createElement("label"));
            newLabel.innerText = key;
            newLabel.className = "btn btn-outline-primary";
            newLabel.setAttribute("for", "page-" + key);
        }
    }

    let exportText = "";

    function updateExport() {
        let table: Core.Table<string | number | boolean | null>;
        if (exportFormula.selectedIndex == 0) {
            table = calculated.tables[selectedPage].values;
        } else {
            table = calculated.tables[selectedPage].formulas;
        }

        if (exportExtension.selectedIndex == 0) {
            exportText = ExportTable.MarkDown(table, exportMinify.checked);
        } else if (exportExtension.selectedIndex == 1) {
            exportText = ExportTable.CSV(table, exportMinify.checked, exportFormula.selectedIndex == 0);
        }

        exportPreview.value = exportText;
    }

    addEventListener("load", init);

    function update(): void {
        if (saveAvalible) {
            let nv = encodeURI(jar.toString()).replace(/ /g, "%20");
            if (nv[0] == '#') {
                nv = '#' + nv;
            }
            document.location.hash = nv;
        }

        calculated = Core.parse(jar.toString());
        if (!calculated.tables[selectedPage]) {
            selectedPage = Object.keys(calculated.tables)[0];
        }

        console.log(calculated);

        updateTabs();
        render();
    }

    function render() {
        renderer.render(calculated, selectedPage);
    }
}