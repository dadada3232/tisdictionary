module.exports = function (app) {

    app.get('/', require('./login').get);
    //app.get('/fillDB', require('./fillDB').start); для первичного импорта из папки data

    //param
    app.get('/param/', require('./param').getAll);
    app.post('/param/', require('./param').post);
    app.get('/param/:id', require('./param').get);
    app.put('/param/:id', require('./param').put);
    app.delete('/param/:id', require('./param').delete);

    //classifier
    app.get('/classifier/', require('./classifier').getAll);
    app.post('/classifier/', require('./classifier').post);
    app.get('/classifier/:id', require('./classifier').get);
    app.put('/classifier/:id', require('./classifier').put);
    app.delete('/classifier/:id', require('./classifier').delete);

    //dimension
    app.get('/dimension/', require('./dimension').getAll);
    app.post('/dimension/', require('./dimension').post);
    app.get('/dimension/:id', require('./dimension').get);
    app.put('/dimension/:id', require('./dimension').put);
    app.delete('/dimension/:id', require('./dimension').delete);

    //domain
    app.get('/domain/', require('./domain').getAll);
    app.post('/domain/', require('./domain').post);
    app.get('/domain/:id', require('./domain').get);
    app.put('/domain/:id', require('./domain').put);
    app.delete('/domain/:id', require('./domain').delete);

    //domain
    app.get('/systemDomain/', require('./systemDomain').getAll);
    app.post('/systemDomain/', require('./systemDomain').post);
    app.get('/systemDomain/:id', require('./systemDomain').get);
    app.put('/systemDomain/:id', require('./systemDomain').put);
    app.delete('/systemDomain/:id', require('./systemDomain').delete);

    //type
    app.get('/type/', require('./type').getAll);
    app.post('/type/', require('./type').post);
    app.get('/type/:id', require('./type').get);
    app.put('/type/:id', require('./type').put);
    app.delete('/type/:id', require('./type').delete);

    //type
    app.get('/pattern/', require('./pattern').getAll);
    app.post('/pattern/', require('./pattern').post);
    app.get('/pattern/:id', require('./pattern').get);
    app.get('/pattern/:id/full', require('./pattern').getFull);
    app.put('/pattern/:id', require('./pattern').put);
    app.delete('/pattern/:id', require('./pattern').delete);
};