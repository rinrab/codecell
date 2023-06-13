// TODO
formula.CELL = function () {
    throw new Error('CELL is not implemented');
};

formula.ERROR = {};
formula.ERROR.TYPE = function (error_val) {
    switch (error_val) {
        case error.nil: return 1;
        case error.div0: return 2;
        case error.value: return 3;
        case error.ref: return 4;
        case error.name: return 5;
        case error.num: return 6;
        case error.na: return 7;
        case error.data: return 8;
    }
    return error.na;
};

// TODO
formula.INFO = function () {
    throw new Error('INFO is not implemented');
};

formula.ISBLANK = function (value) {
    return value === null;
};

formula.ISBINARY = function (number) {
    return (/^[01]{1,10}$/).test(number);
};

formula.ISERR = function (value) {
    return ([error.value, error.ref, error.div0, error.num, error.name, error.nil]).indexOf(value) >= 0 ||
        (typeof value === 'number' && (isNaN(value) || !isFinite(value)));
};

formula.ISERROR = function (value) {
    return formula.ISERR(value) || value === error.na;
};

formula.ISEVEN = function (number) {
    return (Math.floor(Math.abs(number)) & 1) ? false : true;
};

// TODO
formula.ISFORMULA = function () {
    throw new Error('ISFORMULA is not implemented');
};

formula.ISLOGICAL = function (value) {
    return value === true || value === false;
};

formula.ISNA = function (value) {
    return value === error.na;
};

formula.ISNONTEXT = function (value) {
    return typeof (value) !== 'string';
};

formula.ISNUMBER = function (value) {
    return typeof (value) === 'number' && !isNaN(value) && isFinite(value);
};

formula.ISODD = function (number) {
    return (Math.floor(Math.abs(number)) & 1) ? true : false;
};

// TODO
formula.ISREF = function () {
    throw new Error('ISREF is not implemented');
};

formula.ISTEXT = function (value) {
    return typeof (value) === 'string';
};

formula.N = function (value) {
    if (this.ISNUMBER(value)) {
        return value;
    }
    if (value instanceof Date) {
        return value.getTime();
    }
    if (value === true) {
        return 1;
    }
    if (value === false) {
        return 0;
    }
    if (this.ISERROR(value)) {
        return value;
    }
    return 0;
};

formula.NA = function () {
    return error.na;
};


// TODO
formula.SHEET = function () {
    throw new Error('SHEET is not implemented');
};

// TODO
formula.SHEETS = function () {
    throw new Error('SHEETS is not implemented');
};

formula.TYPE = function (value) {
    if (this.ISNUMBER(value)) {
        return 1;
    }
    if (this.ISTEXT(value)) {
        return 2;
    }
    if (this.ISLOGICAL(value)) {
        return 4;
    }
    if (this.ISERROR(value)) {
        return 16;
    }
    if (Array.isArray(value)) {
        return 64;
    }
};