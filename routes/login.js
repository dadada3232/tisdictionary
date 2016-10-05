var config = require('../config');
var url = require('url');
var get = require('../libs/ws').get;
var log = require('../libs/log')(module);

exports.get = function (req, res) {
    req.requrl = url.parse(req.url, true);
    var k = req.requrl.query.k;
    if (k) {
        req.app.set("sguid", k);
    }

    var sguid = req.app.get("sguid");

    if (sguid) {
        get(null, "AboutUser", sguid, null, function (result) {
            log.debug(result);
            var surname = result.AboutUserResult.Surname;
            var name = result.AboutUserResult.Name;
            res.render("index", {
                user: surname + " " + name
            });
        });
    } else {
        res.render("login", {
            urlTisAdmin: config.get('urls:tis-admin')
        });
    }
};