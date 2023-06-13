formula.AND = function () {
    var args = utils.flatten(arguments);
    var result = true;
    for (var i = 0; i < args.length; i++) {
        if (!args[i]) {
            result = false;
        }
    }
    return result;
};

formula.CHOOSE = function () {
    if (arguments.length < 2) {
        return error.na;
    }

    var index = arguments[0];
    if (index < 1 || index > 254) {
        return error.value;
    }

    if (arguments.length < index + 1) {
        return error.value;
    }

    return arguments[index];
};

formula.FALSE = function () {
    return false;
};

formula.IF = function (test, then_value, otherwise_value) {
    return test ? then_value : otherwise_value;
};

formula.IFERROR = function (value, valueIfError) {
    if (information.ISERROR(value)) {
        return valueIfError;
    }
    return value;
};

formula.IFNA = function (value, value_if_na) {
    return value === error.na ? value_if_na : value;
};

formula.NOT = function (logical) {
    return !logical;
};

formula.OR = function () {
    var args = utils.flatten(arguments);
    var result = false;
    for (var i = 0; i < args.length; i++) {
        if (args[i]) {
            result = true;
        }
    }
    return result;
};

formula.TRUE = function () {
    return true;
};

formula.XOR = function () {
    var args = utils.flatten(arguments);
    var result = 0;
    for (var i = 0; i < args.length; i++) {
        if (args[i]) {
            result++;
        }
    }
    return (Math.floor(Math.abs(result)) & 1) ? true : false;
};

formula.SWITCH = function () {
    var result;
    if (arguments.length > 0) {
        var targetValue = arguments[0];
        var argc = arguments.length - 1;
        var switchCount = Math.floor(argc / 2);
        var switchSatisfied = false;
        var defaultClause = argc % 2 === 0 ? null : arguments[arguments.length - 1];

        if (switchCount) {
            for (var index = 0; index < switchCount; index++) {
                if (targetValue === arguments[index * 2 + 1]) {
                    result = arguments[index * 2 + 2];
                    switchSatisfied = true;
                    break;
                }
            }
        }

        if (!switchSatisfied && defaultClause) {
            result = defaultClause;
        }
    }

    return result;
};