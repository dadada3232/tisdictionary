var rest = require('../libs/rest');

var item = {
    "title": "Новая запись",
    "notation": ""
};
var mode = "classifier";

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