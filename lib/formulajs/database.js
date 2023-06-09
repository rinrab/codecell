function compact(array) {
    if (!array) { return array; }
    var result = [];
    for (var i = 0; i < array.length; ++i) {
        if (!array[i]) { continue; }
        result.push(array[i]);
    }
    return result;
}

formula.FINDFIELD = function (database, title) {
    var index = null;
    for (var i = 0; i < database.length; i++) {
        if (database[i][0] === title) {
            index = i;
            break;
        }
    }

    // Return error if the input field title is incorrect
    if (index == null) {
        return error.value;
    }
    return index;
};

function findResultIndex(database, criterias) {
    var matches = {};
    for (var i = 1; i < database[0].length; ++i) {
        matches[i] = true;
    }
    var maxCriteriaLength = criterias[0].length;
    for (i = 1; i < criterias.length; ++i) {
        if (criterias[i].length > maxCriteriaLength) {
            maxCriteriaLength = criterias[i].length;
        }
    }

    for (var k = 1; k < database.length; ++k) {
        for (var l = 1; l < database[k].length; ++l) {
            var currentCriteriaResult = false;
            var hasMatchingCriteria = false;
            for (var j = 0; j < criterias.length; ++j) {
                var criteria = criterias[j];
                if (criteria.length < maxCriteriaLength) {
                    continue;
                }

                var criteriaField = criteria[0];
                if (database[k][0] !== criteriaField) {
                    continue;
                }
                hasMatchingCriteria = true;
                for (var p = 1; p < criteria.length; ++p) {
                    currentCriteriaResult = currentCriteriaResult || eval(database[k][l] + criteria[p]);  // jshint ignore:line
                }
            }
            if (hasMatchingCriteria) {
                matches[l] = matches[l] && currentCriteriaResult;
            }
        }
    }

    var result = [];
    for (var n = 0; n < database[0].length; ++n) {
        if (matches[n]) {
            result.push(n - 1);
        }
    }
    return result;
}

// Database functions
formula.DAVERAGE = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var sum = 0;
    for (var i = 0; i < resultIndexes.length; i++) {
        sum += targetFields[resultIndexes[i]];
    }
    return resultIndexes.length === 0 ? error.div0 : sum / resultIndexes.length;
};

formula.DCOUNT = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var targetValues = [];
    for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
    }
    return stats.COUNT(targetValues);
};

formula.DCOUNTA = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var targetValues = [];
    for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
    }
    return stats.COUNTA(targetValues);
};

formula.DGET = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    // Return error if no record meets the criteria
    if (resultIndexes.length === 0) {
        return error.value;
    }
    // Returns the #NUM! error value because more than one record meets the
    // criteria
    if (resultIndexes.length > 1) {
        return error.num;
    }

    return targetFields[resultIndexes[0]];
};

formula.DMAX = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var maxValue = targetFields[resultIndexes[0]];
    for (var i = 1; i < resultIndexes.length; i++) {
        if (maxValue < targetFields[resultIndexes[i]]) {
            maxValue = targetFields[resultIndexes[i]];
        }
    }
    return maxValue;
};

formula.DMIN = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var minValue = targetFields[resultIndexes[0]];
    for (var i = 1; i < resultIndexes.length; i++) {
        if (minValue > targetFields[resultIndexes[i]]) {
            minValue = targetFields[resultIndexes[i]];
        }
    }
    return minValue;
};

formula.DPRODUCT = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var targetValues = [];
    for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
    }
    targetValues = compact(targetValues);
    var result = 1;
    for (i = 0; i < targetValues.length; i++) {
        result *= targetValues[i];
    }
    return result;
};

formula.DSTDEV = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var targetValues = [];
    for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
    }
    targetValues = compact(targetValues);
    return stats.STDEV.S(targetValues);
};

formula.DSTDEVP = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var targetValues = [];
    for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
    }
    targetValues = compact(targetValues);
    return stats.STDEV.P(targetValues);
};

formula.DSUM = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var targetValues = [];
    for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
    }
    return maths.SUM(targetValues);
};

formula.DVAR = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var targetValues = [];
    for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
    }
    return stats.VAR.S(targetValues);
};

formula.DVARP = function (database, field, criteria) {
    // Return error if field is not a number and not a string
    if (isNaN(field) && (typeof field !== "string")) {
        return error.value;
    }
    var resultIndexes = findResultIndex(database, criteria);
    var targetFields = [];
    if (typeof field === "string") {
        var index = formula.FINDFIELD(database, field);
        targetFields = utils.rest(database[index]);
    } else {
        targetFields = utils.rest(database[field]);
    }
    var targetValues = [];
    for (var i = 0; i < resultIndexes.length; i++) {
        targetValues[i] = targetFields[resultIndexes[i]];
    }
    return stats.VAR.P(targetValues);
};