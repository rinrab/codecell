declare namespace Core {
    interface Table<T> {
        data: T[][];
        set(x: number, y: number, value: T | null): void;
        get(x: number, y: number): T | null;
    }

    function parse(text: string): CalculatedTable;

    const alphabet: string;

    interface CellSelector {
        col: number, row: number, isColFixed: boolean, isRowFixed: boolean,
        isRange: boolean, start: CellSelector, end: CellSelector
    }

    function parseCellSelector(text: string): CellSelector;

    const enum TokenType {
        cell, setter, text, end, comment, comma, space, page
    }

    interface IToken {
        type: TokenType,
        value: string,
    }

    type IStyle = any;

    function renderStyle(value: any, style: IStyle): string;

    function tokenize(text: string): IToken[];

    const enum TreeValueType {
        Number,
        Text,
        Expression,
        Style
    }

    type Tree = {
        sheets:
        {
            [key: string]: {
                selector: CellSelector,
                values: { type: TreeValueType, value: any, src: string }[]
            }[]
        }
        viewbox: CellSelector | null;
    };

    function buildTree(tokens: IToken[]): Tree;

    function calc(tree: Tree): CalculatedTable;

    interface CalculatedTable {
        tables: {
            [key: string]: {
                values: Table<string | number | boolean>;
                formulas: Table<string>;
                styles: Table<IStyle>;
            }
        };
        viewbox: CellSelector | null;
    }
}

declare type Language = any;
declare function tokenizeFormula(text: string, language: Language): any;
declare function parseFormula(tokens: any): any;
declare function calcFormula(tree: any): string | number | boolean;
declare const defaultLanguage: Language;

declare class TextStream {
    constructor(text: string);
    getchar(): string;
    pick(): string;
    ungetchar(): void;
    save(): any;
    restore(pos: any): void;
}

declare type Formulas = {
    [key: string]: {
        func: ((...args: any[]) => any) | ((array: any[]) => any),
        argCount: number,
        maxArg?: number | null
    }
};

declare const formulas: Formulas;

declare namespace ExportTable {
    function MarkDown(table: Core.Table<string | number | boolean>, minify: boolean): string;
    function CSV(table: Core.Table<string | number | boolean>, minify: boolean): string;
}
