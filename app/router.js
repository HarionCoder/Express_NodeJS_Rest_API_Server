/* ============================================ REQUIRE ============================================ */
var fs      = require('fs');
var path    = require('path');
var wait    = require('wait.for');
var loader  = require('auto-loader');
var moment  = require("moment-timezone");

/* ======================================= CONSTANT VARIABLE ======================================= */
var API_PATH = '/nami/:module/:action';
var MOD_PATH = './modules/';

var modules = {virtual:loader.load(MOD_PATH), entity:{}};
var mods_path = path.join(__dirname, 'modules');
var mods_list = fs.readdirSync(mods_path);
var mods = {};
for(var i in mods_list){
    var file_path = path.join(mods_path,mods_list[i]);
    if(fs.statSync(file_path).isFile() && path.extname(mods_list[i])=='.js') {
        var modn = path.basename(mods_list[i],'.js');
        var modp = path.join(mods_path,modn);
        modules.entity[modn] = require(modp);
    }
}

console.log("\n=======================================================================\nNami System loaded Modules: \n-----------------------------------------------------------------------\n\n", modules);

/**
 * Export module
 * @param app
 */
module.exports = function (app) {
    app.all(API_PATH, function (req, res) {
        action(req, res, req.method.toLowerCase());
    });
};

module.exports = function (app) {
    app.post(API_PATH, function (req, res) {
        action(req, res, req.method.toLowerCase());
    });
};

/**
 * Run the module in folder mod_topjek
 * @param req       The request
 * @param res       The response
 * @param method    GET/POST
 */
function action(req, res, method) {
    var module = req.params.module.replace(/[^a-zA-z0-9]+/g, '');
    var action = req.params.action.replace(/[^a-zA-z0-9]+/g, '');
    var time = moment(new Date()).format("ddd YYYY-MM-DD HH:mm:ss");
    console.log("\n==================================================\n",time," - Nami System call module API:\n--------------------------------------------------\nModuleAPI: [31m",module,"[0m\nAction: [34m", action ,"[0m\nMethod: [32m", method,"[0m\n==================================================\n");
    var alias = method + '_' + action;
    if (modules.virtual.hasOwnProperty(module)) {
        var object = modules.virtual[module];
        if (object.hasOwnProperty(alias)) {
            try {
                var multiparty = require('multiparty');
                var form = new multiparty.Form();
                form.parse(req, function(err, fields, files) {
                    req.headers['if-none-match'] = 'no-match-for-this';
                    var parser = req.body;
                    console.log("parser ",parser);
                    var params = {"files":files};
                    if(fields){
                        for (var key in fields) {
                            if (fields.hasOwnProperty(key)) {
                                params[key] = (typeof fields[key] == 'object') ? fields[key][0] : fields[key];
                            }
                        }
                    }
                    if (parser) {
                        for (var key in parser) {
                            if (parser.hasOwnProperty(key)) {
                                params[key] = parser[key];
                            }
                        }
                    }
                    var attributes = req.query;
                    wait.launchFiber(object[alias], req, res, params, attributes);
                });
            } catch (err) {
                console.log("Error: ",err.stack);
                res.status(405).pj("Method Not Allowed...");
            }
        } else {
            res.status(503).pj("Method Not Available...");
        }
    } else {
        res.status(503).pj("Module Undefined...");
    }
}