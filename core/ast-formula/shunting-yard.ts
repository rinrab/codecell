class Stack {
    items: Operator[];

    constructor() {
        this.items = [];
    }

    push(value: Operator): void {
        this.items.push(value);
    }

    pop(): Operator {
        return this.items.pop();
    }

    top(): Operator {
        return this.items[this.items.length - 1];
    }
}

type OperatorType = "binary-expression" | "unary-expression" | "cell" | "cell-range" | "function" | "number" | "text" | "logical";

interface Operator {
    symbol?: string,
    precendence?: number;
    operandCount?: number;
    leftAssociative?: boolean;
    type?: OperatorType;
    name?: string,
    refType?: CellRefType,
    operator?: string,
    operand?: Operator,
    value?: string | number | boolean,
    key?: string,
    isUnary?: () => boolean,
    isBinary?: () => boolean,
    evaluatesBefore?: (other: Operator) => boolean,
    arguments?: Operator[],
    left?: Operator,
    right?: Operator,
}

function createOperator(symbol: string, precendence: number, operandCount: number = 2, leftAssociative: boolean = true): Operator {
    if (operandCount < 1 || operandCount > 2) {
        throw new Error(`operandCount cannot be ${operandCount}, must be 1 or 2`);
    }

    return {
        symbol: symbol,
        precendence: precendence,
        operandCount: operandCount,
        leftAssociative: leftAssociative,
        isUnary(): boolean {
            return this.operandCount === 1;
        },
        isBinary(): boolean {
            return this.operandCount === 2;
        },
        evaluatesBefore(other: Operator): boolean {
            if (this === SENTINEL) return false;
            if (other === SENTINEL) return true;
            if (other.isUnary()) return false;

            if (this.isUnary()) {
                return this.precendence >= other.precendence;
            } else if (this.isBinary()) {
                if (this.precendence === other.precendence) {
                    return this.leftAssociative;
                } else {
                    return this.precendence > other.precendence;
                }
            }
        }
    }
}

const SENTINEL: Operator = createOperator('S', 0);

interface ShuntingYard {
    operands: Stack,
    operators: Stack
}

function createShuntingYard(): ShuntingYard {
    const operands = new Stack();
    const operators = new Stack();

    operators.push(SENTINEL);

    return { operands, operators };
}
