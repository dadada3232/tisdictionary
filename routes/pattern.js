var rest = require('../libs/rest');
var async = require("async");

var item = {
    "notation": "",
    "title": "Новая запись",
    "systemDomain": "",
    "parameters": []
};
var mode = "pattern";

/**
 * Функция возвращает объект pattern с массивом параметров, вместо массива айдишников параметров
 *
 * @param req req
 * @param res res
 * @param next next
 */
exports.getFull = function (req, res, next) {

    var tasks = [
        function (callback) {
            rest.get(req, res, next, mode, function (pattern) {
                callback(null, pattern);
            });
        },
        function (callback) {
            rest.getAll(req, res, next, "param", function (params) {
                callback(null, params);
            });
        }
    ];

    async.series(tasks, function (err, results) {
        if (!err) {
            var pattern = results[0][0];
            var params = results[1];

            pattern.parameters = params.filter(function (item) {
                var find = false;
                pattern.parameters.forEach(function (id) {
                    if (item._id == id) {
                        find = true;
                    }
                }, this);
                return find;
            });
            res.json(pattern);
        } else {
            console.log(err);
            res.end(err);
        }
    });
};

exports.getAll = function (req, res, next) {
    rest.getAll(req, res, next, mode);
};

exports.get = function (req, res, next) {
    rest.get(req, res, next, mode);
};

exports.post = function (req, res, next) {
    rest.post(req, res, next, mode, item);
};

exports.put = function (req, res, next) {
    rest.put(req, res, next, mode);
};

exports.delete = function (req, res, next) {
    rest.delete(req, res, next, mode);
};

