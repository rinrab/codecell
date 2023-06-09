//TODO
formula.ASC = function () {
    throw new Error('ASC is not implemented');
};

//TODO
formula.BAHTTEXT = function () {
    throw new Error('BAHTTEXT is not implemented');
};

formula.CHAR = function (number) {
    number = utils.parseNumber(number);
    if (number instanceof Error) {
        return number;
    }
    return String.fromCharCode(number);
};

formula.CLEAN = function (text) {
    text = text || '';
    var re = /[\0-\x1F]/g;
    return text.replace(re, "");
};

formula.CODE = function (text) {
    text = text || '';
    return text.charCodeAt(0);
};

formula.CONCATENATE = function () {
    var args = utils.flatten(arguments);

    var trueFound = 0;
    while ((trueFound = args.indexOf(true)) > -1) {
        args[trueFound] = 'TRUE';
    }

    var falseFound = 0;
    while ((falseFound = args.indexOf(false)) > -1) {
        args[falseFound] = 'FALSE';
    }

    return args.join('');
};

//TODO
formula.DBCS = function () {
    throw new Error('DBCS is not implemented');
};

formula.DOLLAR = function (number, decimals) {
    decimals = (decimals === undefined) ? 2 : decimals;

    number = utils.parseNumber(number);
    decimals = utils.parseNumber(decimals);
    if (utils.anyIsError(number, decimals)) {
        return error.value;
    }
    var format = '';
    if (decimals <= 0) {
        number = Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
        format = '($0,0)';
    } else if (decimals > 0) {
        format = '($0,0.' + new Array(decimals + 1).join('0') + ')';
    }
    return numeral(number).format(format);
};

formula.EXACT = function (text1, text2) {
    return text1 === text2;
};

formula.FIND = function (find_text, within_text, position) {
    position = (position === undefined) ? 0 : position;
    return within_text ? within_text.indexOf(find_text, position - 1) + 1 : null;
};

formula.FIXED = function (number, decimals, no_commas) {
    decimals = (decimals === undefined) ? 2 : decimals;
    no_commas = (no_commas === undefined) ? false : no_commas;

    number = utils.parseNumber(number);
    decimals = utils.parseNumber(decimals);
    if (utils.anyIsError(number, decimals)) {
        return error.value;
    }

    var format = no_commas ? '0' : '0,0';
    if (decimals <= 0) {
        number = Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    } else if (decimals > 0) {
        format += '.' + new Array(decimals + 1).join('0');
    }
    return numeral(number).format(format);
};

formula.HTML2TEXT = function (value) {
    var result = '';

    if (value) {
        if (value instanceof Array) {
            value.forEach(function (line) {
                if (result !== '') {
                    result += '\n';
                }
                result += (line.replace(/<(?:.|\n)*?>/gm, ''));
            });
        } else {
            result = value.replace(/<(?:.|\n)*?>/gm, '');
        }
    }

    return result;
};

formula.LEFT = function (text, number) {
    number = (number === undefined) ? 1 : number;
    number = utils.parseNumber(number);
    if (number instanceof Error || typeof text !== 'string') {
        return error.value;
    }
    return text ? text.substring(0, number) : null;
};

formula.LEN = function (text) {
    if (arguments.length === 0) {
        return error.error;
    }

    if (typeof text === 'string') {
        return text ? text.length : 0;
    }

    if (text.length) {
        return text.length;
    }

    return error.value;
};

formula.LOWER = function (text) {
    if (typeof text !== 'string') {
        return error.value;
    }
    return text ? text.toLowerCase() : text;
};

formula.MID = function (text, start, number) {
    start = utils.parseNumber(start);
    number = utils.parseNumber(number);
    if (utils.anyIsError(start, number) || typeof text !== 'string') {
        return number;
    }

    var begin = start - 1;
    var end = begin + number;

    return text.substring(begin, end);
};

// TODO
formula.NUMBERVALUE = function (text, decimal_separator, group_separator) {
    decimal_separator = (typeof decimal_separator === 'undefined') ? '.' : decimal_separator;
    group_separator = (typeof group_separator === 'undefined') ? ',' : group_separator;
    return Number(text.replace(decimal_separator, '.').replace(group_separator, ''));
};

// TODO
formula.PRONETIC = function () {
    throw new Error('PRONETIC is not implemented');
};

formula.PROPER = function (text) {
    if (text === undefined || text.length === 0) {
        return error.value;
    }
    if (text === true) {
        text = 'TRUE';
    }
    if (text === false) {
        text = 'FALSE';
    }
    if (isNaN(text) && typeof text === 'number') {
        return error.value;
    }
    if (typeof text === 'number') {
        text = '' + text;
    }

    return text.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

formula.REGEXEXTRACT = function (text, regular_expression) {
    var match = text.match(new RegExp(regular_expression));
    return match ? (match[match.length > 1 ? match.length - 1 : 0]) : null;
};

formula.REGEXMATCH = function (text, regular_expression, full) {
    var match = text.match(new RegExp(regular_expression));
    return full ? match : !!match;
};

formula.REGEXREPLACE = function (text, regular_expression, replacement) {
    return text.replace(new RegExp(regular_expression), replacement);
};

formula.REPLACE = function (text, position, length, new_text) {
    position = utils.parseNumber(position);
    length = utils.parseNumber(length);
    if (utils.anyIsError(position, length) ||
        typeof text !== 'string' ||
        typeof new_text !== 'string') {
        return error.value;
    }
    return text.substr(0, position - 1) + new_text + text.substr(position - 1 + length);
};

formula.REPT = function (text, number) {
    number = utils.parseNumber(number);
    if (number instanceof Error) {
        return number;
    }
    return new Array(number + 1).join(text);
};

formula.RIGHT = function (text, number) {
    number = (number === undefined) ? 1 : number;
    number = utils.parseNumber(number);
    if (number instanceof Error) {
        return number;
    }
    return text ? text.substring(text.length - number) : null;
};

formula.SEARCH = function (find_text, within_text, position) {
    var foundAt;
    if (typeof find_text !== 'string' || typeof within_text !== 'string') {
        return error.value;
    }
    position = (position === undefined) ? 0 : position;
    foundAt = within_text.toLowerCase().indexOf(find_text.toLowerCase(), position - 1) + 1;
    return (foundAt === 0) ? error.value : foundAt;
};

formula.SPLIT = function (text, separator) {
    return text.split(separator);
};

formula.SUBSTITUTE = function (text, old_text, new_text, occurrence) {
    if (!text || !old_text || (!new_text && new_text !== '')) {
        return text;
    } else if (occurrence === undefined) {
        return text.replace(new RegExp(old_text, 'g'), new_text);
    } else {
        var index = 0;
        var i = 0;
        while (text.indexOf(old_text, index) > 0) {
            index = text.indexOf(old_text, index + 1);
            i++;
            if (i === occurrence) {
                return text.substring(0, index) + new_text + text.substring(index + old_text.length);
            }
        }
    }
};

formula.T = function (value) {
    return (typeof value === "string") ? value : '';
};

// TODO incomplete implementation
formula.TEXT = function (value, format) {
    value = utils.parseNumber(value);
    if (utils.anyIsError(value)) {
        return error.na;
    }

    return numeral(value).format(format);
};

formula.TRIM = function (text) {
    if (typeof text !== 'string') {
        return error.value;
    }
    return text.replace(/ +/g, ' ').trim();
};

formula.UNICHAR = formula.CHAR;

formula.UNICODE = formula.CODE;

formula.UPPER = function (text) {
    if (typeof text !== 'string') {
        return error.value;
    }
    return text.toUpperCase();
};

formula.VALUE = function (text) {
    if (typeof text !== 'string') {
        return error.value;
    }
    return numeral().unformat(text);
};