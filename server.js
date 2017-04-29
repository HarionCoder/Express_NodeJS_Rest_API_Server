var express     = require('express');
var morgan      = require('morgan');
var path        = require('path');
var bodyParser  = require('body-parser');
var session     = require('express-session');
var http        = require('http');
var fs          = require('fs');
var config      = require('./config');

http.ServerResponse.prototype.pj = function(data){
    try {
        this.setHeader("Access-Control-Allow-Origin", "*");
        this.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        this.setHeader('Access-Control-Allow-Headers', 'Content-Type: application/json; charset=utf-8');
        this.setHeader('Access-Control-Allow-Credentials', true);
        this.json(data);
    }catch(e) {
        console.log('Error: ',e.stack);
        this.json({});
    }
};

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'keyboard cat',resave: true,saveUninitialized: true}));

// auto include all .js files from routes
var routes_path = path.join(__dirname, 'app');
var route_list = fs.readdirSync(routes_path);
for(var i in route_list){
    var file_path = path.join(routes_path,route_list[i]);
    if(fs.statSync(file_path).isFile() && path.extname(route_list[i])=='.js')
        require(file_path)(app);
}

console.log("\n=======================================================================\n[34mNami System: [31mSTRATED[0m\n=======================================================================\n\n");

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // console.log("\n==========================================================\nParser ",req.body);
    // req.json("Conntected Successful!");
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
