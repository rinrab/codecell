namespace Core {
    export interface CellFormat {
        PositiveNumber?: NumberFormat;
        NegativeNumber?: NumberFormat;
        Zero?: ZeroFormat;
        Text?: TextFormat;
    }

    interface NumberFormat {
        Integer: IntegerFormat;
        Float: FloatFormat;
    }

    interface IntegerFormat {
        MinimumDigits: number;
        ShowThousandSeparator?: true | undefined;
        Chars: IChar[];
    }

    interface FloatFormat {
        MinimumDigits: number | null;
        MaximumDigits: number | null;
        Chars: IChar[];
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

    const enum CharType {
        Digit,
        Char,
        Number
    }

    type IChar = DigitChar | TextChar | NumberChar;

    interface ZeroFormat {
        text: string;
    }

    interface TextFormat {

    }

    export function ParseFormat(text: string): CellFormat {
        const tokens = text.split(/;/g);

        if (tokens.length == 1) {
            return {
                PositiveNumber: ParseNumberFormat(tokens[0])
            }
        } else if (tokens.length == 2) {
            return {
                PositiveNumber: ParseNumberFormat(tokens[0]),
                NegativeNumber: ParseNumberFormat(tokens[1])
            }
        } else {
            throw new Error("Incorrect tokens count: " + tokens.length);
        }
    }

    function ParseNumberFormat(text: string): NumberFormat {
        const tokens = text.split('.');

        return {
            Integer: ParseIntegerFormat(tokens[0]),
            Float: ParseFloatFormat(tokens[1])
        }
    }

    function ParseIntegerFormat(text: string): IntegerFormat {
        if (text.length == 0) {
            return {
                MinimumDigits: 0,
                Chars: []
            }
        } else {
            const rv: IntegerFormat = { MinimumDigits: 0, Chars: [] };
            let i = 0;
            while (i < text.length) {
                if (text[i] == '#' || text[i] == '0') {
                    break;
                } else {
                    rv.Chars.push({
                        type: CharType.Char,
                        value: text[i]
                    });
                    i++;
                }
            }
            rv.Chars.push({
                type: CharType.Number
            });
            while (i < text.length) {
                if (text[i] == '#' || text[i] == '0') {
                    rv.Chars.push({
                        type: CharType.Digit
                    });
                } else if (text[i] == ',') {
                } else {
                    rv.Chars.push({
                        type: CharType.Char,
                        value: text[i]
                    });
                }
                i++;
            }
            rv.Chars.reverse();

            if (text[text.length - 1] == '0') {
                rv.MinimumDigits = 1;
            }

            if (text.search(/(#|0),(#|0)/) != -1) {
                rv.ShowThousandSeparator = true;
            }
            return rv;
        }
    }

    function ParseFloatFormat(text: string | undefined): FloatFormat {
        if (text) {
            const rv: FloatFormat = {
                MaximumDigits: null,
                MinimumDigits: null,
                Chars: []
            };

            for (let i = 0; i < text.length; i++) {
                if (text[i] == '0') {
                    rv.MaximumDigits = i + 1;
                    rv.MinimumDigits = i + 1;
                    rv.Chars.push({
                        type: CharType.Digit
                    })
                } else if (text[i] == '#') {
                    rv.MaximumDigits = i + 1;
                    rv.Chars.push({
                        type: CharType.Digit
                    })
                } else if (text[i] == '?') {
                    rv.MaximumDigits = i + 1;
                    rv.Chars.push({
                        type: CharType.Digit
                    })
                } else if (text[i] == '"') {
                    i++;
                    while (i < text.length) {
                        if (text[i] == '"') {
                            break;
                        } else {
                            rv.Chars.push({
                                type: CharType.Char,
                                value: text[i]
                            });
                            i++;
                        }
                    }
                } else {
                    rv.Chars.push({
                        type: CharType.Char,
                        value: text[i]
                    });
                }
            }

            return rv;
        } else {
            return {
                MinimumDigits: 0,
                MaximumDigits: 0,
                Chars: []
            }
        }
    }

    export function Format(format: CellFormat, value: number | string): string {
        if (typeof value == "number") {
            let numberFormat = (value < 0) ? format.NegativeNumber ||
                format.PositiveNumber : format.PositiveNumber;

            const formater = new Intl.NumberFormat("en-us", {
                useGrouping: numberFormat.Integer.ShowThousandSeparator || false,
                // minimumIntegerDigits: numberFormat.Integer.MinimumDigits,
                minimumFractionDigits: numberFormat.Float.MinimumDigits,
                maximumFractionDigits: numberFormat.Float.MaximumDigits,
            });

            let str = formater.format(value);
            const tokens = str.split(".");
            console.log(numberFormat);
            if (tokens.length == 1) {
                return applyChars(numberFormat.Integer.Chars, str)
            } else {
                return applyChars(numberFormat.Integer.Chars, tokens[0], true) + "."
                    + applyChars(numberFormat.Float.Chars, tokens[1]);
            }
        } else {
            if (format.Text) {
                return value;
            } else {
                return value;
            }
        }
    }

    function applyChars(chars: IChar[], value: string, reverse = false) {
        let rv = "";
        if (reverse) {
            value = value.split("").reverse().join("");
        }

        let valueIndex = 0;
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            if (char.type == CharType.Digit) {
                rv += value[valueIndex] || "";
                valueIndex++;
            } else if (char.type == CharType.Number) {
                rv += value.slice(valueIndex);
                valueIndex = value.length;
            } else {
                rv += char.value;
            }
        }

        while (valueIndex < value.length) {
            rv += value[valueIndex] || "";
            valueIndex++;
        }

        if (reverse) {
            return rv.split("").reverse().join("")
        } else {
            return rv;
        }
    }
}