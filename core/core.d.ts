type TextStreamSave = number;
declare class TextStream {
    text: string;
    position: number;
    constructor(text: string);
    pick(): string | null;
    getchar(): string | null;
    ungetchar(): void;
    save(): TextStreamSave;
    restore(position: TextStreamSave): void;
}
declare namespace Core {
    const enum TokenType {
        cell = 0,
        setter = 1,
        text = 2,
        end = 3,
        comment = 4,
        comma = 5,
        space = 6,
        page = 7
    }
    interface IToken {
        type: TokenType;
        value: string;
    }
    function tokenize(text: string): IToken[];
}
declare namespace Core {
    const enum TreeValueType {
        Number = 0,
        Text = 1,
        Expression = 2,
        Style = 3
    }
    interface ITreeValue {
        type: TreeValueType;
        value: number | string | Operator;
        src: string | Token[];
    }
    interface ITreeItem {
        selector: CellSelector;
        values: ITreeValue[];
    }
    type Tree = {
        sheets: {
            [key: string]: ITreeItem[];
        };
        viewbox: RangeCellSelector | null;
    };
    function buildTree(tokens: Array<IToken>): Tree;
}
declare namespace Core {
    interface ExpressionTableCell {
        expression: Operator;
        offsetX: number;
        offsetY: number;
        value?: boolean | number | string;
        was?: boolean;
        isExpressionCell: true;
        text: string;
    }
    interface CalculatedTable {
        tables: {
            [key: string]: {
                values: Table<string | number | boolean>;
                formulas: Table<string>;
                styles: Table<IStyle>;
            };
        };
        viewbox: RangeCellSelector | null;
        errors: IError[];
    }
    function calc(tree: Tree): CalculatedTable;
}
declare namespace Core {
    const version = "0.2.1";
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    class Table<T> {
        data: (T | null)[][];
        constructor();
        set(x: number, y: number, val: any): null;
        get(x: number, y: number): T | null | string;
    }
    interface IError {
        type: string;
        text?: string;
    }
    let errors: IError[];
    function parse(text: string): CalculatedTable;
}
declare namespace Core {
    export interface CellFormat {
        PositiveNumber?: NumberFormat;
        NegativeNumber?: NumberFormat;
        Zero?: ZeroFormat;
        Text?: TextFormat;
    }
    export interface NumberFormat {
        Integer: IntegerFormat;
        Float: FloatFormat;
        Color: string;
        Scale: number;
    }
    export interface IntegerFormat {
        MinimumDigits: number;
        ShowThousandSeparator?: true | undefined;
        Chars: IChar[];
        Scale: number;
    }
    export interface FloatFormat {
        MinimumDigits: number | null;
        MaximumDigits: number | null;
        Chars: IChar[];
        Scale: number;
    }
    interface DigitChar {
        type: CharType.Digit;
    }
    interface TextChar {
        type: CharType.Char;
        value: string;
    }
    interface NumberChar {
        type: CharType.Number;
    }
    export enum CharType {
        Digit = 0,
        Char = 1,
        Number = 2
    }
    export type IChar = DigitChar | TextChar | NumberChar;
    interface ZeroFormat {
        text: string;
    }
    interface TextFormat {
    }
    export {};
}
declare namespace Core {
    function ParseFormat(text: string): CellFormat;
}
declare namespace Core {
    function Format(format: CellFormat, value: number | string): string;
}
declare namespace Core {
    interface IStyle {
        background?: string;
        color?: string;
        borderColor?: string;
        border?: boolean;
        borderLeft?: boolean;
        borderRight?: boolean;
        borderTop?: boolean;
        borderBottom?: boolean;
        format?: (value: string | number | boolean) => string;
        presets?: (string)[];
        isBold?: boolean;
        isItalic?: boolean;
        fontFamily?: string;
        textDecoration?: string;
    }
    const stylePresets: {
        [key: string]: IStyle;
    };
    function parseStyle(text: string, style: IStyle): IStyle;
    function renderStyle(value: any, style: IStyle): string;
}
declare namespace Core {
    interface SimpleCellSelector {
        col: number;
        isColFixed: boolean;
        row: number;
        isRowFixed: boolean;
        isRange: false;
        sheet?: string | null;
    }
    interface RangeCellSelector {
        start: SimpleCellSelector;
        end: SimpleCellSelector;
        isRange: true;
        sheet?: string | null;
    }
    type CellSelector = SimpleCellSelector | RangeCellSelector;
    function parseCellSelector(text: string): CellSelector | null;
    function cellSelectorToString(selector: CellSelector): string;
    interface CellCoards {
        col: number;
        row: number;
        offsetX: number;
        offsetY: number;
        sheet: string | null;
    }
    function getCellCoards(cellSelector: SimpleCellSelector | RangeCellSelector, offsetX?: number, offsetY?: number): CellCoards[];
}
declare enum FormulaTokenType {
    Noop = 0,
    Operand = 1,
    Function = 2,
    SubExpression = 3,
    Argument = 4,
    OpPre = 5,
    OpIn = 6,
    OpPost = 7,
    WhiteSpace = 8,
    WSpace = 9,
    Unknown = 10
}
declare enum SubTokenType {
    Start = 0,
    Stop = 1,
    Text = 2,
    Number = 3,
    Logical = 4,
    Error = 5,
    Range = 6,
    Math = 7,
    Concat = 8,
    Intersect = 9,
    Union = 10,
    Unknown = 11
}
declare enum TokenValue {
    Array = 0,
    ArrayRow = 1,
    True = 2,
    False = 3
}
interface Token {
    value: string;
    type: FormulaTokenType;
    subtype: SubTokenType;
}
declare function createToken(value: string, type: FormulaTokenType, subtype: SubTokenType): Token;
declare class Tokens {
    items: Token[];
    index: number;
    constructor();
    add(value: string, type: FormulaTokenType, subtype?: SubTokenType): Token;
    addRef(token: Token): void;
    reset(): void;
    BOF(): boolean;
    EOF(): boolean;
    moveNext(): boolean;
    current(): Token | null;
    next(): Token | null;
    previous(): Token | null;
    toArray(): Token[];
}
declare class TokenStack {
    items: Token[];
    constructor();
    push(token: Token): void;
    pop(name?: string): Token;
    token(): Token | null;
    value(): string;
    type(): FormulaTokenType | null;
    subtype(): SubTokenType | null;
}
interface Language {
    true: string;
    false: string;
    verticalSeparator: string;
    horizontalSeparator: string;
    argumentSeparator: string;
    decimalSeparator: string;
    reformatNumberForJsParsing: (n: string) => string;
    isScientificNotation: (token: string) => boolean;
}
declare let defaultLanguage: Language;
declare function tokenizeFormula(formula: string, language: Language): Token[];
interface TokenStream {
    consume(): void;
    getNext(): Token | null;
    nextIs(type: FormulaTokenType, subtype?: SubTokenType): boolean;
    nextIsOpenParen(): boolean;
    nextIsTerminal(): boolean;
    nextIsFunctionCall(): boolean;
    nextIsFunctionArgumentSeparator(): boolean;
    nextIsEndOfFunctionCall(): boolean;
    nextIsBinaryOperator(): boolean;
    nextIsPrefixOperator(): boolean;
    nextIsPostfixOperator(): boolean;
    nextIsRange(): boolean;
    nextIsNumber(): boolean;
    nextIsText(): boolean;
    nextIsLogical(): boolean;
    pos(): number;
}
declare function createTokenStream(tokens: Token[]): TokenStream;
declare class Stack {
    items: Operator[];
    constructor();
    push(value: Operator): void;
    pop(): Operator;
    top(): Operator;
}
type OperatorType = "binary-expression" | "unary-expression" | "cell" | "cell-range" | "function" | "number" | "text" | "logical";
interface Operator {
    symbol?: string;
    precendence?: number;
    operandCount?: number;
    leftAssociative?: boolean;
    type?: OperatorType;
    name?: string;
    refType?: CellRefType;
    operator?: string;
    operand?: Operator;
    value?: string | number | boolean;
    key?: string;
    isUnary?: () => boolean;
    isBinary?: () => boolean;
    evaluatesBefore?: (other: Operator) => boolean;
    arguments?: Operator[];
    left?: Operator;
    right?: Operator;
}
declare function createOperator(symbol: string, precendence: number, operandCount?: number, leftAssociative?: boolean): Operator;
declare const SENTINEL: Operator;
interface ShuntingYard {
    operands: Stack;
    operators: Stack;
}
declare function createShuntingYard(): ShuntingYard;
declare class builder {
    static cell(key: string, refType: CellRefType): Operator;
    static cellRange(leftCell: Operator, rightCell: Operator): Operator;
    static functionCall(name: string, args: Operator[]): Operator;
    static number(value: number): Operator;
    static text(value: string): Operator;
    static logical(value: boolean): Operator;
    static binaryExpression(operator: string, left: Operator, right: Operator): Operator;
    static unaryExpression(operator: string, expression: Operator): Operator;
}
declare function parseFormula(tokens: Token[]): Operator;
declare function parseExpression(stream: TokenStream, shuntingYard: ShuntingYard): void;
declare function parseOperandExpression(stream: TokenStream, shuntingYard: ShuntingYard): void;
declare function parseFunctionCall(stream: TokenStream, shuntingYard: ShuntingYard): void;
declare function parseFunctionArgList(stream: TokenStream, shuntingYard: ShuntingYard): Operator[];
declare function withinSentinel(shuntingYard: ShuntingYard, fn: () => void): void;
declare function pushOperator(operator: Operator, shuntingYard: ShuntingYard): void;
declare function popOperator(shuntingYard: ShuntingYard): void;
declare function parseTerminal(stream: TokenStream): Operator;
declare function parseRange(stream: TokenStream): Operator;
declare function createCellRange(value: string): Operator;
declare enum CellRefType {
    Absolute = 0,
    Mixed = 1,
    Relative = 2
}
declare function cellRefType(key: string): CellRefType;
declare function parseText(stream: TokenStream): Operator;
declare function parseLogical(stream: TokenStream): Operator;
declare function parseNumber(stream: TokenStream): Operator;
declare function createUnaryOperator(symbol: string): Operator;
declare function createBinaryOperator(symbol: string): Operator;
declare const formula: any;
declare function flattenShallow(array: any): any;
declare function isFlat(array: any): boolean;
declare namespace utils {
    function flatten(...args: any[]): any;
    function argsToArray(args: any): any;
    function numbers(...args: any[]): any;
    function cleanFloat(number: any): number;
    function parseBool(bool: any): boolean | Error;
    function parseNumber(string: any): number | Error;
    function parseNumberArray(arr: any): any;
    function parseMatrix(matrix: any): any;
    function parseDate(date: any): any;
    function parseDateArray(arr: any): any;
    function anyIsError(...args: any[]): boolean;
    function arrayValuesToNumbers(arr: any): any;
    function rest(array: any, idx: any): any;
    function initial(array: any, idx: any): any;
}
declare var d1900: Date;
declare namespace error {
    let nil: Error;
    let div0: Error;
    let value: Error;
    let ref: Error;
    let name: Error;
    let num: Error;
    let na: Error;
    let error: Error;
    let data: Error;
}
declare function compact(array: any): any;
declare function findResultIndex(database: any, criterias: any): number[];
declare function isLeapYear(year: any): boolean;
declare function daysBetween(start_date: any, end_date: any): number;
declare function serial(date: any): number;
declare var d1900: Date;
declare var WEEK_STARTS: number[];
declare var WEEK_TYPES: number[][];
declare var WEEKEND_TYPES: number[][];
declare function isValidBinaryNumber(number: any): boolean;
declare function validDate(d: any): boolean;
declare function ensureDate(d: any): Date;
declare var MEMOIZED_FACT: any[];
declare var SQRT2PI: number;
type ValueType = string | number | boolean | Date | Error | (string | number | boolean | Date)[];
interface FormulaCalcData {
    tables: {
        [key: string]: Core.Table<ValueType | Core.ExpressionTableCell>;
    };
    curTable: string;
    offsetX: number;
    offsetY: number;
}
declare function calcFormula(astTree: Operator, curTable?: string, tables?: {}, offsetX?: number, offsetY?: number): string | number | boolean | null;
declare function calcItem(operator: Operator, calcData: FormulaCalcData): ValueType;
declare function getValue(operator: Operator, calcData: FormulaCalcData): ValueType;
declare function calcBinaryExpression(left: Operator, operator: string, right: Operator, calcData: FormulaCalcData): ValueType;
declare function calcFunction(operator: Operator, calcData: FormulaCalcData): ValueType;
type ArgsFunction = (...args: ValueType[]) => ValueType;
type ArrayFunction = (array: ValueType[]) => ValueType;
type NoArgFunction = () => ValueType;
type Formulas = {
    [key: string]: ArgsFunction | ArrayFunction | NoArgFunction;
};
declare const formulas: Formulas;
declare namespace ExportTable {
    function MarkDown(table: Core.Table<string | number | boolean>, minify: boolean): string;
    function CSV(table: Core.Table<string | number | boolean | null>, minify: boolean, isFormulas: boolean): string;
}
declare let module: any;
