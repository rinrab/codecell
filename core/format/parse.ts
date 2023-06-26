namespace Core {
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
        const colors = [
            "[Black]",
            "[Green]",
            "[White]",
            "[Blue]",
            "[Magenta]",
            "[Yellow]",
            "[Cyan]",
            "[Red]",
        ];

        const colorRegex = /(\[(?:(?!\]).)*(?:\]))/;
        let colorMatch = text.match(colorRegex);
        let color = null;
        if (colorMatch && colors.indexOf(colorMatch[0]) != -1) {
            color = colorMatch[0].replace(/\[|\]/g, "").toLowerCase();
            text = text.replace(colorRegex, "");
        }

        const tokens = text.split('.');

        const Integer = ParseIntegerFormat(tokens[0]);
        const Float = ParseFloatFormat(tokens[1]);

        return {
            Integer: Integer,
            Float: Float,
            Color: color,
            Scale: Integer.Scale * Float.Scale
        }
    }

    function ParseIntegerFormat(text: string): IntegerFormat {
        if (text.length == 0) {
            return {
                MinimumDigits: 0,
                Chars: []
            }
        } else {
            let scale = 1;
            const rv: IntegerFormat = { MinimumDigits: 0, Chars: [] };
            let i = 0;
            while (i < text.length) {
                if (text[i] == '#' || text[i] == '0') {
                    break;
                } else if (text[i] == ',') {
                    if (text[i - 1] != '#' && text[i - 1] != '0' ||
                        text[i + 1] != '#' && text[i + 1] != '0') {
                        scale *= 1000;
                    }
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
                    if (text[i - 1] != '#' && text[i - 1] != '0' ||
                        text[i + 1] != '#' && text[i + 1] != '0') {
                        scale *= 1000;
                    }
                } else {
                    rv.Chars.push({
                        type: CharType.Char,
                        value: text[i]
                    });
                }
                i++;
            }
            rv.Chars.reverse();
            rv.Scale = scale;

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
                Chars: [],
                Scale: 1
            };

            let scale = 1;
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
                } else if (text[i] == ',') {
                    scale *= 1000;
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

            rv.Scale = scale;

            return rv;
        } else {
            return {
                MinimumDigits: 0,
                MaximumDigits: 0,
                Chars: [],
                Scale: 1
            }
        }
    }
}