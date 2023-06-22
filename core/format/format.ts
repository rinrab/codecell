namespace Core {
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