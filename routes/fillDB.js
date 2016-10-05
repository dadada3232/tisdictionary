var rest = require('../libs/rest');
var fs = require('fs');

var collection = "";
var files = [
    "classifier.json",
    "dimension.json",
    "domain.json",
    "param.json",
    "pattern.json",
    "systemDomain.json",
    "type.json"
];

exports.start = function (req, res, next) {
    files.forEach(function (item) {
        var data = require('../data/' + item);
        collection = item.substr(0, item.lastIndexOf('.'));
        data.forEach(function (inItem) {
            delete inItem._id;
            rest.post(req, res, next, collection, inItem)
        }, this)
    }, this);
};
