module.exports = function (app) {
    app.get('/', function(req, res){
        res.status(503).pj('Sory! Service Unavailable.');
    });
};