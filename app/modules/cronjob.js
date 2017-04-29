/* ======================================== Setup ======================================== */
var cronJob 	= require('cron').CronJob;
var util 		= require("../../library/utility");
var moment 		= require("moment-timezone");
var wait 		= require("wait.for");
var fs 			= require("fs");
var path 		= require("path");
var md5 		= require("MD5");
var config      = global.config;
var debug       = true;
var log         = true;
var timeZone    = "Asia/Jakarta";
moment().tz(timeZone).format();
// var rcl 		= require("redis").createClient(global.conf.DB_REDIS.PORT, global.conf.DB_REDIS.HOST);


function action_call (req, res, param) {

}
exports.post_call = function (req, res) { action_call (req, res, req.body); }


