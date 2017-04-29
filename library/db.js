var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var CONFIGS   = global.config;
console.log('CONFIGS ',CONFIGS);
var sequelize = new Sequelize(CONFIGS.db.name, CONFIGS.db.user, CONFIGS.db.pass, {
    host: CONFIGS.db.host,
    dialect: CONFIGS.db.dialect, // or 'sqlite', 'postgres', 'mariadb'
    port: CONFIGS.db.port, // or 5432 (for postgres)
    timezone: '+07:00',
    logging: false,
    // dialectOptions: {
    //     ssl: false
    // }
});

var db = {};

fs.readdirSync(__dirname).filter(
    function(file) {
        return (file.indexOf("nm9_") === 0) ;
    }
).forEach(function(file) {
        var model = sequelize["import"](path.join(__dirname, file));
        db[model.name] = model;
    }
);

Object.keys(db).forEach(function(model_name) {
    if ("associate" in db[model_name]) {
        db[model_name].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.query = function (query) {
    var query_string = query || "";
    var type_select  = (query_string.substring(0,6).toLowerCase()=="select") ? true : false;
    try {
        if (type_select) {
            try {
                this.sequelize.query(query_string, {type: db.sequelize.QueryTypes.SELECT}).then(function (results) {
                    if (results) {
                        return results;
                    } else {
                        return null;
                    }
                });
            } catch(err) {
                return false;
            }
        } else {
            try {
                this.sequelize.query(query_string).spread(function(results, metadata) {
                    return {result:results, data:metadata};
                });
            } catch(err) {
                return false;
            }
        }
    } catch(error) {
        return false;
    }
}

db.excute = function (query) {
    var query_string = query || "";
    try {
        sequelize.query(query_string).then(function(response){
                return response;
            }).error(function(err){
                return false;
        });
    } catch(err) {
        return false;
    }
}

module.exports = db;