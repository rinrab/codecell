enum FormulaTokenType {
    Noop,
    Operand,
    Function,
    SubExpression,
    Argument,
    OpPre,
    OpIn,
    OpPost,
    WhiteSpace,
    WSpace,
    Unknown,
};

enum SubTokenType {
    Start,
    Stop,
    Text,
    Number,
    Logical,
    Error,
    Range,
    Math,
    Concat,
    Intersect,
    Union,
    Unknown
}

enum TokenValue {
    Array,
    ArrayRow,
    True,
    False,
}

interface Token {
    value: string,
    type: FormulaTokenType,
    subtype: SubTokenType
}

function createToken(value: string, type: FormulaTokenType, subtype: SubTokenType): Token {
    return { value, type, subtype };
}

class Tokens {
    items: Token[];
    index: number;

    constructor() {
        this.items = [];
        this.index = -1;
    }

    add(value: string, type: FormulaTokenType, subtype?: SubTokenType) {
        const token = createToken(value, type, subtype);
        this.addRef(token);
        return token;
    }

    addRef(token: Token): void {
        this.items.push(token);
    }

    reset(): void {
        this.index = -1;
    }

    BOF(): boolean {
        return this.index <= 0;
    }

    EOF(): boolean {
        return this.index >= this.items.length - 1;
    }

    moveNext(): boolean {
        if (this.EOF()) return false;
        this.index++;
        return true;
    }

    current(): Token | null {
        if (this.index == -1) return null;
        return this.items[this.index];
    }

    next(): Token | null {
        if (this.EOF()) return null;
        return this.items[this.index + 1];
    }

    previous(): Token | null {
        if (this.index < 1) return null;
        return this.items[this.index - 1];
    }

    toArray(): Token[] {
        return this.items;
    }
}

class TokenStack {
    items: Token[];

    constructor() {
        this.items = [];
    }

    push(token: Token) {
        this.items.push(token);
    }

    pop(name?: string) {
        const token = this.items.pop();
        return createToken(name || '', token.type, SubTokenType.Stop);
    }

    token(): Token | null {
        if (this.items.length > 0) {
            return this.items[this.items.length - 1];
        } else {
            return null;
        }
    }

    value(): string {
        return this.token() ? this.token().value : '';
    }

    type(): FormulaTokenType | null {
        return this.token() ? this.token().type : null;
    }

    subtype(): SubTokenType | null {
        return this.token() ? this.token().subtype : null;
    }
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

let defaultLanguage: Language = {
    true: 'TRUE',
    false: 'FALSE',
    verticalSeparator: ';',
    horizontalSeparator: ',',
    argumentSeparator: ',',
    decimalSeparator: '.',
    reformatNumberForJsParsing: function (n: string): string {
        return n;
    },
    isScientificNotation: function (token: string): boolean {
        return /^[1-9]{1}(\.[0-9]+)?E{1}$/.test(token);
    }
}

function tokenizeFormula(formula: string, language: Language): Token[] {
    var tokens = new Tokens();
    var tokenStack = new TokenStack();

    var offset = 0;
    var token: string | Token = '';

    var currentChar = function (): string {
        return formula.substr(offset, 1);
    };
    var doubleChar = function (): string {
        return formula.substr(offset, 2);
    };
    var nextChar = function (): string {
        return formula.substr(offset + 1, 1);
    };
    var EOF = function (): boolean {
        return offset >= formula.length;
    };
    var isPreviousNonDigitBlank = function (): boolean {
        var offsetCopy = offset;
        if (offsetCopy == 0) return true;

        while (offsetCopy > 0) {
            if (!/\d/.test(formula[offsetCopy])) {
                return /\s/.test(formula[offsetCopy]);
            }

            offsetCopy -= 1;
        }
        return false;
    };

    var isNextNonDigitTheRangeOperator = function () {
        var offsetCopy = offset;

        while (offsetCopy < formula.length) {
            if (!/\d/.test(formula[offsetCopy])) {
                return /:/.test(formula[offsetCopy]);
            }

            offsetCopy += 1;
        }
        return false;
    };

    var checkAndAddToken = function (value: string, type: FormulaTokenType, subtype?: SubTokenType): Token | false {
        const cleanedToken = value.replace(/(\r|\n)+/g, '');

        // Clear regardless
        token = '';

        if (cleanedToken.length > 0) {
            return tokens.add(cleanedToken, type, subtype);
        }

        return false;
    };

    var inString = false;
    var inPath = false;
    var inRange = false;
    var inError = false;
    var inNumeric = false;

    while (formula.length > 0) {
        if (formula.substr(0, 1) == ' ') {
            formula = formula.substr(1);
        } else {
            if (formula.substr(0, 1) == '=') {
                formula = formula.substr(1);
            }
            break;
        }
    }

    while (!EOF()) {
        // state-dependent character evaluation (order is important)

        // double-quoted strings
        // embeds are doubled
        // end marks token

        if (inString) {
            if (currentChar() == '"') {
                if (nextChar() == '"') {
                    token += '"';
                    offset += 1;
                } else {
                    inString = false;
                    tokens.add(token, FormulaTokenType.Operand, SubTokenType.Text);
                    token = '';
                }
            } else {
                token += currentChar();
            }
            offset += 1;
            continue;
        }

        // single-quoted strings (links)
        // embeds are double
        // end does not mark a token

        if (inPath) {
            if (currentChar() == "'") {
                if (nextChar() == "'") {
                    token += "'";
                    offset += 1;
                } else {
                    inPath = false;
                    token += "'";
                }
            } else {
                token += currentChar();
            }
            offset += 1;
            continue;
        }

        // bracked strings (range offset or linked workbook name)
        // no embeds (changed to "()" by Excel)
        // end does not mark a token

        if (inRange) {
            if (currentChar() == ']') {
                inRange = false;
            }
            token += currentChar();
            offset += 1;
            continue;
        }

        // error values
        // end marks a token, determined from absolute list of values

        if (inError) {
            token += currentChar();
            offset += 1;
            if (',#NULL!,#DIV/0!,#VALUE!,#REF!,#NAME?,#NUM!,#N/A,'.indexOf(',' + token + ',') != -1) {
                inError = false;
                tokens.add(token, FormulaTokenType.Operand, SubTokenType.Error);
                token = '';
            }
            continue;
        }


        if (inNumeric) {
            if ([language.decimalSeparator, 'E'].indexOf(currentChar()) != -1 || /\d/.test(currentChar())) {
                token += currentChar();

                offset += 1;
                continue;
            } else if ('+-'.indexOf(currentChar()) != -1 && language.isScientificNotation(token)) {
                token += currentChar();

                offset += 1;
                continue;
            } else {
                inNumeric = false;
                var jsValue = language.reformatNumberForJsParsing(token);
                tokens.add(jsValue, FormulaTokenType.Operand, SubTokenType.Number);
                token = '';
            }
        }

        // scientific notation check

        if ('+-'.indexOf(currentChar()) != -1) {
            if (token.length > 1) {
                if (language.isScientificNotation(token)) {
                    token += currentChar();
                    offset += 1;
                    continue;
                }
            }
        }

        // independent character evaulation (order not important)

        // function, subexpression, array parameters

        if (currentChar() == language.argumentSeparator && ["ARRAY", "ARRAYROW"].indexOf(tokenStack.value()) == -1) {
            checkAndAddToken(token, FormulaTokenType.Operand);

            if (tokenStack.type() == FormulaTokenType.Function) {
                tokens.add(',', FormulaTokenType.Argument);

                offset += 1;
                continue;
            }
        }

        if (currentChar() == language.horizontalSeparator) {
            checkAndAddToken(token, FormulaTokenType.Operand);

            if (tokenStack.type() == FormulaTokenType.Function) {
                tokens.add(',', FormulaTokenType.Argument);
            } else {
                tokens.add(currentChar(), FormulaTokenType.OpIn, SubTokenType.Union);
            }

            offset += 1;
            continue;
        }

        // establish state-dependent character evaluations

        if (/\d/.test(currentChar()) && (!token || isPreviousNonDigitBlank()) && !isNextNonDigitTheRangeOperator()) {
            inNumeric = true;
            token += currentChar();
            offset += 1;
            continue;
        }

        if (currentChar() == '"') {
            // not expected
            checkAndAddToken(token, FormulaTokenType.Unknown);

            inString = true;
            offset += 1;
            continue;
        }

        if (currentChar() == "'") {
            // not expected
            checkAndAddToken(token, FormulaTokenType.Unknown);

            token = "'";
            inPath = true;
            offset += 1;
            continue;
        }

        if (currentChar() == '[') {
            inRange = true;
            token += currentChar();
            offset += 1;
            continue;
        }

        if (currentChar() == '#') {
            // not expected
            checkAndAddToken(token, FormulaTokenType.Unknown);

            inError = true;
            token += currentChar();
            offset += 1;
            continue;
        }

        // mark start and end of arrays and array rows

        if (currentChar() == '{') {
            // not expected
            checkAndAddToken(token, FormulaTokenType.Unknown);

            tokenStack.push(tokens.add("ARRAY", FormulaTokenType.Function, SubTokenType.Start));
            tokenStack.push(tokens.add("ARRAYROW", FormulaTokenType.Function, SubTokenType.Start));
            offset += 1;
            continue;
        }

        if (currentChar() == language.verticalSeparator) {
            checkAndAddToken(token, FormulaTokenType.Function);

            tokens.addRef(tokenStack.pop("ARRAYROW"));

            if (tokenStack.type() == FormulaTokenType.Function) {
                tokens.add(';', FormulaTokenType.Argument);
            }

            tokenStack.push(tokens.add("ARRAYROW", FormulaTokenType.Function, SubTokenType.Start));
            offset += 1;
            continue;
        }

        if (currentChar() == '}') {
            checkAndAddToken(token, FormulaTokenType.Operand);

            tokens.addRef(tokenStack.pop("ARRAYROW"));
            tokens.addRef(tokenStack.pop("ARRAY"));
            offset += 1;
            continue;
        }

        // trim white-space

        if (currentChar() == ' ') {
            checkAndAddToken(token, FormulaTokenType.Operand);

            tokens.add(currentChar(), FormulaTokenType.WSpace);
            offset += 1;
            while (currentChar() == ' ' && !EOF()) {
                offset += 1;
            }
            continue;
        }

        // multi-character comparators

        if (',>=,<=,<>,'.indexOf(',' + doubleChar() + ',') != -1) {
            checkAndAddToken(token, FormulaTokenType.Operand);

            tokens.add(doubleChar(), FormulaTokenType.OpIn, SubTokenType.Logical);
            offset += 2;
            continue;
        }

        // standard infix operators

        if ('+-*/^&=><'.indexOf(currentChar()) != -1) {
            checkAndAddToken(token, FormulaTokenType.Operand);

            tokens.add(currentChar(), FormulaTokenType.OpIn);
            offset += 1;
            continue;
        }

        // standard postfix operators

        if ('%'.indexOf(currentChar()) != -1) {
            checkAndAddToken(token, FormulaTokenType.Operand);

            tokens.add(currentChar(), FormulaTokenType.OpPost);
            offset += 1;
            continue;
        }

        // start subexpression or function

        if (currentChar() == '(') {
            const newToken = checkAndAddToken(token, FormulaTokenType.Function, SubTokenType.Start);
            if (newToken) {
                tokenStack.push(newToken);
            } else {
                tokenStack.push(tokens.add('', FormulaTokenType.SubExpression, SubTokenType.Start));
            }
            offset += 1;
            continue;
        }

        // stop subexpression

        if (currentChar() == ')') {
            checkAndAddToken(token, FormulaTokenType.Operand);

            tokens.addRef(tokenStack.pop());
            offset += 1;
            continue;
        }

        // token accumulation

        token += currentChar();
        offset += 1;
    }

    // dump remaining accumulation
    checkAndAddToken(token, FormulaTokenType.Operand);

    // move all tokens to a new collection, excluding all unnecessary white-space tokens

    var tokens2 = new Tokens();

    while (tokens.moveNext()) {
        token = tokens.current();

        if (token.type == FormulaTokenType.WSpace) {
            if (tokens.BOF() || tokens.EOF()) {
                // no-op
            } else if (
                !(
                    (tokens.previous().type == FormulaTokenType.Function && tokens.previous().subtype == SubTokenType.Stop) ||
                    (tokens.previous().type == FormulaTokenType.SubExpression && tokens.previous().subtype == SubTokenType.Stop) ||
                    tokens.previous().type == FormulaTokenType.Operand
                )
            ) {
                // no-op
            } else if (
                !(
                    (tokens.next().type == FormulaTokenType.Function && tokens.next().subtype == SubTokenType.Start) ||
                    (tokens.next().type == FormulaTokenType.SubExpression && tokens.next().subtype == SubTokenType.Start) ||
                    tokens.next().type == FormulaTokenType.Operand
                )
            ) {
                // no-op
            } else {
                tokens2.add(token.value, FormulaTokenType.OpIn, SubTokenType.Intersect);
            }
            continue;
        }

        tokens2.addRef(token);
    }

    // switch infix "-" operator to prefix when appropriate, switch infix "+" operator to noop when appropriate, identify operand
    // and infix-operator subtypes, pull "@" from in front of function names

    while (tokens2.moveNext()) {
        token = tokens2.current();

        if (token.type == FormulaTokenType.OpIn && token.value == '-') {
            if (tokens2.BOF()) {
                token.type = FormulaTokenType.OpPre;
            } else if (
                (tokens2.previous().type == FormulaTokenType.Function && tokens2.previous().subtype == SubTokenType.Stop) ||
                (tokens2.previous().type == FormulaTokenType.SubExpression && tokens2.previous().subtype == SubTokenType.Stop) ||
                tokens2.previous().type == FormulaTokenType.OpPost ||
                tokens2.previous().type == FormulaTokenType.Operand
            ) {
                token.subtype = SubTokenType.Math;
            } else {
                token.type = FormulaTokenType.OpPre;
            }
            continue;
        }

        if (token.type == FormulaTokenType.OpIn && token.value == '+') {
            if (tokens2.BOF()) {
                token.type = FormulaTokenType.Noop;
            } else if ((tokens2.previous().type == FormulaTokenType.Function && tokens2.previous().subtype == SubTokenType.Stop) ||
                (tokens2.previous().type == FormulaTokenType.SubExpression && tokens2.previous().subtype == SubTokenType.Stop) ||
                tokens2.previous().type == FormulaTokenType.OpPost ||
                tokens2.previous().type == FormulaTokenType.Operand) {
                token.subtype = SubTokenType.Math;
            } else {
                token.type = FormulaTokenType.Noop;
            }
            continue;
        }

        if (token.type == FormulaTokenType.OpIn && token.subtype == null) {
            if ('<>='.indexOf(token.value.substr(0, 1)) != -1) {
                token.subtype = SubTokenType.Logical;
            } else if (token.value == '&') {
                token.subtype = SubTokenType.Concat;
            } else {
                token.subtype = SubTokenType.Math;
            }
            continue;
        }

        if (token.type == FormulaTokenType.Operand && token.subtype == null) {
            if (isNaN(Number(language.reformatNumberForJsParsing(token.value)))) {
                if (token.value == language.true) {
                    token.subtype = SubTokenType.Logical;
                    token.value = "TRUE";
                } else if (token.value == language.false) {
                    token.subtype = SubTokenType.Logical;
                    token.value = "FALSE";
                } else {
                    token.subtype = SubTokenType.Range;
                }
            } else {
                token.subtype = SubTokenType.Number;
                token.value = language.reformatNumberForJsParsing(token.value);
            }
            continue;
        }

        if (token.type == FormulaTokenType.Function) {
            if (token.value.substr(0, 1) == '@') {
                token.value = token.value.substr(1);
            }
            continue;
        }
    }

    tokens2.reset();

    // move all tokens to a new collection, excluding all noops

    tokens = new Tokens();

    while (tokens2.moveNext()) {
        if (tokens2.current().type != FormulaTokenType.Noop) {
            tokens.addRef(tokens2.current());
        }
    }

    tokens.reset();

    return tokens.toArray();
}
