namespace Core {
    export function Format(format: CellFormat, value: number | string): string {
        if (typeof value == "number") {
            let numberFormat = (value < 0) ? format.NegativeNumber ||
                format.PositiveNumber : format.PositiveNumber;

            value /= numberFormat.Scale;

            const formater = new Intl.NumberFormat("en-us", {
                useGrouping: numberFormat.Integer.ShowThousandSeparator || false,
                minimumFractionDigits: numberFormat.Float.MinimumDigits,
                maximumFractionDigits: numberFormat.Float.MaximumDigits,
            });

            let str = formater.format(value);
            if (numberFormat.Integer.MinimumDigits == 0) {
                if (value == 0) {
                    str = ".";
                } else if (-1 < value && value < 1) {
                    str = str.replace(/^./, "");
                }
            }

            const tokens = str.split(".");
            if (tokens.length == 1) {
                return applyChars(numberFormat.Integer.Chars, str, true)
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