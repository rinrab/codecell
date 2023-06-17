/// <reference path="qunit.d.ts" />
/// <reference path="../core/core.d.ts" />
/// <reference path="../xlsx/index.ts" />

QUnit.module("parseCellSelector", () => {
    QUnit.test("standart tests", (assert) => {
        assert.equal((<Core.SimpleCellSelector>Core.parseCellSelector("A1")).col, 0);
        assert.equal((<Core.SimpleCellSelector>Core.parseCellSelector("A1")).row, 1);
        assert.equal((<Core.SimpleCellSelector>Core.parseCellSelector("F123")).col, 5);
        assert.equal((<Core.SimpleCellSelector>Core.parseCellSelector("F123")).row, 123);

        assert.equal((<Core.RangeCellSelector>Core.parseCellSelector("A1-B2")).start.col, 0);
        assert.equal((<Core.RangeCellSelector>Core.parseCellSelector("A1-B2")).start.row, 1);
        assert.equal((<Core.RangeCellSelector>Core.parseCellSelector("A1-B2")).end.col, 1);
        assert.equal((<Core.RangeCellSelector>Core.parseCellSelector("A1-B2")).end.row, 2);
    });
    QUnit.test("error tests", (assert) => {
        assert.equal(Core.parseCellSelector(":("), null);
        assert.equal(Core.parseCellSelector("A "), null);
        assert.equal(Core.parseCellSelector("1A"), null);
        assert.equal(Core.parseCellSelector(""), null);
    });
});

QUnit.module("parse", () => {
    QUnit.test("test 1", (assert) => {
        const parsed = Core.parse(
            "A1: 1\n" +
            "B1: 2\n" +
            "B2: 123\n" +
            "C1: 3\n");
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 1), 1);
        assert.equal(parsed.tables["UNTITLED"].values.get(1, 1), 2);
        assert.equal(parsed.tables["UNTITLED"].values.get(2, 1), 3);
        assert.equal(parsed.tables["UNTITLED"].values.get(1, 2), 123);
    });

    QUnit.test("test 2 (csv)", (assert) => {
        const parsed = Core.parse(
            "A1: 1, 2, 3\n" +
            'A2: "abc,  def", "= 2 * 2", "xyz"\n');
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 1), 1);
        assert.equal(parsed.tables["UNTITLED"].values.get(1, 1), 2);
        assert.equal(parsed.tables["UNTITLED"].values.get(2, 1), 3);

        assert.equal(parsed.tables["UNTITLED"].values.get(0, 2), "abc,  def");
        assert.equal(parsed.tables["UNTITLED"].values.get(1, 2), "= 2 * 2");
        assert.equal(parsed.tables["UNTITLED"].values.get(2, 2), "xyz");
    });

    QUnit.test("test 3 (whitespace)", (assert) => {
        const parsed = Core.parse(
            "A1: 1\n" +
            "\n" +
            "   \n" +
            "   \n" +
            "\n" +
            "  # the comment\n" +
            "A2: 2\n\n\n" +
            "A3:3");
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 1), 1);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 2), 2);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 3), 3);
    });

    QUnit.test("Multiline initialize", (assert) => {
        let tokens = Core.tokenize(
            'VIEWBOX=A1-A2\n' +
            'A1: 123\n' +
            '--: 456\n'
        )
        let tree = Core.buildTree(tokens);
        const expect: Core.Tree = {
            sheets: {
                "UNTITLED": [
                    {
                        selector: Core.parseCellSelector("A1"), values: [{
                            type: Core.TreeValueType.Number, value: 123, src: "123"
                        }]
                    },
                    {
                        selector: Core.parseCellSelector("A2"), values: [{ type: Core.TreeValueType.Number, value: 456, src: "456" }]
                    }
                ]
            },
            viewbox: <Core.RangeCellSelector>Core.parseCellSelector("A1-A2")
        };
        assert.deepEqual(tree, expect);
    });

    QUnit.test("Multiline initialize", (assert) => {
        let calculated = Core.parse(
            `@A
A1: 1
A2: =B!A1+1
@B
A1: =A!A1 + 1`);
        assert.equal(calculated.tables["A"].values.get(0, 1), 1);
        assert.equal(calculated.tables["A"].values.get(0, 2), 3);
        assert.equal(calculated.tables["B"].values.get(0, 1), 2);
    });
});

QUnit.module("Calc tests", () => {
    QUnit.test("standart tests", (assert) => {
        // (1 + 2) * 3 = 9
        assert.equal(calcFormula(parseFormula(tokenizeFormula("(1 + 2) * 3", defaultLanguage))), 9)

        // 4 / 2 - (2 - 1) = 2 - 1 = 1
        assert.equal(calcFormula(parseFormula(tokenizeFormula("4 / 2 - (2 - 1)", defaultLanguage))), 1)
    });
});

QUnit.module("parse and calc", () => {
    QUnit.test("test 1", (assert) => {
        const parsed = Core.parse(
            "A1: banana\n" +
            "B1: 100\n" +
            "A2: bots\n" +
            "B2: 200\n" +
            "B10:=B1+B2\n");

        assert.equal(parsed.tables["UNTITLED"].values.get(1, 10), 300);
    });

    QUnit.test("range", (assert) => {
        const parsed = Core.parse(
            "A1: 1, 2, 3, 4 \n" +
            "A2-D2: =A1*2\n"
        );

        assert.equal(parsed.tables["UNTITLED"].values.get(0, 2), 2);
        assert.equal(parsed.tables["UNTITLED"].values.get(1, 2), 4);
        assert.equal(parsed.tables["UNTITLED"].values.get(2, 2), 6);
        assert.equal(parsed.tables["UNTITLED"].values.get(3, 2), 8);
    });

    QUnit.test("range power of 2", (assert) => {
        const parsed = Core.parse(
            "A1: 1\n" +
            "A2-A11: = A1*2\n"
        );

        assert.equal(parsed.tables["UNTITLED"].values.get(0, 1), 1);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 2), 2);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 3), 4);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 4), 8);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 5), 16);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 6), 32);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 7), 64);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 8), 128);
        assert.equal(parsed.tables["UNTITLED"].values.get(0, 11), 1024);
    });

    QUnit.test("range power of 2 (col)", (assert) => {
        const parsed = Core.parse(
            "A1: 1\n" +
            "B1-Z1: =A1*2\n"
        );

        assert.equal(parsed.tables["UNTITLED"].values.get(0, 1), 1);
        assert.equal(parsed.tables["UNTITLED"].values.get(1, 1), 2);
        assert.equal(parsed.tables["UNTITLED"].values.get(2, 1), 4);
        assert.equal(parsed.tables["UNTITLED"].values.get(3, 1), 8);
        assert.equal(parsed.tables["UNTITLED"].values.get(4, 1), 16);
        assert.equal(parsed.tables["UNTITLED"].values.get(5, 1), 32);
        assert.equal(parsed.tables["UNTITLED"].values.get(6, 1), 64);
        assert.equal(parsed.tables["UNTITLED"].values.get(7, 1), 128);
        assert.equal(parsed.tables["UNTITLED"].values.get(10, 1), 1024);
    });
});

QUnit.module("parse tokens", () => {
    QUnit.test("test 1", (assert) => {
        var tokens = Core.tokenize("A1: 1\n");

        assert.equal(tokens[0].type, Core.TokenType.cell);
        assert.equal(tokens[0].value, "A1");
        assert.equal(tokens[1].type, Core.TokenType.setter);
        assert.equal(tokens[2].type, Core.TokenType.space);
        assert.equal(tokens[2].value, " ");
        assert.equal(tokens[3].type, Core.TokenType.cell);
        assert.equal(tokens[3].value, "1");
        assert.equal(tokens[4].type, Core.TokenType.end);
    });

    QUnit.test("test 2", (assert) => {
        var tokens = Core.tokenize("A1-B2:   23\n");

        assert.equal(tokens[0].type, Core.TokenType.cell);
        assert.equal(tokens[0].value, "A1-B2");
        assert.equal(tokens[1].type, Core.TokenType.setter);
        assert.equal(tokens[2].type, Core.TokenType.space);
        assert.equal(tokens[2].value, "   ");
        assert.equal(tokens[3].type, Core.TokenType.cell);
        assert.equal(tokens[3].value, "23");
        assert.equal(tokens[4].type, Core.TokenType.end);
    });

    QUnit.test("test 3", (assert) => {
        var tokens = Core.tokenize("A1:=1 2 *\n");

        assert.equal(tokens[0].type, Core.TokenType.cell);
        assert.equal(tokens[0].value, "A1");
        assert.equal(tokens[1].type, Core.TokenType.setter);
        assert.equal(tokens[2].type, Core.TokenType.cell);
        assert.equal(tokens[2].value, "=1 2 *");
        assert.equal(tokens[3].type, Core.TokenType.end);
    });

    QUnit.test("test 3", (assert) => {
        var tokens = Core.tokenize('A1: "abc"');

        assert.equal(tokens[0].type, Core.TokenType.cell);
        assert.equal(tokens[0].value, "A1");
        assert.equal(tokens[1].type, Core.TokenType.setter);
        assert.equal(tokens[2].type, Core.TokenType.space);
        assert.equal(tokens[2].value, " ");
        assert.equal(tokens[3].type, Core.TokenType.text);
        assert.equal(tokens[3].value, "abc");
        assert.equal(tokens[4].type, Core.TokenType.end);
    });

    QUnit.test("test 4", (assert) => {
        var tokens = Core.tokenize(
            'A1: 1\n' +
            '@second\n' +
            'A1: 2\n'
        );

        assert.deepEqual(tokens, <Core.IToken[]>[
            { type: Core.TokenType.cell, value: "A1" },
            { type: Core.TokenType.setter, value: ":" },
            { type: Core.TokenType.space, value: " " },
            { type: Core.TokenType.cell, value: "1" },
            { type: Core.TokenType.end, value: "\n" },
            { type: Core.TokenType.page, value: "@second" },
            { type: Core.TokenType.end, value: "\n" },
            { type: Core.TokenType.cell, value: "A1" },
            { type: Core.TokenType.setter, value: ":" },
            { type: Core.TokenType.space, value: " " },
            { type: Core.TokenType.cell, value: "2" },
            { type: Core.TokenType.end, value: "\n" },
        ])
    });
});

QUnit.module("calc", () => {
    QUnit.test("test 1", (assert) => {
        var table = Core.calc({
            sheets: {
                "UNTITLED": [
                    {
                        selector: Core.parseCellSelector("A1"),
                        values: [
                            {
                                type: Core.TreeValueType.Number, value: 123, src: "123"
                            },
                            {
                                type: Core.TreeValueType.Expression, value: parseFormula(tokenizeFormula("=1+2+3", defaultLanguage)), src: "1+2+3"
                            },
                            { type: Core.TreeValueType.Text, value: "abc", src: "abc" }
                        ]
                    },
                ]
            },
            viewbox: null
        });

        assert.equal(table.tables["UNTITLED"].values.get(0, 1), 123);
        assert.equal(table.tables["UNTITLED"].values.get(1, 1), 6);
        assert.equal(table.tables["UNTITLED"].values.get(2, 1), "abc");
    });

    QUnit.test("range 1", (assert) => {
        var table = Core.calc({
            sheets: {
                "UNTITLED": [
                    {
                        selector: Core.parseCellSelector("A1-C1"),
                        values: [
                            { type: Core.TreeValueType.Number, value: 1, src: "1" },
                        ]
                    },
                ]
            },
            viewbox: null
        });

        assert.equal(table.tables["UNTITLED"].values.get(0, 1), 1);
        assert.equal(table.tables["UNTITLED"].values.get(1, 1), 1);
        assert.equal(table.tables["UNTITLED"].values.get(2, 1), 1);
    });

    QUnit.test("range 2", (assert) => {
        var table = Core.calc({
            sheets: {
                "UNTITLED": [
                    {
                        selector: Core.parseCellSelector("A1"),
                        values: [
                            { type: Core.TreeValueType.Number, value: 2, src: "A1" },
                        ]
                    },
                    {
                        selector: Core.parseCellSelector("A2-A10"),
                        values: [
                            { type: Core.TreeValueType.Expression, value: parseFormula(tokenizeFormula("=A1*2", defaultLanguage)), src: "A1*2" },
                        ]
                    },
                ]
            },
            viewbox: null
        });

        assert.equal(table.tables["UNTITLED"].values.get(0, 1), 2);
        assert.equal(table.tables["UNTITLED"].values.get(0, 2), 4);
        assert.equal(table.tables["UNTITLED"].values.get(0, 3), 8);
        assert.equal(table.tables["UNTITLED"].values.get(0, 8), 256);
        assert.equal(table.tables["UNTITLED"].values.get(0, 10), 1024);
    });
});

QUnit.module("parse tree", () => {
    QUnit.test("test 1", (assert) => {
        var tree = Core.buildTree(Core.tokenize(
            'A1: 123\n' +
            'A2: 321\n' +
            'B1: "abc"\n' +
            '# comment\n' +
            'C1: =A1 + A2'));
        var table = Core.calc(tree);

        assert.equal(table.tables["UNTITLED"].values.get(0, 1), 123);
        assert.equal(table.tables["UNTITLED"].values.get(1, 1), "abc");
        assert.equal(table.tables["UNTITLED"].values.get(2, 1), 123 + 321);
    });
});

QUnit.module("stream", () => {
    QUnit.test("getchar/pick/ungetchar", (assert) => {
        var stream = new TextStream("abc");
        assert.equal(stream.getchar(), 'a');
        assert.equal(stream.getchar(), 'b');
        stream.ungetchar();
        assert.equal(stream.pick(), 'a');
        assert.equal(stream.getchar(), 'b');
        assert.equal(stream.getchar(), 'c');
        assert.equal(stream.getchar(), null);
    });

    QUnit.test("save", (assert) => {
        var stream = new TextStream("abc");
        stream.getchar();
        stream.getchar();
        stream.ungetchar();
        stream.pick();
        assert.equal(stream.getchar(), 'b');
        var save = stream.save();
        stream.ungetchar();
        assert.equal(stream.pick(), 'a');
        stream.restore(save);
        assert.equal(stream.pick(), 'b');
    });
});


QUnit.module("xlsx", () => {
    QUnit.test("parse sheet", (assert) => {
        var done1 = assert.async();

        var file = new XMLHttpRequest();
        file.open("GET", "testFiles/sheet1.xml");
        file.send();
        file.onreadystatechange = () => {
            if (file.readyState == 4 && file.status == 200) {
                assert.equal(xlsx.parseSheet(file.responseText), `A2-C2: =A1+1\nA1: 1, 2, 3\n`);
                done1();
            }
        };
    });

    QUnit.test("parse xlsx", (assert) => {
        var done1 = assert.async();

        var file = new XMLHttpRequest();
        file.open("GET", "testFiles/sheet1.xlsx");
        file.responseType = "arraybuffer";
        file.send();
        file.onreadystatechange = () => {
            if (file.readyState == 4 && file.status == 200) {
                xlsx.parseXLSX(file.response, (value: string) => {
                    assert.equal(value, `@Sheet1\nB2-C2: =(B1+1)*2\nA1: 1, 2, 3\n\n`);
                    done1();
                })
            }
        };
    });
});