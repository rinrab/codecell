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

function createTokenStream(tokens: Token[]): TokenStream {
    const arr: (Token | null)[] = [...tokens, null];
    let index = 0;

    let stream: TokenStream = {
        consume: function () {
            index += 1;
            if (index >= arr.length) {
                throw error.na;
            }
        },
        getNext(): Token {
            if (arr[index]) {
                return arr[index];
            } else {
                return { value: "", type: FormulaTokenType.Unknown, subtype: SubTokenType.Unknown }
            }
        },
        nextIs(type: FormulaTokenType, subtype?: SubTokenType): boolean {
            if (stream.getNext().type !== type) {
                return false;
            } else if (subtype && stream.getNext().subtype !== subtype) {
                return false;
            } else {
                return true;
            }
        },
        nextIsOpenParen(): boolean {
            return stream.nextIs(FormulaTokenType.SubExpression, SubTokenType.Start);
        },
        nextIsTerminal(): boolean {
            if (stream.nextIsNumber()) {
                return true;
            } else if (stream.nextIsText()) {
                return true;
            } else if (stream.nextIsLogical()) {
                return true;
            } else if (stream.nextIsRange()) {
                return true;
            } else {
                return false;
            }
        },
        nextIsFunctionCall(): boolean {
            return stream.nextIs(FormulaTokenType.Function, SubTokenType.Start);
        },
        nextIsFunctionArgumentSeparator(): boolean {
            return stream.nextIs(FormulaTokenType.Argument);
        },
        nextIsEndOfFunctionCall(): boolean {
            return stream.nextIs(FormulaTokenType.Function, SubTokenType.Stop);
        },
        nextIsBinaryOperator(): boolean {
            return stream.nextIs(FormulaTokenType.OpIn);
        },
        nextIsPrefixOperator(): boolean {
            return stream.nextIs(FormulaTokenType.OpPre);
        },
        nextIsPostfixOperator(): boolean {
            return stream.nextIs(FormulaTokenType.OpPost);
        },
        nextIsRange(): boolean {
            return stream.nextIs(FormulaTokenType.Operand, SubTokenType.Range);
        },
        nextIsNumber(): boolean {
            return stream.nextIs(FormulaTokenType.Operand, SubTokenType.Number);
        },
        nextIsText(): boolean {
            return stream.nextIs(FormulaTokenType.Operand, SubTokenType.Text);
        },
        nextIsLogical(): boolean {
            return stream.nextIs(FormulaTokenType.Operand, SubTokenType.Logical);
        },
        pos(): number {
            return index;
        }
    };
    return stream;
}