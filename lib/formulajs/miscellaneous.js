formula.UNIQUE = function () {
    var result = [];
    for (var i = 0; i < arguments.length; ++i) {
        var hasElement = false;
        var element = arguments[i];

        // Check if we've already seen this element.
        for (var j = 0; j < result.length; ++j) {
            hasElement = result[j] === element;
            if (hasElement) { break; }
        }

        // If we did not find it, add it to the result.
        if (!hasElement) {
            result.push(element);
        }
    }
    return result;
};

formula.FLATTEN = utils.flatten;

formula.ARGS2ARRAY = function () {
    return Array.prototype.slice.call(arguments, 0);
};

formula.REFERENCE = function (context, reference) {
    try {
        var path = reference.split('.');
        var result = context;
        for (var i = 0; i < path.length; ++i) {
            var step = path[i];
            if (step[step.length - 1] === ']') {
                var opening = step.indexOf('[');
                var index = step.substring(opening + 1, step.length - 1);
                result = result[step.substring(0, opening)][index];
            } else {
                result = result[step];
            }
        }
        return result;
    } catch (error) { }
};

formula.JOIN = function (array, separator) {
    return array.join(separator);
};

formula.NUMBERS = function () {
    var possibleNumbers = utils.flatten(arguments);
    return possibleNumbers.filter(function (el) {
        return typeof el === 'number';
    });
};

formula.NUMERAL = function (number, format) {
    return numeral(number).format(format);
};