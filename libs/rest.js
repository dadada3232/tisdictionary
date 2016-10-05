var rest = exports;

var ObjectId = require('mongodb').ObjectId;
var getWS = require('./ws').get;
var log = require('./log')(module);
var jp = require('jsonpath');
var config = require('../config');

rest.getAll = function (req, res, next, collectionName, callback) {
    var sguid = checkAndGetSGUID(req, res, next);
    if (!sguid) {
        return;
    }

    var args = {
        "ModuleGuid": config.get("ws:mguid"),
        "CollectionName": collectionName,
        "JSONquery": "{}",
        "skip": 0,
        "limit": 1000,
        "DescreamingOrder": true,
        "OrderParam": "_id"
    };
    getWS("db", "MongoSelect", sguid, args, function (result) {
        var str = removeObjectIdFromJSONStr(result.MongoSelectResult);
        var cards = JSON.parse(str);
        (callback) ? callback(cards) : res.json(cards);
    });
};

rest.get = function (req, res, next, collectionName, callback) {
    var sguid = checkAndGetSGUID(req, res);
    if (!sguid) {
        next(400);
        return;
    }
    try {
        var id = new ObjectId(req.params.id);
    } catch (e) {
        next(400);
        return;
    }

    var args = {
        "ModuleGuid": config.get("ws:mguid"),
        "CollectionName": collectionName,
        "JSONquery": "{_id: {$oid:\"" + id + "\"}}", //"{_id: ObjectId(\"" + id + "\")}",
        "skip": 0,
        "limit": 1,
        "DescreamingOrder": true,
        "OrderParam": "_id"
    };
    getWS("db", "MongoSelect", sguid, args, function (result) {
        var str = removeObjectIdFromJSONStr(result.MongoSelectResult);
        var card = JSON.parse(str);
        (callback) ? callback(card) : res.json(card);
    });
};

rest.post = function (req, res, next, collectionName, item) {
    var sguid = checkAndGetSGUID(req, res);
    if (!sguid) {
        return;
    }

    var args = {
        "ModuleGuid": config.get("ws:mguid"),
        "CollectionName": collectionName,
        "JSONdata": JSON.stringify(item)
    };
    getWS("db", "MongoInsert", sguid, args, function (result) {
        if (result.MongoInsertResult) {
            res.status(200).end();
        } else {
            return createErrorResponse(res, 400, 'Insert through WS failed');
        }
    });
};

rest.put = function (req, res, next, collectionName) {
    var sguid = checkAndGetSGUID(req, res);
    if (!sguid) {
        return;
    }

    req.body._id = {$oid: req.body._id};

    var args = {
        "ModuleGuid": config.get("ws:mguid"),
        "CollectionName": collectionName,
        "JSONdata": JSON.stringify(req.body)
    };
    getWS("db", "MongoSave", sguid, args, function (result) {
        if (result.MongoSaveResult == true) {
            res.status(200).end();
        } else {
            return createErrorResponse(res, 400, 'Save through WS failed');
        }
    });
};

rest.delete = function (req, res, next, collectionName) {
    var sguid = checkAndGetSGUID(req, res);
    if (!sguid) {
        return;
    }
    try {
        var id = new ObjectId(req.params.id);
    } catch (e) {
        next(400);
        return;
    }

    var args = {
        "ModuleGuid": config.get("ws:mguid"),
        "CollectionName": collectionName,
        "JSONquery": "{_id: {$oid:\"" + id + "\"}}"

    };
    getWS("db", "MongoRemove", sguid, args, function (result) {
        if (result.MongoRemoveResult) {
            res.status(200).end();
        } else {
            res.status(400).end("Error. Remove failed");
        }
    });
};

function createErrorResponse(res, code, message) {
    res.append('Failure', message);
    return res.status(code).end(message);
}

function checkAndGetSGUID(req, res, next) {
    var sguid = req.app.get("sguid");
    if (!sguid) {
        //next(new HttpError(400, "SGUID undefined"));
        return false;
    } else {
        log.debug("Get SGUID: " + sguid);
        return sguid;
    }
}

function removeObjectIdFromJSONStr(result) {
    if (result) {
        return result.replace(/ObjectId\(([a-z0-9"]*)\)/g, "$1");
    }
}
