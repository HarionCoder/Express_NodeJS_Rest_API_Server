var util        = require("../../library/utility");
var db          = require("../../library/db");
var moment      = require("moment-timezone");
var wait        = require("wait.for");
var fs          = require("fs");
var path        = require("path");
var md5         = require("MD5");
var CONFIGS     = global.config;
moment().tz("Asia/Jakarta").format();

exports.post_update_price = function (req, res, params, attributes) { update_price (req, res, params, attributes); }
function update_price (req, res, param, attr) {
    // console.log("\n[34mConfiguration: [0m",CONFIGS);
    // console.log("\n[32mAttributes: [0m",attr);
    // console.log("[31mParameters: [0m",param);
    var validation = util.validate(param, ['iopen','iclose','ilow','ihigh','itime','timeframe','symbolname','ibarshift','ivolume','Brokername','asklastest','bidlastest','isnextbar']);
    if (validation.passed) {
        var query = "SELECT update_price("+param.iopen+"::real, "+param.iclose+"::real, "+param.ilow+"::real, "+param.ihigh+"::real, '"+itime.toString().replace('.','-')+"'::timestamp, "+param.timeframe+"::int, '"+param.symbolname+"'::varchar, "+param.ibarshift+"::smallint, "+param.ivolume+"::int, '"+param.Brokername+"::varchar', "+param.asklastest+"::real, "+param.bidlastest+"::real, "+param.isnextbar+"::int)";
        console.log('\n---------------------------------------------------------------------------------\nQuery: ',query,'\n---------------------------------------------------------------------------------\n');
        var x = db.excute(query);
        res.pj({Status:'Database has been updated!', Parameters:param, Attribute:attr});
    } else {
        res.pj({Status:'Fail!', Reason:validation.reason, Parameters:param});
    }
}