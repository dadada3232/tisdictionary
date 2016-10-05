var express = require('express');
var config = require('./config');
var log = require('./libs/log')(module);
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');

var app = express();

app.engine('ejs', require('ejs-locals')); // layout partial block
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(serveStatic(__dirname + '/'));

require('./routes')(app);

var host = process.env.OPENSHIFT_NODEJS_IP || config.get('host');
var port = process.env.OPENSHIFT_NODEJS_PORT || config.get('port');

app.listen(port, host, function () {
    log.info('Express server (' + host + ') listening on port ' + port);
});


