namespace Core {
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
        Scale?: number;
    }

    export interface IntegerFormat {
        MinimumDigits: number;
        ShowThousandSeparator?: true | undefined;
        Chars: IChar[];
        Scale?: number;
    }

    export interface FloatFormat {
        MinimumDigits: number | null;
        MaximumDigits: number | null;
        Chars: IChar[];
        Scale?: number;
    }

    interface DigitChar {
        type: CharType.Digit
    }

    interface TextChar {
        type: CharType.Char,
        value: string
    }

    interface NumberChar {
        type: CharType.Number
    }

    export enum CharType {
        Digit,
        Char,
        Number
    }

    export type IChar = DigitChar | TextChar | NumberChar;

    interface ZeroFormat {
        text: string;
    }

    interface TextFormat {
    }
}
