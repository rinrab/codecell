function parseFormula(tokens: Token[]): Operator {
    const stream = createTokenStream(tokens);
    const shuntingYard = createShuntingYard();

    parseExpression(stream, shuntingYard);

    const retVal = shuntingYard.operands.top();
    if (retVal) {
        return retVal;
    } else {
        throw error.na;
    }
}

function parseExpression(stream: TokenStream, shuntingYard: ShuntingYard) {
    parseOperandExpression(stream, shuntingYard);

    let pos;
    while (true) {
        if (!stream.nextIsBinaryOperator()) {
            break;
        }
        if (pos === stream.pos()) {
            throw error.na;
        }
        pos = stream.pos();
        const next = stream.getNext();
        if (next) {
            pushOperator(createBinaryOperator(next.value), shuntingYard);
        }
        stream.consume();
        parseOperandExpression(stream, shuntingYard);
    }

    while (shuntingYard.operators.top() !== SENTINEL) {
        popOperator(shuntingYard);
    }
}

function parseOperandExpression(stream: TokenStream, shuntingYard: ShuntingYard) {
    if (stream.nextIsTerminal()) {
        shuntingYard.operands.push(parseTerminal(stream));
        // parseTerminal already consumes once so don't need to consume on line below
        // stream.consume()
    } else if (stream.nextIsOpenParen()) {
        stream.consume(); // open paren
        withinSentinel(shuntingYard, function () {
            parseExpression(stream, shuntingYard);
        });
        stream.consume(); // close paren
    } else if (stream.nextIsPrefixOperator()) {
        let unaryOperator = createUnaryOperator(stream.getNext().value);
        pushOperator(unaryOperator, shuntingYard);
        stream.consume();
        parseOperandExpression(stream, shuntingYard);
    } else if (stream.nextIsFunctionCall()) {
        parseFunctionCall(stream, shuntingYard);
    }
}

function parseFunctionCall(stream: TokenStream, shuntingYard: ShuntingYard) {
    const name = stream.getNext().value;
    stream.consume(); // consume start of function call

    const args = parseFunctionArgList(stream, shuntingYard);
    shuntingYard.operands.push(builder.functionCall(name, args));

    stream.consume(); // consume end of function call
}

function parseFunctionArgList(stream: TokenStream, shuntingYard: ShuntingYard): Operator[] {
    const reverseArgs: Operator[] = [];

    withinSentinel(shuntingYard, function () {
        let arity = 0;
        let pos;
        while (true) {
            if (stream.nextIsEndOfFunctionCall())
                break;
            if (pos === stream.pos()) {
                throw error.na;
            }
            pos = stream.pos();
            parseExpression(stream, shuntingYard);
            arity += 1;

            if (stream.nextIsFunctionArgumentSeparator()) {
                stream.consume();
            }
        }

        for (let i = 0; i < arity; i++) {
            reverseArgs.push(shuntingYard.operands.pop());
        }
    });

    return reverseArgs.reverse();
}

function withinSentinel(shuntingYard: ShuntingYard, fn: () => void) {
    shuntingYard.operators.push(SENTINEL);
    fn();
    shuntingYard.operators.pop();
}

function pushOperator(operator: Operator, shuntingYard: ShuntingYard) {
    while (shuntingYard.operators.top().evaluatesBefore(operator)) {
        popOperator(shuntingYard);
    }
    shuntingYard.operators.push(operator);
}

function popOperator(shuntingYard: ShuntingYard) {
    if (shuntingYard.operators.top().isBinary()) {
        const right = shuntingYard.operands.pop();
        const left = shuntingYard.operands.pop();
        const operator = shuntingYard.operators.pop();
        shuntingYard.operands.push(builder.binaryExpression(operator.symbol, left, right));
    } else if (shuntingYard.operators.top().isUnary()) {
        const operand = shuntingYard.operands.pop();
        const operator = shuntingYard.operators.pop();
        shuntingYard.operands.push(builder.unaryExpression(operator.symbol, operand));
    }
}

function parseTerminal(stream: TokenStream): Operator {
    if (stream.nextIsNumber()) {
        return parseNumber(stream);
    }

    if (stream.nextIsText()) {
        return parseText(stream);
    }

    if (stream.nextIsLogical()) {
        return parseLogical(stream);
    }

    if (stream.nextIsRange()) {
        return parseRange(stream);
    }
}

function parseRange(stream: TokenStream) {
    const next = stream.getNext();
    stream.consume();
    return createCellRange(next.value);
}

function createCellRange(value: string) {
    const parts = value.split(':');

    if (parts.length == 2) {
        return builder.cellRange(
            builder.cell(parts[0], cellRefType(parts[0])),
            builder.cell(parts[1], cellRefType(parts[1]))
        );
    } else {
        return builder.cell(value, cellRefType(value));
    }
}

enum CellRefType {
    Absolute,
    Mixed,
    Relative
}

function cellRefType(key: string): CellRefType {
    if (/^\$[A-Z]+\$\d+$/.test(key) ||
        /^\$[A-Z]+$/.test(key) ||
        /^\$\d+$/.test(key)) {
        return CellRefType.Absolute;
    }
    if (/^\$[A-Z]+\d+$/.test(key) ||
        /^[A-Z]+\$\d+$/.test(key)) {
        return CellRefType.Mixed;
    }
    if (/^[A-Z]+\d+$/.test(key) ||
        /^\d+$/.test(key) ||
        /^ [A - Z] + $ /.test(key)) {
        return CellRefType.Relative
    }
}

function parseText(stream: TokenStream): Operator {
    const next = stream.getNext();
    stream.consume();
    return builder.text(next.value);
}

function parseLogical(stream: TokenStream) {
    const next = stream.getNext();
    stream.consume();
    return builder.logical(next.value === 'TRUE');
}

function parseNumber(stream: TokenStream): Operator {
    let value = Number(stream.getNext().value);
    stream.consume();

    if (stream.nextIsPostfixOperator()) {
        value *= 0.01;
        stream.consume();
    }

    return builder.number(value);
}

function createUnaryOperator(symbol: string) {
    const precendence = {
        // negation
        '-': 7
    }[symbol];

    return createOperator(symbol, precendence, 1, true);
}

function createBinaryOperator(symbol: string) {
    const precendence = {
        // cell range union and intersect
        ' ': 8,
        ',': 8,
        // raise to power
        '^': 5,
        // multiply, divide
        '*': 4,
        '/': 4,
        // add, subtract
        '+': 3,
        '-': 3,
        // string concat
        '&': 2,
        // comparison
        '=': 1,
        '<>': 1,
        '<=': 1,
        '>=': 1,
        '>': 1,
        '<': 1
    }[symbol];

    return createOperator(symbol, precendence, 2, true);
}