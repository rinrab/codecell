namespace Core {
    export interface IStyle {
        background?: string;
        color?: string;
        borderColor?: string;
        border?: boolean;
        borderLeft?: boolean;
        borderRight?: boolean;
        borderTop?: boolean;
        borderBottom?: boolean;
        format?: (value: string | number | boolean) => string;
        presets?: (string)[];
        isBold?: boolean;
        isItalic?: boolean;
        fontFamily?: string;
        textDecoration?: string;
    }

    export const stylePresets: { [key: string]: IStyle } = {
        "usd": {
            format: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format
        },
        "euro": {
            format: new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
            }).format
        },
        "percent": {
            format: (val) => {
                return (Math.round((<number>val * 100 * 100)) / 100) + "%";
            }
        },
        "bold": {
            isBold: true
        },
        "italic": {
            isItalic: true
        },
        "code": {
            fontFamily: "monospace"
        },
        "underline": {
            textDecoration: "underline"
        },
    };

    export function parseStyle(text: string, style: IStyle): IStyle {
        const styles = text.split(/;/g);
        for (const item of styles) {
            const tokens = item.split(/:/g);
            const key = tokens[0].trim();
            if (tokens.length == 1) {
                if (stylePresets[key]) {
                    if (!style.presets) {
                        style.presets = [];
                    }
                    style.presets.push(key);
                }
            } else if (tokens.length == 2) {
                const value = (tokens[1] || "").trim();
                if (value.match(/([a-z]|[A-Z]|_|-)*/)[0] == value) {
                    if (key == "background" || key == "bg") {
                        style.background = value;
                    } else if (key == "color" || key == "c" || key == "foreground" ||
                        key == "fg" || key == "foreground-color") {
                        style.color = value;
                    }
                }
            }
        }
        return style;
    }


    function escapeHtml(str: string): string {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    export function renderStyle(value: any, style: IStyle): string {
        if (!style) {
            style = {};
        }
        const styles = [style];
        let css = "";
        for (const s of style.presets || []) {
            styles.push(stylePresets[s]);
        }
        function getStyleProperty(propertyName: string): null | any {
            for (const s of styles) {
                if ((<any>s)[propertyName]) {
                    return (<any>s)[propertyName];
                }
            }
            return null;
        }

        if (typeof value == "string") {
            value = escapeHtml(value);
        } else if (typeof value == "number") {
            const prop = <(val: number) => string>getStyleProperty("format");
            if (prop) {
                value = prop(value);
            }
        }
        if (getStyleProperty("isBold") == true) {
            css += "font-weight:bold;"
        }
        if (getStyleProperty("isItalic") == true) {
            css += "font-style:italic;"
        }
        if (getStyleProperty("fontFamily")) {
            css += "font-family:" + getStyleProperty("fontFamily") + ";";
        }
        if (getStyleProperty("textDecoration")) {
            css += "text-decoration:" + getStyleProperty("textDecoration") + ";";
        }
        if (value != null && value != undefined) {
            value = `<span style="${css}">${value}</span>`;
            return value;
        } else {
            return "";
        }
    }
}