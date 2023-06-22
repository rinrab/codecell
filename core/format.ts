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
        Text?: string;
    }

    interface FloatFormat {
        MinimumDigits: number | null;
        MaximumDigits: number | null;
        Text?: string;
    }

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
                MinimumDigits: 0
            }
        } else {
            const rv: IntegerFormat = { MinimumDigits: 0 };

            let firstText = "";
            let i = 0;
            while (i < text.length) {
                if (text[i] == '#' || text[i] == '0') {
                    break;
                } else {
                    firstText += text[i];
                    i++;
                }
            }
            if (firstText != "") {
                rv.Text = firstText;
            }

            text = text.slice(i);

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
                MinimumDigits: null
            };

            for (let i = 0; i < text.length; i++) {
                if (text[i] == '0') {
                    rv.MaximumDigits = i + 1;
                    rv.MinimumDigits = i + 1;
                } else if (text[i] == '#') {
                    rv.MaximumDigits = i + 1;
                } else if (text[i] == '?') {
                    rv.MaximumDigits = i + 1;
                } else if (text[i] == '@') {
                    rv.Text = "";
                    i++;
                    while (i < text.length) {
                        rv.Text += text[i];
                        i++;
                    }
                }
            }

            return rv;
        } else {
            return {
                MinimumDigits: 0,
                MaximumDigits: 0
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

            const str = formater.format(value);
            return str;
        } else {
            if (format.Text) {
                return value;
            } else {
                return value;
            }
        }
    }
}