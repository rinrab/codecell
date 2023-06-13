namespace Core {
    export const enum TokenType {
        cell,
        setter,
        text,
        end,
        comment,
        comma,
        space,
        page
    }

    export interface IToken {
        type: TokenType,
        value: string,
    }

    export function tokenize(text: string): IToken[] {
        text = text.replace(/\n\r/, '\n').replace(/\t/, '    ');

        errors = [];
        const rv: IToken[] = [];

        let i = 0;
        while (i < text.length) {
            let space = "";
            while (i < text.length) {
                if (text[i] == ' ') {
                    i++;
                    space += ' ';
                } else {
                    break;
                }
            }
            if (space.length > 0) {
                rv.push({
                    type: TokenType.space,
                    value: space
                });
            }

            if (text[i] == '\n') {
                rv.push({
                    type: TokenType.end,
                    value: '\n'
                });
                i++;
                continue;
            }

            if (text[i] == '#') {
                i++;
                let comment = "#";
                while (i < text.length) {
                    if (text[i] == '\n') {
                        break;
                    } else {
                        comment += text[i];
                        i++;
                    }
                }
                rv.push({
                    type: TokenType.comment,
                    value: comment
                });
                rv.push({
                    type: TokenType.end,
                    value: '\n'
                });
                i++;
                continue;
            } else if (text[i] == '@') {
                i++;
                let page = "@";
                while (i < text.length) {
                    if (text[i] == '\n') {
                        break;
                    } else {
                        page += text[i];
                        i++;
                    }
                }
                rv.push({
                    type: TokenType.page,
                    value: page
                });
                rv.push({
                    type: TokenType.end,
                    value: '\n'
                });
                i++;
                continue;
            }

            // Selector
            let selector = "";
            while (i < text.length) {
                if (text[i] == ':') {
                    break;
                } else if (text[i] == '\n') {
                    break;
                } else {
                    selector += text[i];
                    i++;
                }
            }
            rv.push({
                type: TokenType.cell,
                value: selector
            });
            if (text[i] == '\n') {
                errors.push({
                    type: "Add ':' after cell selector. Index: " + i
                })
                rv.push({
                    type: TokenType.end,
                    value: '\n'
                });
                i++;
                continue;
            }
            if (i >= text.length) {
                rv.push({
                    type: TokenType.end,
                    value: '\n'
                });
                break;
            }
            rv.push({
                type: TokenType.setter,
                value: ':'
            });
            i++; // skip ':'

            // Values
            while (i < text.length) {
                let space = "";
                while (i < text.length) {
                    if (text[i] == ' ') {
                        i++;
                        space += ' ';
                    } else {
                        break;
                    }
                }
                if (space.length > 0) {
                    rv.push({
                        type: TokenType.space,
                        value: space
                    });
                }

                if (text[i] == '\n') {
                    break;
                } else if (text[i] == '"') {
                    i++; // skip quota
                    let value = "";
                    while (i < text.length) {
                        if (text[i] == '"' || text[i] == '\n') {
                            break;
                        } else {
                            value += text[i];
                            i++;
                        }
                    }
                    if (text[i] == '"') {
                        rv.push({
                            type: TokenType.text,
                            value: value
                        });
                    } else {
                        rv.push({
                            type: TokenType.cell,
                            value: '"' + value
                        });
                    }
                    i++; // skip quota
                } else {
                    let value = "";
                    let braketsLevel = 0;
                    while (i < text.length) {
                        if (text[i] == '\n') {
                            break;
                        } else if (text[i] == ',') {
                            if (braketsLevel <= 0) {
                                break;
                            }
                        } else if (text[i] == '(') {
                            braketsLevel++;
                        } else if (text[i] == ')') {
                            braketsLevel--;
                        } else if (text[i] == '[') {
                            braketsLevel++;
                        } else if (text[i] == ']') {
                            braketsLevel--;
                        }
                        value += text[i];
                        i++;
                    }
                    rv.push({
                        type: TokenType.cell,
                        value: value
                    });
                }
                if (text[i] == '\n' || i >= text.length) {
                    break;
                }
                rv.push({
                    type: TokenType.comma,
                    value: ','
                });
                i++;
            }

            rv.push({
                type: TokenType.end,
                value: '\n'
            });
            i++;
        }

        return rv;
    }
}