var SQRT2PI = 2.5066282746310002;

formula.AVEDEV = function () {
    var range = utils.parseNumberArray(utils.flatten(arguments));
    if (range instanceof Error) {
        return range;
    }
    return jStat.sum(jStat(range).subtract(jStat.mean(range)).abs()[0]) / range.length;
};

formula.AVERAGE = function () {
    var range = utils.numbers(utils.flatten(arguments));
    var n = range.length;
    var sum = 0;
    var count = 0;
    for (var i = 0; i < n; i++) {
        sum += range[i];
        count += 1;
    }
    return sum / count;
};

formula.AVERAGEA = function () {
    var range = utils.flatten(arguments);
    var n = range.length;
    var sum = 0;
    var count = 0;
    for (var i = 0; i < n; i++) {
        var el = range[i];
        if (typeof el === 'number') {
            sum += el;
        }
        if (el === true) {
            sum++;
        }
        if (el !== null) {
            count++;
        }
    }
    return sum / count;
};

formula.AVERAGEIF = function (range, criteria, average_range) {
    average_range = average_range || range;
    range = utils.flatten(range);
    average_range = utils.parseNumberArray(utils.flatten(average_range));
    if (average_range instanceof Error) {
        return average_range;
    }
    var average_count = 0;
    var result = 0;
    for (var i = 0; i < range.length; i++) {
        if (eval(range[i] + criteria)) { // jshint ignore:line
            result += average_range[i];
            average_count++;
        }
    }
    return result / average_count;
};

formula.AVERAGEIFS = function () {
    // Does not work with multi dimensional ranges yet!
    //http://office.microsoft.com/en-001/excel-help/averageifs-function-HA010047493.aspx
    var args = utils.argsToArray(arguments);
    var criteria = (args.length - 1) / 2;
    var range = utils.flatten(args[0]);
    var count = 0;
    var result = 0;
    for (var i = 0; i < range.length; i++) {
        var condition = '';
        for (var j = 0; j < criteria; j++) {
            condition += args[2 * j + 1][i] + args[2 * j + 2];
            if (j !== criteria - 1) {
                condition += '&&';
            }
        }
        if (eval(condition)) { // jshint ignore:line
            result += range[i];
            count++;
        }
    }

    var average = result / count;
    if (isNaN(average)) {
        return 0;
    } else {
        return average;
    }
};

formula.BETA = {};

formula.BETA.DIST = function (x, alpha, beta, cumulative, A, B) {
    if (arguments.length < 4) {
        return error.value;
    }

    A = (A === undefined) ? 0 : A;
    B = (B === undefined) ? 1 : B;

    x = utils.parseNumber(x);
    alpha = utils.parseNumber(alpha);
    beta = utils.parseNumber(beta);
    A = utils.parseNumber(A);
    B = utils.parseNumber(B);
    if (utils.anyIsError(x, alpha, beta, A, B)) {
        return error.value;
    }

    x = (x - A) / (B - A);
    return (cumulative) ? jStat.beta.cdf(x, alpha, beta) : jStat.beta.pdf(x, alpha, beta);
};

formula.BETA.INV = function (probability, alpha, beta, A, B) {
    A = (A === undefined) ? 0 : A;
    B = (B === undefined) ? 1 : B;

    probability = utils.parseNumber(probability);
    alpha = utils.parseNumber(alpha);
    beta = utils.parseNumber(beta);
    A = utils.parseNumber(A);
    B = utils.parseNumber(B);
    if (utils.anyIsError(probability, alpha, beta, A, B)) {
        return error.value;
    }

    return jStat.beta.inv(probability, alpha, beta) * (B - A) + A;
};

formula.BINOM = {};

formula.BINOM.DIST = function (successes, trials, probability, cumulative) {
    successes = utils.parseNumber(successes);
    trials = utils.parseNumber(trials);
    probability = utils.parseNumber(probability);
    cumulative = utils.parseNumber(cumulative);
    if (utils.anyIsError(successes, trials, probability, cumulative)) {
        return error.value;
    }
    return (cumulative) ? jStat.binomial.cdf(successes, trials, probability) : jStat.binomial.pdf(successes, trials, probability);
};

formula.BINOM.DIST.RANGE = function (trials, probability, successes, successes2) {
    successes2 = (successes2 === undefined) ? successes : successes2;

    trials = utils.parseNumber(trials);
    probability = utils.parseNumber(probability);
    successes = utils.parseNumber(successes);
    successes2 = utils.parseNumber(successes2);
    if (utils.anyIsError(trials, probability, successes, successes2)) {
        return error.value;
    }

    var result = 0;
    for (var i = successes; i <= successes2; i++) {
        result += mathTrig.COMBIN(trials, i) * Math.pow(probability, i) * Math.pow(1 - probability, trials - i);
    }
    return result;
};

formula.BINOM.INV = function (trials, probability, alpha) {
    trials = utils.parseNumber(trials);
    probability = utils.parseNumber(probability);
    alpha = utils.parseNumber(alpha);
    if (utils.anyIsError(trials, probability, alpha)) {
        return error.value;
    }

    var x = 0;
    while (x <= trials) {
        if (jStat.binomial.cdf(x, trials, probability) >= alpha) {
            return x;
        }
        x++;
    }
};

formula.CHISQ = {};

formula.CHISQ.DIST = function (x, k, cumulative) {
    x = utils.parseNumber(x);
    k = utils.parseNumber(k);
    if (utils.anyIsError(x, k)) {
        return error.value;
    }

    return (cumulative) ? jStat.chisquare.cdf(x, k) : jStat.chisquare.pdf(x, k);
};

formula.CHISQ.DIST.RT = function (x, k) {
    if (!x | !k) {
        return error.na;
    }

    if (x < 1 || k > Math.pow(10, 10)) {
        return error.num;
    }

    if ((typeof x !== 'number') || (typeof k !== 'number')) {
        return error.value;
    }

    return 1 - jStat.chisquare.cdf(x, k);
};

formula.CHISQ.INV = function (probability, k) {
    probability = utils.parseNumber(probability);
    k = utils.parseNumber(k);
    if (utils.anyIsError(probability, k)) {
        return error.value;
    }
    return jStat.chisquare.inv(probability, k);
};

formula.CHISQ.INV.RT = function (p, k) {
    if (!p | !k) {
        return error.na;
    }

    if (p < 0 || p > 1 || k < 1 || k > Math.pow(10, 10)) {
        return error.num;
    }

    if ((typeof p !== 'number') || (typeof k !== 'number')) {
        return error.value;
    }

    return jStat.chisquare.inv(1.0 - p, k);
};

formula.CHISQ.TEST = function (observed, expected) {
    if (arguments.length !== 2) {
        return error.na;
    }

    if ((!(observed instanceof Array)) || (!(expected instanceof Array))) {
        return error.value;
    }

    if (observed.length !== expected.length) {
        return error.value;
    }

    if (observed[0] && expected[0] &&
        observed[0].length !== expected[0].length) {
        return error.value;
    }

    var row = observed.length;
    var tmp, i, j;

    // Convert single-dimension array into two-dimension array
    for (i = 0; i < row; i++) {
        if (!(observed[i] instanceof Array)) {
            tmp = observed[i];
            observed[i] = [];
            observed[i].push(tmp);
        }
        if (!(expected[i] instanceof Array)) {
            tmp = expected[i];
            expected[i] = [];
            expected[i].push(tmp);
        }
    }

    var col = observed[0].length;
    var dof = (col === 1) ? row - 1 : (row - 1) * (col - 1);
    var xsqr = 0;
    var Pi = Math.PI;

    for (i = 0; i < row; i++) {
        for (j = 0; j < col; j++) {
            xsqr += Math.pow((observed[i][j] - expected[i][j]), 2) / expected[i][j];
        }
    }

    // Get independency by X square and its degree of freedom
    function ChiSq(xsqr, dof) {
        var p = Math.exp(-0.5 * xsqr);
        if ((dof % 2) === 1) {
            p = p * Math.sqrt(2 * xsqr / Pi);
        }
        var k = dof;
        while (k >= 2) {
            p = p * xsqr / k;
            k = k - 2;
        }
        var t = p;
        var a = dof;
        while (t > 0.0000000001 * p) {
            a = a + 2;
            t = t * xsqr / a;
            p = p + t;
        }
        return 1 - p;
    }

    return Math.round(ChiSq(xsqr, dof) * 1000000) / 1000000;
};

formula.COLUMN = function (matrix, index) {
    if (arguments.length !== 2) {
        return error.na;
    }

    if (index < 0) {
        return error.num;
    }

    if (!(matrix instanceof Array) || (typeof index !== 'number')) {
        return error.value;
    }

    if (matrix.length === 0) {
        return undefined;
    }

    return jStat.col(matrix, index);
};

formula.COLUMNS = function (matrix) {
    if (arguments.length !== 1) {
        return error.na;
    }

    if (!(matrix instanceof Array)) {
        return error.value;
    }

    if (matrix.length === 0) {
        return 0;
    }

    return jStat.cols(matrix);
};

formula.CONFIDENCE = {};

formula.CONFIDENCE.NORM = function (alpha, sd, n) {
    alpha = utils.parseNumber(alpha);
    sd = utils.parseNumber(sd);
    n = utils.parseNumber(n);
    if (utils.anyIsError(alpha, sd, n)) {
        return error.value;
    }
    return jStat.normalci(1, alpha, sd, n)[1] - 1;
};

formula.CONFIDENCE.T = function (alpha, sd, n) {
    alpha = utils.parseNumber(alpha);
    sd = utils.parseNumber(sd);
    n = utils.parseNumber(n);
    if (utils.anyIsError(alpha, sd, n)) {
        return error.value;
    }
    return jStat.tci(1, alpha, sd, n)[1] - 1;
};

formula.CORREL = function (array1, array2) {
    array1 = utils.parseNumberArray(utils.flatten(array1));
    array2 = utils.parseNumberArray(utils.flatten(array2));
    if (utils.anyIsError(array1, array2)) {
        return error.value;
    }
    return jStat.corrcoeff(array1, array2);
};

formula.COUNT = function () {
    return utils.numbers(utils.flatten(arguments)).length;
};

formula.COUNTA = function () {
    var range = utils.flatten(arguments);
    return range.length - formula.COUNTBLANK(range);
};

formula.COUNTIN = function (range, value) {
    var result = 0;
    for (var i = 0; i < range.length; i++) {
        if (range[i] === value) {
            result++;
        }
    }
    return result;
};


formula.COUNTBLANK = function () {
    var range = utils.flatten(arguments);
    var blanks = 0;
    var element;
    for (var i = 0; i < range.length; i++) {
        element = range[i];
        if (element === null || element === '') {
            blanks++;
        }
    }
    return blanks;
};

formula.COUNTIF = function (range, criteria) {
    range = utils.flatten(range);
    if (!/[<>=!]/.test(criteria)) {
        criteria = '=="' + criteria + '"';
    }
    var matches = 0;
    for (var i = 0; i < range.length; i++) {
        if (typeof range[i] !== 'string') {
            if (eval(range[i] + criteria)) { // jshint ignore:line
                matches++;
            }
        } else {
            if (eval('"' + range[i] + '"' + criteria)) { // jshint ignore:line
                matches++;
            }
        }
    }
    return matches;
};

formula.COUNTIFS = function () {
    var args = utils.argsToArray(arguments);
    var results = new Array(utils.flatten(args[0]).length);
    for (var i = 0; i < results.length; i++) {
        results[i] = true;
    }
    for (i = 0; i < args.length; i += 2) {
        var range = utils.flatten(args[i]);
        var criteria = args[i + 1];
        if (!/[<>=!]/.test(criteria)) {
            criteria = '=="' + criteria + '"';
        }
        for (var j = 0; j < range.length; j++) {
            if (typeof range[j] !== 'string') {
                results[j] = results[j] && eval(range[j] + criteria); // jshint ignore:line
            } else {
                results[j] = results[j] && eval('"' + range[j] + '"' + criteria); // jshint ignore:line
            }
        }
    }
    var result = 0;
    for (i = 0; i < results.length; i++) {
        if (results[i]) {
            result++;
        }
    }
    return result;
};

formula.COUNTUNIQUE = function () {
    return misc.UNIQUE.apply(null, utils.flatten(arguments)).length;
};

formula.COVARIANCE = {};

formula.COVARIANCE.P = function (array1, array2) {
    array1 = utils.parseNumberArray(utils.flatten(array1));
    array2 = utils.parseNumberArray(utils.flatten(array2));
    if (utils.anyIsError(array1, array2)) {
        return error.value;
    }
    var mean1 = jStat.mean(array1);
    var mean2 = jStat.mean(array2);
    var result = 0;
    var n = array1.length;
    for (var i = 0; i < n; i++) {
        result += (array1[i] - mean1) * (array2[i] - mean2);
    }
    return result / n;
};

formula.COVARIANCE.S = function (array1, array2) {
    array1 = utils.parseNumberArray(utils.flatten(array1));
    array2 = utils.parseNumberArray(utils.flatten(array2));
    if (utils.anyIsError(array1, array2)) {
        return error.value;
    }
    return jStat.covariance(array1, array2);
};

formula.DEVSQ = function () {
    var range = utils.parseNumberArray(utils.flatten(arguments));
    if (range instanceof Error) {
        return range;
    }
    var mean = jStat.mean(range);
    var result = 0;
    for (var i = 0; i < range.length; i++) {
        result += Math.pow((range[i] - mean), 2);
    }
    return result;
};

formula.EXPON = {};

formula.EXPON.DIST = function (x, lambda, cumulative) {
    x = utils.parseNumber(x);
    lambda = utils.parseNumber(lambda);
    if (utils.anyIsError(x, lambda)) {
        return error.value;
    }
    return (cumulative) ? jStat.exponential.cdf(x, lambda) : jStat.exponential.pdf(x, lambda);
};

formula.F = {};

formula.F.DIST = function (x, d1, d2, cumulative) {
    x = utils.parseNumber(x);
    d1 = utils.parseNumber(d1);
    d2 = utils.parseNumber(d2);
    if (utils.anyIsError(x, d1, d2)) {
        return error.value;
    }
    return (cumulative) ? jStat.centralF.cdf(x, d1, d2) : jStat.centralF.pdf(x, d1, d2);
};

formula.F.DIST.RT = function (x, d1, d2) {
    if (arguments.length !== 3) {
        return error.na;
    }

    if (x < 0 || d1 < 1 || d2 < 1) {
        return error.num;
    }

    if ((typeof x !== 'number') || (typeof d1 !== 'number') || (typeof d2 !== 'number')) {
        return error.value;
    }

    return 1 - jStat.centralF.cdf(x, d1, d2);
};

formula.F.INV = function (probability, d1, d2) {
    probability = utils.parseNumber(probability);
    d1 = utils.parseNumber(d1);
    d2 = utils.parseNumber(d2);
    if (utils.anyIsError(probability, d1, d2)) {
        return error.value;
    }
    if (probability <= 0.0 || probability > 1.0) {
        return error.num;
    }

    return jStat.centralF.inv(probability, d1, d2);
};

formula.F.INV.RT = function (p, d1, d2) {
    if (arguments.length !== 3) {
        return error.na;
    }

    if (p < 0 || p > 1 || d1 < 1 || d1 > Math.pow(10, 10) || d2 < 1 || d2 > Math.pow(10, 10)) {
        return error.num;
    }

    if ((typeof p !== 'number') || (typeof d1 !== 'number') || (typeof d2 !== 'number')) {
        return error.value;
    }

    return jStat.centralF.inv(1.0 - p, d1, d2);
};

formula.F.TEST = function (array1, array2) {
    if (!array1 || !array2) {
        return error.na;
    }

    if (!(array1 instanceof Array) || !(array2 instanceof Array)) {
        return error.na;
    }

    if (array1.length < 2 || array2.length < 2) {
        return error.div0;
    }

    var sumOfSquares = function (values, x1) {
        var sum = 0;
        for (var i = 0; i < values.length; i++) {
            sum += Math.pow((values[i] - x1), 2);
        }
        return sum;
    };

    var x1 = mathTrig.SUM(array1) / array1.length;
    var x2 = mathTrig.SUM(array2) / array2.length;
    var sum1 = sumOfSquares(array1, x1) / (array1.length - 1);
    var sum2 = sumOfSquares(array2, x2) / (array2.length - 1);

    return sum1 / sum2;
};

formula.FISHER = function (x) {
    x = utils.parseNumber(x);
    if (x instanceof Error) {
        return x;
    }
    return Math.log((1 + x) / (1 - x)) / 2;
};

formula.FISHERINV = function (y) {
    y = utils.parseNumber(y);
    if (y instanceof Error) {
        return y;
    }
    var e2y = Math.exp(2 * y);
    return (e2y - 1) / (e2y + 1);
};

formula.FORECAST = function (x, data_y, data_x) {
    x = utils.parseNumber(x);
    data_y = utils.parseNumberArray(utils.flatten(data_y));
    data_x = utils.parseNumberArray(utils.flatten(data_x));
    if (utils.anyIsError(x, data_y, data_x)) {
        return error.value;
    }
    var xmean = jStat.mean(data_x);
    var ymean = jStat.mean(data_y);
    var n = data_x.length;
    var num = 0;
    var den = 0;
    for (var i = 0; i < n; i++) {
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den += Math.pow(data_x[i] - xmean, 2);
    }
    var b = num / den;
    var a = ymean - b * xmean;
    return a + b * x;
};

formula.FREQUENCY = function (data, bins) {
    data = utils.parseNumberArray(utils.flatten(data));
    bins = utils.parseNumberArray(utils.flatten(bins));
    if (utils.anyIsError(data, bins)) {
        return error.value;
    }
    var n = data.length;
    var b = bins.length;
    var r = [];
    for (var i = 0; i <= b; i++) {
        r[i] = 0;
        for (var j = 0; j < n; j++) {
            if (i === 0) {
                if (data[j] <= bins[0]) {
                    r[0] += 1;
                }
            } else if (i < b) {
                if (data[j] > bins[i - 1] && data[j] <= bins[i]) {
                    r[i] += 1;
                }
            } else if (i === b) {
                if (data[j] > bins[b - 1]) {
                    r[b] += 1;
                }
            }
        }
    }
    return r;
};


formula.GAMMA = function (number) {
    number = utils.parseNumber(number);
    if (number instanceof Error) {
        return number;
    }

    if (number === 0) {
        return error.num;
    }

    if (parseInt(number, 10) === number && number < 0) {
        return error.num;
    }

    return jStat.gammafn(number);
};

formula.GAMMA.DIST = function (value, alpha, beta, cumulative) {
    if (arguments.length !== 4) {
        return error.na;
    }

    if (value < 0 || alpha <= 0 || beta <= 0) {
        return error.value;
    }

    if ((typeof value !== 'number') || (typeof alpha !== 'number') || (typeof beta !== 'number')) {
        return error.value;
    }

    return cumulative ? jStat.gamma.cdf(value, alpha, beta, true) : jStat.gamma.pdf(value, alpha, beta, false);
};

formula.GAMMA.INV = function (probability, alpha, beta) {
    if (arguments.length !== 3) {
        return error.na;
    }

    if (probability < 0 || probability > 1 || alpha <= 0 || beta <= 0) {
        return error.num;
    }

    if ((typeof probability !== 'number') || (typeof alpha !== 'number') || (typeof beta !== 'number')) {
        return error.value;
    }

    return jStat.gamma.inv(probability, alpha, beta);
};

formula.GAMMALN = function (number) {
    number = utils.parseNumber(number);
    if (number instanceof Error) {
        return number;
    }
    return jStat.gammaln(number);
};

formula.GAMMALN.PRECISE = function (x) {
    if (arguments.length !== 1) {
        return error.na;
    }

    if (x <= 0) {
        return error.num;
    }

    if (typeof x !== 'number') {
        return error.value;
    }

    return jStat.gammaln(x);
};

formula.GAUSS = function (z) {
    z = utils.parseNumber(z);
    if (z instanceof Error) {
        return z;
    }
    return jStat.normal.cdf(z, 0, 1) - 0.5;
};

formula.GEOMEAN = function () {
    var args = utils.parseNumberArray(utils.flatten(arguments));
    if (args instanceof Error) {
        return args;
    }
    return jStat.geomean(args);
};

formula.GROWTH = function (known_y, known_x, new_x, use_const) {
    // Credits: Ilmari Karonen (http://stackoverflow.com/questions/14161990/how-to-implement-growth-function-in-javascript)

    known_y = utils.parseNumberArray(known_y);
    if (known_y instanceof Error) {
        return known_y;
    }

    // Default values for optional parameters:
    var i;
    if (known_x === undefined) {
        known_x = [];
        for (i = 1; i <= known_y.length; i++) {
            known_x.push(i);
        }
    }
    if (new_x === undefined) {
        new_x = [];
        for (i = 1; i <= known_y.length; i++) {
            new_x.push(i);
        }
    }

    known_x = utils.parseNumberArray(known_x);
    new_x = utils.parseNumberArray(new_x);
    if (utils.anyIsError(known_x, new_x)) {
        return error.value;
    }


    if (use_const === undefined) {
        use_const = true;
    }

    // Calculate sums over the data:
    var n = known_y.length;
    var avg_x = 0;
    var avg_y = 0;
    var avg_xy = 0;
    var avg_xx = 0;
    for (i = 0; i < n; i++) {
        var x = known_x[i];
        var y = Math.log(known_y[i]);
        avg_x += x;
        avg_y += y;
        avg_xy += x * y;
        avg_xx += x * x;
    }
    avg_x /= n;
    avg_y /= n;
    avg_xy /= n;
    avg_xx /= n;

    // Compute linear regression coefficients:
    var beta;
    var alpha;
    if (use_const) {
        beta = (avg_xy - avg_x * avg_y) / (avg_xx - avg_x * avg_x);
        alpha = avg_y - beta * avg_x;
    } else {
        beta = avg_xy / avg_xx;
        alpha = 0;
    }

    // Compute and return result array:
    var new_y = [];
    for (i = 0; i < new_x.length; i++) {
        new_y.push(Math.exp(alpha + beta * new_x[i]));
    }
    return new_y;
};

formula.HARMEAN = function () {
    var range = utils.parseNumberArray(utils.flatten(arguments));
    if (range instanceof Error) {
        return range;
    }
    var n = range.length;
    var den = 0;
    for (var i = 0; i < n; i++) {
        den += 1 / range[i];
    }
    return n / den;
};

formula.HYPGEOM = {};

formula.HYPGEOM.DIST = function (x, n, M, N, cumulative) {
    x = utils.parseNumber(x);
    n = utils.parseNumber(n);
    M = utils.parseNumber(M);
    N = utils.parseNumber(N);
    if (utils.anyIsError(x, n, M, N)) {
        return error.value;
    }

    function pdf(x, n, M, N) {
        return mathTrig.COMBIN(M, x) * mathTrig.COMBIN(N - M, n - x) / mathTrig.COMBIN(N, n);
    }

    function cdf(x, n, M, N) {
        var result = 0;
        for (var i = 0; i <= x; i++) {
            result += pdf(i, n, M, N);
        }
        return result;
    }

    return (cumulative) ? cdf(x, n, M, N) : pdf(x, n, M, N);
};

formula.INTERCEPT = function (known_y, known_x) {
    known_y = utils.parseNumberArray(known_y);
    known_x = utils.parseNumberArray(known_x);
    if (utils.anyIsError(known_y, known_x)) {
        return error.value;
    }
    if (known_y.length !== known_x.length) {
        return error.na;
    }
    return formula.FORECAST(0, known_y, known_x);
};

formula.KURT = function () {
    var range = utils.parseNumberArray(utils.flatten(arguments));
    if (range instanceof Error) {
        return range;
    }
    var mean = jStat.mean(range);
    var n = range.length;
    var sigma = 0;
    for (var i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 4);
    }
    sigma = sigma / Math.pow(jStat.stdev(range, true), 4);
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sigma - 3 * (n - 1) * (n - 1) / ((n - 2) * (n - 3));
};

formula.LARGE = function (range, k) {
    range = utils.parseNumberArray(utils.flatten(range));
    k = utils.parseNumber(k);
    if (utils.anyIsError(range, k)) {
        return range;
    }
    return range.sort(function (a, b) {
        return b - a;
    })[k - 1];
};

formula.LINEST = function (data_y, data_x) {
    data_y = utils.parseNumberArray(utils.flatten(data_y));
    data_x = utils.parseNumberArray(utils.flatten(data_x));
    if (utils.anyIsError(data_y, data_x)) {
        return error.value;
    }
    var ymean = jStat.mean(data_y);
    var xmean = jStat.mean(data_x);
    var n = data_x.length;
    var num = 0;
    var den = 0;
    for (var i = 0; i < n; i++) {
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den += Math.pow(data_x[i] - xmean, 2);
    }
    var m = num / den;
    var b = ymean - m * xmean;
    return [m, b];
};

// According to Microsoft:
// http://office.microsoft.com/en-us/starter-help/logest-function-HP010342665.aspx
// LOGEST returns are based on the following linear model:
// ln y = x1 ln m1 + ... + xn ln mn + ln b
formula.LOGEST = function (data_y, data_x) {
    data_y = utils.parseNumberArray(utils.flatten(data_y));
    data_x = utils.parseNumberArray(utils.flatten(data_x));
    if (utils.anyIsError(data_y, data_x)) {
        return error.value;
    }
    for (var i = 0; i < data_y.length; i++) {
        data_y[i] = Math.log(data_y[i]);
    }

    var result = formula.LINEST(data_y, data_x);
    result[0] = Math.round(Math.exp(result[0]) * 1000000) / 1000000;
    result[1] = Math.round(Math.exp(result[1]) * 1000000) / 1000000;
    return result;
};

formula.LOGNORM = {};

formula.LOGNORM.DIST = function (x, mean, sd, cumulative) {
    x = utils.parseNumber(x);
    mean = utils.parseNumber(mean);
    sd = utils.parseNumber(sd);
    if (utils.anyIsError(x, mean, sd)) {
        return error.value;
    }
    return (cumulative) ? jStat.lognormal.cdf(x, mean, sd) : jStat.lognormal.pdf(x, mean, sd);
};

formula.LOGNORM.INV = function (probability, mean, sd) {
    probability = utils.parseNumber(probability);
    mean = utils.parseNumber(mean);
    sd = utils.parseNumber(sd);
    if (utils.anyIsError(probability, mean, sd)) {
        return error.value;
    }
    return jStat.lognormal.inv(probability, mean, sd);
};

formula.MAX = function () {
    var range = utils.numbers(utils.flatten(arguments));
    return (range.length === 0) ? 0 : Math.max.apply(Math, range);
};

formula.MAXA = function () {
    var range = utils.arrayValuesToNumbers(utils.flatten(arguments));
    return (range.length === 0) ? 0 : Math.max.apply(Math, range);
};

formula.MEDIAN = function () {
    var range = utils.arrayValuesToNumbers(utils.flatten(arguments));
    return jStat.median(range);
};

formula.MIN = function () {
    var range = utils.numbers(utils.flatten(arguments));
    return (range.length === 0) ? 0 : Math.min.apply(Math, range);
};

formula.MINA = function () {
    var range = utils.arrayValuesToNumbers(utils.flatten(arguments));
    return (range.length === 0) ? 0 : Math.min.apply(Math, range);
};

formula.MODE = {};

formula.MODE.MULT = function () {
    // Credits: Ro�na�n
    var range = utils.parseNumberArray(utils.flatten(arguments));
    if (range instanceof Error) {
        return range;
    }
    var n = range.length;
    var count = {};
    var maxItems = [];
    var max = 0;
    var currentItem;

    for (var i = 0; i < n; i++) {
        currentItem = range[i];
        count[currentItem] = count[currentItem] ? count[currentItem] + 1 : 1;
        if (count[currentItem] > max) {
            max = count[currentItem];
            maxItems = [];
        }
        if (count[currentItem] === max) {
            maxItems[maxItems.length] = currentItem;
        }
    }
    return maxItems;
};

formula.MODE.SNGL = function () {
    var range = utils.parseNumberArray(utils.flatten(arguments));
    if (range instanceof Error) {
        return range;
    }
    return formula.MODE.MULT(range).sort(function (a, b) {
        return a - b;
    })[0];
};

formula.NEGBINOM = {};

formula.NEGBINOM.DIST = function (k, r, p, cumulative) {
    k = utils.parseNumber(k);
    r = utils.parseNumber(r);
    p = utils.parseNumber(p);
    if (utils.anyIsError(k, r, p)) {
        return error.value;
    }
    return (cumulative) ? jStat.negbin.cdf(k, r, p) : jStat.negbin.pdf(k, r, p);
};

formula.NORM = {};

formula.NORM.DIST = function (x, mean, sd, cumulative) {
    x = utils.parseNumber(x);
    mean = utils.parseNumber(mean);
    sd = utils.parseNumber(sd);
    if (utils.anyIsError(x, mean, sd)) {
        return error.value;
    }
    if (sd <= 0) {
        return error.num;
    }

    // Return normal distribution computed by jStat [http://jstat.org]
    return (cumulative) ? jStat.normal.cdf(x, mean, sd) : jStat.normal.pdf(x, mean, sd);
};

formula.NORM.INV = function (probability, mean, sd) {
    probability = utils.parseNumber(probability);
    mean = utils.parseNumber(mean);
    sd = utils.parseNumber(sd);
    if (utils.anyIsError(probability, mean, sd)) {
        return error.value;
    }
    return jStat.normal.inv(probability, mean, sd);
};

formula.NORM.S = {};

formula.NORM.S.DIST = function (z, cumulative) {
    z = utils.parseNumber(z);
    if (z instanceof Error) {
        return error.value;
    }
    return (cumulative) ? jStat.normal.cdf(z, 0, 1) : jStat.normal.pdf(z, 0, 1);
};

formula.NORM.S.INV = function (probability) {
    probability = utils.parseNumber(probability);
    if (probability instanceof Error) {
        return error.value;
    }
    return jStat.normal.inv(probability, 0, 1);
};

formula.PEARSON = function (data_x, data_y) {
    data_y = utils.parseNumberArray(utils.flatten(data_y));
    data_x = utils.parseNumberArray(utils.flatten(data_x));
    if (utils.anyIsError(data_y, data_x)) {
        return error.value;
    }
    var xmean = jStat.mean(data_x);
    var ymean = jStat.mean(data_y);
    var n = data_x.length;
    var num = 0;
    var den1 = 0;
    var den2 = 0;
    for (var i = 0; i < n; i++) {
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den1 += Math.pow(data_x[i] - xmean, 2);
        den2 += Math.pow(data_y[i] - ymean, 2);
    }
    return num / Math.sqrt(den1 * den2);
};

formula.PERCENTILE = {};

formula.PERCENTILE.EXC = function (array, k) {
    array = utils.parseNumberArray(utils.flatten(array));
    k = utils.parseNumber(k);
    if (utils.anyIsError(array, k)) {
        return error.value;
    }
    array = array.sort(function (a, b) {
        {
            return a - b;
        }
    });
    var n = array.length;
    if (k < 1 / (n + 1) || k > 1 - 1 / (n + 1)) {
        return error.num;
    }
    var l = k * (n + 1) - 1;
    var fl = Math.floor(l);
    return utils.cleanFloat((l === fl) ? array[l] : array[fl] + (l - fl) * (array[fl + 1] - array[fl]));
};

formula.PERCENTILE.INC = function (array, k) {
    array = utils.parseNumberArray(utils.flatten(array));
    k = utils.parseNumber(k);
    if (utils.anyIsError(array, k)) {
        return error.value;
    }
    array = array.sort(function (a, b) {
        return a - b;
    });
    var n = array.length;
    var l = k * (n - 1);
    var fl = Math.floor(l);
    return utils.cleanFloat((l === fl) ? array[l] : array[fl] + (l - fl) * (array[fl + 1] - array[fl]));
};

formula.PERCENTRANK = {};

formula.PERCENTRANK.EXC = function (array, x, significance) {
    significance = (significance === undefined) ? 3 : significance;
    array = utils.parseNumberArray(utils.flatten(array));
    x = utils.parseNumber(x);
    significance = utils.parseNumber(significance);
    if (utils.anyIsError(array, x, significance)) {
        return error.value;
    }
    array = array.sort(function (a, b) {
        return a - b;
    });
    var uniques = misc.UNIQUE.apply(null, array);
    var n = array.length;
    var m = uniques.length;
    var power = Math.pow(10, significance);
    var result = 0;
    var match = false;
    var i = 0;
    while (!match && i < m) {
        if (x === uniques[i]) {
            result = (array.indexOf(uniques[i]) + 1) / (n + 1);
            match = true;
        } else if (x >= uniques[i] && (x < uniques[i + 1] || i === m - 1)) {
            result = (array.indexOf(uniques[i]) + 1 + (x - uniques[i]) / (uniques[i + 1] - uniques[i])) / (n + 1);
            match = true;
        }
        i++;
    }
    return Math.floor(result * power) / power;
};

formula.PERCENTRANK.INC = function (array, x, significance) {
    significance = (significance === undefined) ? 3 : significance;
    array = utils.parseNumberArray(utils.flatten(array));
    x = utils.parseNumber(x);
    significance = utils.parseNumber(significance);
    if (utils.anyIsError(array, x, significance)) {
        return error.value;
    }
    array = array.sort(function (a, b) {
        return a - b;
    });
    var uniques = misc.UNIQUE.apply(null, array);
    var n = array.length;
    var m = uniques.length;
    var power = Math.pow(10, significance);
    var result = 0;
    var match = false;
    var i = 0;
    while (!match && i < m) {
        if (x === uniques[i]) {
            result = array.indexOf(uniques[i]) / (n - 1);
            match = true;
        } else if (x >= uniques[i] && (x < uniques[i + 1] || i === m - 1)) {
            result = (array.indexOf(uniques[i]) + (x - uniques[i]) / (uniques[i + 1] - uniques[i])) / (n - 1);
            match = true;
        }
        i++;
    }
    return Math.floor(result * power) / power;
};

formula.PERMUT = function (number, number_chosen) {
    number = utils.parseNumber(number);
    number_chosen = utils.parseNumber(number_chosen);
    if (utils.anyIsError(number, number_chosen)) {
        return error.value;
    }
    return mathTrig.FACT(number) / mathTrig.FACT(number - number_chosen);
};

formula.PERMUTATIONA = function (number, number_chosen) {
    number = utils.parseNumber(number);
    number_chosen = utils.parseNumber(number_chosen);
    if (utils.anyIsError(number, number_chosen)) {
        return error.value;
    }
    return Math.pow(number, number_chosen);
};

formula.PHI = function (x) {
    x = utils.parseNumber(x);
    if (x instanceof Error) {
        return error.value;
    }
    return Math.exp(-0.5 * x * x) / SQRT2PI;
};

formula.POISSON = {};

formula.POISSON.DIST = function (x, mean, cumulative) {
    x = utils.parseNumber(x);
    mean = utils.parseNumber(mean);
    if (utils.anyIsError(x, mean)) {
        return error.value;
    }
    return (cumulative) ? jStat.poisson.cdf(x, mean) : jStat.poisson.pdf(x, mean);
};

formula.PROB = function (range, probability, lower, upper) {
    if (lower === undefined) {
        return 0;
    }
    upper = (upper === undefined) ? lower : upper;

    range = utils.parseNumberArray(utils.flatten(range));
    probability = utils.parseNumberArray(utils.flatten(probability));
    lower = utils.parseNumber(lower);
    upper = utils.parseNumber(upper);
    if (utils.anyIsError(range, probability, lower, upper)) {
        return error.value;
    }

    if (lower === upper) {
        return (range.indexOf(lower) >= 0) ? probability[range.indexOf(lower)] : 0;
    }

    var sorted = range.sort(function (a, b) {
        return a - b;
    });
    var n = sorted.length;
    var result = 0;
    for (var i = 0; i < n; i++) {
        if (sorted[i] >= lower && sorted[i] <= upper) {
            result += probability[range.indexOf(sorted[i])];
        }
    }
    return result;
};

formula.QUARTILE = {};

formula.QUARTILE.EXC = function (range, quart) {
    range = utils.parseNumberArray(utils.flatten(range));
    quart = utils.parseNumber(quart);
    if (utils.anyIsError(range, quart)) {
        return error.value;
    }
    switch (quart) {
        case 1:
            return formula.PERCENTILE.EXC(range, 0.25);
        case 2:
            return formula.PERCENTILE.EXC(range, 0.5);
        case 3:
            return formula.PERCENTILE.EXC(range, 0.75);
        default:
            return error.num;
    }
};

formula.QUARTILE.INC = function (range, quart) {
    range = utils.parseNumberArray(utils.flatten(range));
    quart = utils.parseNumber(quart);
    if (utils.anyIsError(range, quart)) {
        return error.value;
    }
    switch (quart) {
        case 1:
            return formula.PERCENTILE.INC(range, 0.25);
        case 2:
            return formula.PERCENTILE.INC(range, 0.5);
        case 3:
            return formula.PERCENTILE.INC(range, 0.75);
        default:
            return error.num;
    }
};

formula.RANK = {};

formula.RANK.AVG = function (number, range, order) {
    number = utils.parseNumber(number);
    range = utils.parseNumberArray(utils.flatten(range));
    if (utils.anyIsError(number, range)) {
        return error.value;
    }
    range = utils.flatten(range);
    order = order || false;
    var sort = (order) ? function (a, b) {
        return a - b;
    } : function (a, b) {
        return b - a;
    };
    range = range.sort(sort);

    var length = range.length;
    var count = 0;
    for (var i = 0; i < length; i++) {
        if (range[i] === number) {
            count++;
        }
    }

    return (count > 1) ? (2 * range.indexOf(number) + count + 1) / 2 : range.indexOf(number) + 1;
};

formula.RANK.EQ = function (number, range, order) {
    number = utils.parseNumber(number);
    range = utils.parseNumberArray(utils.flatten(range));
    if (utils.anyIsError(number, range)) {
        return error.value;
    }
    order = order || false;
    var sort = (order) ? function (a, b) {
        return a - b;
    } : function (a, b) {
        return b - a;
    };
    range = range.sort(sort);
    return range.indexOf(number) + 1;
};

formula.ROW = function (matrix, index) {
    if (arguments.length !== 2) {
        return error.na;
    }

    if (index < 0) {
        return error.num;
    }

    if (!(matrix instanceof Array) || (typeof index !== 'number')) {
        return error.value;
    }

    if (matrix.length === 0) {
        return undefined;
    }

    return jStat.row(matrix, index);
};

formula.ROWS = function (matrix) {
    if (arguments.length !== 1) {
        return error.na;
    }

    if (!(matrix instanceof Array)) {
        return error.value;
    }

    if (matrix.length === 0) {
        return 0;
    }

    return jStat.rows(matrix);
};

formula.RSQ = function (data_x, data_y) { // no need to flatten here, PEARSON will take care of that
    data_x = utils.parseNumberArray(utils.flatten(data_x));
    data_y = utils.parseNumberArray(utils.flatten(data_y));
    if (utils.anyIsError(data_x, data_y)) {
        return error.value;
    }
    return Math.pow(formula.PEARSON(data_x, data_y), 2);
};

formula.SKEW = function () {
    var range = utils.parseNumberArray(utils.flatten(arguments));
    if (range instanceof Error) {
        return range;
    }
    var mean = jStat.mean(range);
    var n = range.length;
    var sigma = 0;
    for (var i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 3);
    }
    return n * sigma / ((n - 1) * (n - 2) * Math.pow(jStat.stdev(range, true), 3));
};

formula.SKEW.P = function () {
    var range = utils.parseNumberArray(utils.flatten(arguments));
    if (range instanceof Error) {
        return range;
    }
    var mean = jStat.mean(range);
    var n = range.length;
    var m2 = 0;
    var m3 = 0;
    for (var i = 0; i < n; i++) {
        m3 += Math.pow(range[i] - mean, 3);
        m2 += Math.pow(range[i] - mean, 2);
    }
    m3 = m3 / n;
    m2 = m2 / n;
    return m3 / Math.pow(m2, 3 / 2);
};

formula.SLOPE = function (data_y, data_x) {
    data_y = utils.parseNumberArray(utils.flatten(data_y));
    data_x = utils.parseNumberArray(utils.flatten(data_x));
    if (utils.anyIsError(data_y, data_x)) {
        return error.value;
    }
    var xmean = jStat.mean(data_x);
    var ymean = jStat.mean(data_y);
    var n = data_x.length;
    var num = 0;
    var den = 0;
    for (var i = 0; i < n; i++) {
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den += Math.pow(data_x[i] - xmean, 2);
    }
    return num / den;
};

formula.SMALL = function (range, k) {
    range = utils.parseNumberArray(utils.flatten(range));
    k = utils.parseNumber(k);
    if (utils.anyIsError(range, k)) {
        return range;
    }
    return range.sort(function (a, b) {
        return a - b;
    })[k - 1];
};

formula.STANDARDIZE = function (x, mean, sd) {
    x = utils.parseNumber(x);
    mean = utils.parseNumber(mean);
    sd = utils.parseNumber(sd);
    if (utils.anyIsError(x, mean, sd)) {
        return error.value;
    }
    return (x - mean) / sd;
};

formula.STDEV = {};

formula.STDEV.P = function () {
    var v = formula.VAR.P.apply(this, arguments);
    return Math.sqrt(v);
};

formula.STDEV.S = function () {
    var v = formula.VAR.S.apply(this, arguments);
    return Math.sqrt(v);
};

formula.STDEVA = function () {
    var v = formula.VARA.apply(this, arguments);
    return Math.sqrt(v);
};

formula.STDEVPA = function () {
    var v = formula.VARPA.apply(this, arguments);
    return Math.sqrt(v);
};


formula.STEYX = function (data_y, data_x) {
    data_y = utils.parseNumberArray(utils.flatten(data_y));
    data_x = utils.parseNumberArray(utils.flatten(data_x));
    if (utils.anyIsError(data_y, data_x)) {
        return error.value;
    }
    var xmean = jStat.mean(data_x);
    var ymean = jStat.mean(data_y);
    var n = data_x.length;
    var lft = 0;
    var num = 0;
    var den = 0;
    for (var i = 0; i < n; i++) {
        lft += Math.pow(data_y[i] - ymean, 2);
        num += (data_x[i] - xmean) * (data_y[i] - ymean);
        den += Math.pow(data_x[i] - xmean, 2);
    }
    return Math.sqrt((lft - num * num / den) / (n - 2));
};

// TODO: jStat
formula.TRANSPOSE = function (matrix) {
    // if (!matrix) {
    //     return error.na;
    // }
    // return jStat.transpose(matrix);
    throw new Error("TRANSPOSE is not implemented");
};

formula.T = function (value) {
    throw new Error("T is not implemented");
    return null;
};

formula.T.DIST = function (x, df, cumulative) {
    x = utils.parseNumber(x);
    df = utils.parseNumber(df);
    if (utils.anyIsError(x, df)) {
        return error.value;
    }
    return (cumulative) ? jStat.studentt.cdf(x, df) : jStat.studentt.pdf(x, df);
};

formula.T.DIST['2T'] = function (x, df) {
    if (arguments.length !== 2) {
        return error.na;
    }

    if (x < 0 || df < 1) {
        return error.num;
    }

    if ((typeof x !== 'number') || (typeof df !== 'number')) {
        return error.value;
    }

    return (1 - jStat.studentt.cdf(x, df)) * 2;
};

formula.T.DIST.RT = function (x, df) {
    if (arguments.length !== 2) {
        return error.na;
    }

    if (x < 0 || df < 1) {
        return error.num;
    }

    if ((typeof x !== 'number') || (typeof df !== 'number')) {
        return error.value;
    }

    return 1 - jStat.studentt.cdf(x, df);
};

formula.T.INV = function (probability, df) {
    probability = utils.parseNumber(probability);
    df = utils.parseNumber(df);
    if (utils.anyIsError(probability, df)) {
        return error.value;
    }
    return jStat.studentt.inv(probability, df);
};

formula.T.INV['2T'] = function (probability, df) {
    probability = utils.parseNumber(probability);
    df = utils.parseNumber(df);
    if (probability <= 0 || probability > 1 || df < 1) {
        return error.num;
    }
    if (utils.anyIsError(probability, df)) {
        return error.value;
    }
    return Math.abs(jStat.studentt.inv(probability / 2, df));
};

// The algorithm can be found here:
// http://www.chem.uoa.gr/applets/AppletTtest/Appl_Ttest2.html
formula.T.TEST = function (data_x, data_y) {
    data_x = utils.parseNumberArray(utils.flatten(data_x));
    data_y = utils.parseNumberArray(utils.flatten(data_y));
    if (utils.anyIsError(data_x, data_y)) {
        return error.value;
    }

    var mean_x = jStat.mean(data_x);
    var mean_y = jStat.mean(data_y);
    var s_x = 0;
    var s_y = 0;
    var i;

    for (i = 0; i < data_x.length; i++) {
        s_x += Math.pow(data_x[i] - mean_x, 2);
    }
    for (i = 0; i < data_y.length; i++) {
        s_y += Math.pow(data_y[i] - mean_y, 2);
    }

    s_x = s_x / (data_x.length - 1);
    s_y = s_y / (data_y.length - 1);

    var t = Math.abs(mean_x - mean_y) / Math.sqrt(s_x / data_x.length + s_y / data_y.length);

    return formula.T.DIST['2T'](t, data_x.length + data_y.length - 2);
};

formula.TREND = function (data_y, data_x, new_data_x) {
    data_y = utils.parseNumberArray(utils.flatten(data_y));
    data_x = utils.parseNumberArray(utils.flatten(data_x));
    new_data_x = utils.parseNumberArray(utils.flatten(new_data_x));
    if (utils.anyIsError(data_y, data_x, new_data_x)) {
        return error.value;
    }
    var linest = formula.LINEST(data_y, data_x);
    var m = linest[0];
    var b = linest[1];
    var result = [];

    new_data_x.forEach(function (x) {
        result.push(m * x + b);
    });

    return result;
};

formula.TRIMMEAN = function (range, percent) {
    range = utils.parseNumberArray(utils.flatten(range));
    percent = utils.parseNumber(percent);
    if (utils.anyIsError(range, percent)) {
        return error.value;
    }
    var trim = mathTrig.FLOOR(range.length * percent, 2) / 2;
    return jStat.mean(utils.initial(utils.rest(range.sort(function (a, b) {
        return a - b;
    }), trim), trim));
};

formula.VAR = {};

formula.VAR.P = function () {
    var range = utils.numbers(utils.flatten(arguments));
    var n = range.length;
    var sigma = 0;
    var mean = formula.AVERAGE(range);
    for (var i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 2);
    }
    return sigma / n;
};

formula.VAR.S = function () {
    var range = utils.numbers(utils.flatten(arguments));
    var n = range.length;
    var sigma = 0;
    var mean = formula.AVERAGE(range);
    for (var i = 0; i < n; i++) {
        sigma += Math.pow(range[i] - mean, 2);
    }
    return sigma / (n - 1);
};

formula.VARA = function () {
    var range = utils.flatten(arguments);
    var n = range.length;
    var sigma = 0;
    var count = 0;
    var mean = formula.AVERAGEA(range);
    for (var i = 0; i < n; i++) {
        var el = range[i];
        if (typeof el === 'number') {
            sigma += Math.pow(el - mean, 2);
        } else if (el === true) {
            sigma += Math.pow(1 - mean, 2);
        } else {
            sigma += Math.pow(0 - mean, 2);
        }

        if (el !== null) {
            count++;
        }
    }
    return sigma / (count - 1);
};

formula.VARPA = function () {
    var range = utils.flatten(arguments);
    var n = range.length;
    var sigma = 0;
    var count = 0;
    var mean = formula.AVERAGEA(range);
    for (var i = 0; i < n; i++) {
        var el = range[i];
        if (typeof el === 'number') {
            sigma += Math.pow(el - mean, 2);
        } else if (el === true) {
            sigma += Math.pow(1 - mean, 2);
        } else {
            sigma += Math.pow(0 - mean, 2);
        }

        if (el !== null) {
            count++;
        }
    }
    return sigma / count;
};

formula.WEIBULL = {};

formula.WEIBULL.DIST = function (x, alpha, beta, cumulative) {
    x = utils.parseNumber(x);
    alpha = utils.parseNumber(alpha);
    beta = utils.parseNumber(beta);
    if (utils.anyIsError(x, alpha, beta)) {
        return error.value;
    }
    return (cumulative) ? 1 - Math.exp(-Math.pow(x / beta, alpha)) : Math.pow(x, alpha - 1) * Math.exp(-Math.pow(x / beta, alpha)) * alpha / Math.pow(beta, alpha);
};

formula.Z = {};

formula.Z.TEST = function (range, x, sd) {
    range = utils.parseNumberArray(utils.flatten(range));
    x = utils.parseNumber(x);
    if (utils.anyIsError(range, x)) {
        return error.value;
    }

    sd = sd || formula.STDEV.S(range);
    var n = range.length;
    return 1 - formula.NORM.S.DIST((formula.AVERAGE(range) - x) / (sd / Math.sqrt(n)), true);
};