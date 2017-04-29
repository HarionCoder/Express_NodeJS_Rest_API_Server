var http                        = require("http");
var querystring                 = require("querystring");
var request                     = require("request");
var wait                        = require("wait.for");
var moment                      = require("moment-timezone");
var fs                          = require("fs");
var md5                         = require("MD5");
var execute                     = require('child_process').exec;
var CONFIGS                     = global.conf;
moment().tz("Asia/Jakarta").format();
var parameters;
var location;

/**
 * Define variable for utility object
 *
 * @param  {[type]} param [description]
 * @return {[type]}       [description]
 */
exports.var = function (param) {
    this.st();
    this.parameters = param;
    return this.cacheConfig();
}

/**
 * Start clock
 *
 * @param prefix
 */
exports.st = function (prefix) {
    var prefix = (prefix) ? prefix : 'start';
    var starts = {};
    clock.length = 0;
    starts[prefix] = moment().format('x');
    clock = [starts];
}

/**
 * Go clock
 *
 * @param step
 */
exports.do = function (step) {
    var number_step = parseInt(clock.length - 1);
    var curent_step = (step!=null) ? (step.length > 3) ? step.toString() : 'step_' + step.toString() : 'step_' + (number_step + 1).toString();
    var log_step_by = {};
    log_step_by[curent_step] = moment().format('x');
    clock.push(log_step_by);
}

/**
 * Get benchmark of processing clock
 *
 * @param cmd
 * @returns {*[]}
 */
exports.tt = function (cmd) {
    var cmd = (cmd) ? cmd : '';
    var n = parseInt(clock.length - 1);
    var e = clock[n];
    var p = clock[0];
    // console.log("N = ",n,"\ne = ",e,"\np = ",p,"\nE = ",this.val(e),"\nP = ",this.val(p),"\nA = \n",clock);
    var m = this.val(e) - this.val(p);
    var l = (m > 1000) ? (m/1000)+" sec" : m+" milisec";
    var j = 'OK';
    var r = {message:"FROM START ACTION : '"+this.val(p,1)+"' - TO THE END ACTION : '"+this.val(e,1)+"' - LOST TOTAL TIME : '"+l+"'", judge:j, taken:l, milsec:m, start:this.val(p), end:this.val(e)};
    var result = [r];
    var buf = [];
    if (cmd.indexOf('-') > -1) {
        var buf = cmd.split('-');
    } else {
        if (clock.length) {
            cmd = "";
            for (var z = 0; z < (clock.length-1); z++) {
                cmd += (z+1)+"-";
            }
            cmd = cmd.substr(0, (cmd.length-1));
        }
        var buf = cmd.split('-');
    }
    if (buf.length) {
        for (var i=0; i<buf.length; i++) {
            if (i < (buf.length - 1)) {
                var ids = buf[i];
                var ide = buf[i+1];
                m = this.val(clock[ide]) - this.val(clock[ids]);
                l = (m > 1000) ? (m/1000)+" sec" : m+" milisec";
                if (parseInt(m)==0) {
                    j = 'HANG_UP';
                }
                if (m > 100) {
                    j = 'SLOW';
                }
                if (m > 500) {
                    j = 'VERY_SLOW';
                }
                if (m > 1000) {
                    j = 'TERRIBLE_SLOW';
                }
                r = {message:"FROM '"+this.val(clock[ids],1)+"' TO '"+this.val(clock[ide],1)+"' LOST '"+l+"'", judge:j, taken:l, milsec:m, start:this.val(clock[ids]), end:this.val(clock[ide])};
                result.push(r);
            }
        }
    }
    return result;
}

/**
 * Get key/value of object
 *
 * @param obj
 * @returns {*}
 */
exports.val = function(obj, key) {
    var flg = (key!=null) ? key : false;
    if (typeof obj === "object") {
        var res = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (flg) {
                    res.push(i);
                } else {
                    res.push(obj[i]);
                }
            }
        }
        return (res.length==1) ? res[0] : res;
    } else return obj;
}

/**
 * Execute Unix command
 *
 * @param command
 */
exports.exe = function(command, callback) {
    execute(command, function(error, stdout, stderr) {
        // console.log("\n\n================================================");
        // console.log("Stdout: ",stdout,"\nStderr: ",stderr,"\n-------------------------------------------------");
        if (error) {
            // console.log("Exec error: ", error);
            if(callback) callback(null,error,'failed');
        } else {
            if(callback) callback(null,stdout,stderr);
        }
        // console.log("================================================\n\n");
    });
}

/**
 * Trim space character in string
 *
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
exports.trim = function (string) {
    return string.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

/**
 * Check if element in array
 *
 * @param  {[type]} arr [description]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
exports.inArray = function (obj, arr) {
    var result = false;
    for(var i=0; i<arr.length; i++) {
        if (typeof obj == 'string') {
            if (arr[i].toString() == obj.toString()) {
                result = true;
                break;
            }
        } else {
            if (arr[i] == obj) {
                result = true;
                break;
            }
        }
    }
    return result;
}

/**
 * Set value for object property
 *
 * @param {[type]} key [description]
 * @param {[type]} val [description]
 */
exports.set = function (key, val) {
    if(!this.parameters.hasOwnProperty(key)){
        this.parameters[key] = val;
        return true;
    }else{
        return false;
    }
}

/**
 * Get value from object property
 *
 * @param  {[type]} key [description]
 * @param  {[type]} val [description]
 * @return {[type]}     [description]
 */
exports.get = function (key, val) {
    if (this.parameters && this.parameters.hasOwnProperty(key)) {
        return this.parameters[key];
    } else {
        return val;
    }
//    return this.parameters[key];
}

/**
 * Dump param data from web app
 *
 * @param param
 * @returns {*}
 */
exports.dump = function (param) {
    try {
        for (var prm in param) {
            if (param.hasOwnProperty(prm)) {
                var dat = param[prm];
                if (typeof dat == 'string' && this.isJson(dat)) {
                    param[prm] = JSON.parse(dat);
                }
            }
        }
        return param;
    } catch (e) {
        console.log(e.stack);
        return param;
    }
}

/**
 * Check string is JSON valid
 *
 * @param  {[type]}  string [description]
 * @return {Boolean}        [description]
 */
exports.isJson = function (string) {
    try {
        var o = JSON.parse(string);
        if (o && typeof o === "object") {
            return true;
        } else if (o && typeof o === "array") {
            return true;
        }
    } catch (e) {
        return false;
    }
    return false;
}

/**
 * Get Client IP
 *
 * @param req
 * @returns {*}
 */
exports.getIP = function (req) {
    try {
        if (req) {
            var ip;
            if (req.headers['x-forwarded-for']) {
                ip = req.headers['x-forwarded-for'].split(",")[0];
            } else if (req.connection && req.connection.remoteAddress) {
                ip = req.connection.remoteAddress;
            } else {
                ip = req.ip;
            }
            return ip;
        } else return false;
    } catch(err) {
        console.log(err.stack);
    }
}

/**
 * Uppercase first character of all words
 *
 * @param string
 * @returns {*}
 */
exports.ucwords = function(string) {
    return string.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
}

/**
 * Get Slug String
 *
 * @param s
 * @param opt
 * @returns {*}
 */
exports.getSlug = function (s, opt) {
    s = String(s);
    opt = Object(opt);

    var defaults = {
        'delimiter': '-',
        'limit': undefined,
        'lowercase': false,
        'uppercase': true,
        'replacements': {},
        'transliterate': (typeof(XRegExp) === 'undefined') ? true : false
    };

    // Merge options
    for (var k in defaults) {
        if (!opt.hasOwnProperty(k)) {
            opt[k] = defaults[k];
        }
    }

    var char_map = {
        // Latin
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE', 'Ç': 'C',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ő': 'O',
        'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ű': 'U', 'Ý': 'Y', 'Þ': 'TH',
        'ß': 'ss',
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae', 'ç': 'c',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ő': 'o',
        'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'ű': 'u', 'ý': 'y', 'þ': 'th',
        'ÿ': 'y',

        // Latin symbols
        '©': '(c)',

        // Greek
        'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Θ': '8',
        'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': '3', 'Ο': 'O', 'Π': 'P',
        'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'X', 'Ψ': 'PS', 'Ω': 'W',
        'Ά': 'A', 'Έ': 'E', 'Ί': 'I', 'Ό': 'O', 'Ύ': 'Y', 'Ή': 'H', 'Ώ': 'W', 'Ϊ': 'I',
        'Ϋ': 'Y',
        'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'h', 'θ': '8',
        'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': '3', 'ο': 'o', 'π': 'p',
        'ρ': 'r', 'σ': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'x', 'ψ': 'ps', 'ω': 'w',
        'ά': 'a', 'έ': 'e', 'ί': 'i', 'ό': 'o', 'ύ': 'y', 'ή': 'h', 'ώ': 'w', 'ς': 's',
        'ϊ': 'i', 'ΰ': 'y', 'ϋ': 'y', 'ΐ': 'i',

        // Vietnamese
        'Á': 'A', 'á': 'a', 'À': 'A', 'à': 'a', 'Ạ': 'A', 'ạ': 'a', 'Ả': 'A', 'ả': 'a',
        'Ã': 'A', 'ã': 'a', 'Â': 'A', 'â': 'a', 'Ấ': 'A', 'ấ': 'a', 'Ầ': 'A', 'ầ': 'a',
        'Ậ': 'A', 'ậ': 'a', 'Ẩ': 'A', 'ẩ': 'a', 'Ẫ': 'A', 'ẫ': 'a', 'Ă': 'A', 'ă': 'a',
        'Ắ': 'A', 'ắ': 'a', 'Ằ': 'A', 'ằ': 'a', 'Ặ': 'A', 'ặ': 'a', 'Ẳ': 'A', 'ẳ': 'a',
        'Ẵ': 'A', 'ẵ': 'a', 'Ó': 'O', 'ó': 'o', 'Ò': 'O', 'ò': 'o', 'Ọ': 'O', 'ọ': 'o',
        'Ỏ': 'O', 'ỏ': 'o', 'Õ': 'O', 'õ': 'o', 'Ô': 'O', 'ô': 'o', 'Ố': 'O', 'ố': 'o',
        'Ồ': 'O', 'ồ': 'o', 'Ộ': 'O', 'ộ': 'o', 'Ổ': 'O', 'ổ': 'o', 'Ỗ': 'O', 'ỗ': 'o',
        'Ơ': 'O', 'ơ': 'o', 'Ớ': 'O', 'ớ': 'o', 'Ờ': 'O', 'ờ': 'o', 'Ợ': 'O', 'ợ': 'o',
        'Ở': 'O', 'ở': 'o', 'Ỡ': 'O', 'ỡ': 'o', 'Ú': 'U', 'ú': 'u', 'Ù': 'U', 'ù': 'u',
        'Ụ': 'U', 'ụ': 'u', 'Ủ': 'U', 'ủ': 'u', 'Ũ': 'U', 'ũ': 'u', 'Ư': 'U', 'ư': 'u',
        'Ứ': 'U', 'ứ': 'u', 'Ừ': 'U', 'ừ': 'u', 'Ự': 'U', 'ự': 'u', 'Ử': 'U', 'ử': 'u',
        'Ữ': 'U', 'ữ': 'u', 'É': 'E', 'é': 'e', 'È': 'E', 'è': 'e', 'Ẹ': 'E', 'ẹ': 'e',
        'Ẻ': 'E', 'ẻ': 'e', 'Ẽ': 'E', 'ẽ': 'e', 'Ê': 'E', 'ê': 'e', 'Ế': 'E', 'ế': 'e',
        'Ề': 'E', 'ề': 'e', 'Ệ': 'E', 'ệ': 'e', 'Ể': 'E', 'ể': 'e', 'Ễ': 'E', 'ễ': 'e',
        'Í': 'I', 'í': 'i', 'Ì': 'I', 'ì': 'i', 'Ỉ': 'I', 'ỉ': 'i', 'Ị': 'I', 'ị': 'i',
        'Ĩ': 'I', 'ĩ': 'i', 'Ý': 'Y', 'ý': 'y', 'Ỳ': 'Y', 'ỳ': 'y', 'Ỷ': 'Y', 'ỷ': 'y',
        'Ỵ': 'Y', 'ỵ': 'y', 'Ỹ': 'Y', 'ỹ': 'y', 'Đ': 'D', 'đ': 'd',

        // Turkish
        'Ş': 'S', 'İ': 'I', 'Ç': 'C', 'Ü': 'U', 'Ö': 'O', 'Ğ': 'G',
        'ş': 's', 'ı': 'i', 'ç': 'c', 'ü': 'u', 'ö': 'o', 'ğ': 'g',

        // Russian
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
        'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
        'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C',
        'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sh', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
        'Я': 'Ya',
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya',

        // Ukrainian
        'Є': 'Ye', 'І': 'I', 'Ї': 'Yi', 'Ґ': 'G',
        'є': 'ye', 'і': 'i', 'ї': 'yi', 'ґ': 'g',

        // Czech
        'Č': 'C', 'Ď': 'D', 'Ě': 'E', 'Ň': 'N', 'Ř': 'R', 'Š': 'S', 'Ť': 'T', 'Ů': 'U',
        'Ž': 'Z',
        'č': 'c', 'ď': 'd', 'ě': 'e', 'ň': 'n', 'ř': 'r', 'š': 's', 'ť': 't', 'ů': 'u',
        'ž': 'z',

        // Polish
        'Ą': 'A', 'Ć': 'C', 'Ę': 'e', 'Ł': 'L', 'Ń': 'N', 'Ó': 'o', 'Ś': 'S', 'Ź': 'Z',
        'Ż': 'Z',
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z',
        'ż': 'z',

        // Latvian
        'Ā': 'A', 'Č': 'C', 'Ē': 'E', 'Ģ': 'G', 'Ī': 'i', 'Ķ': 'k', 'Ļ': 'L', 'Ņ': 'N',
        'Š': 'S', 'Ū': 'u', 'Ž': 'Z',
        'ā': 'a', 'č': 'c', 'ē': 'e', 'ģ': 'g', 'ī': 'i', 'ķ': 'k', 'ļ': 'l', 'ņ': 'n',
        'š': 's', 'ū': 'u', 'ž': 'z'
    };

    // Make custom replacements
    for (var k in opt.replacements) {
        s = s.replace(RegExp(k, 'g'), opt.replacements[k]);
    }

    // Transliterate characters to ASCII
    if (opt.transliterate) {
        for (var k in char_map) {
            s = s.replace(RegExp(k, 'g'), char_map[k]);
        }
    }

    // Replace non-alphanumeric characters with our delimiter
    var alnum = (typeof(XRegExp) === 'undefined') ? RegExp('[^a-z0-9]+', 'ig') : XRegExp('[^\\p{L}\\p{N}]+', 'ig');
    s = s.replace(alnum, opt.delimiter);

    // Remove duplicate delimiters
    s = s.replace(RegExp('[' + opt.delimiter + ']{2,}', 'g'), opt.delimiter);

    // Truncate slug to max. characters
    s = s.substring(0, opt.limit);

    // Remove delimiter from ends
    s = s.replace(RegExp('(^' + opt.delimiter + '|' + opt.delimiter + '$)', 'g'), '');

    return opt.lowercase ? s.toLowerCase() : opt.uppercase ? s.toUpperCase() : s;
}

/**
 * Process convert special characters as htmlspecialchars
 *
 * @param  {[type]}   string        [description]
 * @param  {[type]}   quoteStyle    [description]
 * @param  {Function} charset       [description]
 * @param  {Function} doubleEncode  [description]
 * @return {[type]}                 [description]
 */
exports.htmlspecialchars = function (string, quoteStyle, charset, doubleEncode) {
    var optTemp = 0
    var i = 0
    var noquotes = false
    if (typeof quoteStyle === 'undefined' || quoteStyle === null) {
        quoteStyle = 2
    }
    string = string || ''
    string = string.toString()
    if (doubleEncode !== false) {
        // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;')
    }
    string = string
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
    }
    if (quoteStyle === 0) {
        noquotes = true
    }
    if (typeof quoteStyle !== 'number') {
        // Allow for a single string or an array of string flags
        quoteStyle = [].concat(quoteStyle)
        for (i = 0; i < quoteStyle.length; i++) {
            // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
            if (OPTS[quoteStyle[i]] === 0) {
                noquotes = true
            } else if (OPTS[quoteStyle[i]]) {
                optTemp = optTemp | OPTS[quoteStyle[i]]
            }
        }
        quoteStyle = optTemp
    }
    if (quoteStyle & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/'/g, '&#039;')
    }
    if (!noquotes) {
        string = string.replace(/"/g, '&quot;')
    }
    return string
}

/**
 * Process quote string to slay injection
 *
 * @param  {[type]}   string   [description]
 * @return {[type]}            [description]
 */
exports.quote = function (string) {
    if (typeof(string) == "string") {
        string = string.replace(/&/g, "&amp;");
        string = string.replace(/"/g, "&quot;");
        string = string.replace(/'/g, "&#039;");
        string = string.replace(/</g, "&lt;");
        string = string.replace(/>/g, "&gt;");
    }
    return string;
}

/**
 * Process unquote data to get original content
 *
 * @param  {[type]}   string   [description]
 * @return {[type]}            [description]
 */
exports.unquote = function (string) {
    if (typeof(string) == "string") {
        string = string.replace(/&gt;/ig, ">");
        string = string.replace(/&lt;/ig, "<");
        string = string.replace(/&#039;/g, "'");
        string = string.replace(/&quot;/ig, '"');
        string = string.replace(/&amp;/ig, '&');
    }
    return string;
}

/**
 * Create dir
 *
 * @param  {[type]}   dir      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var makeDir = function (dir, callback){
    if(dir){
        if (!fs.existsSync(dir)){
            try {
                fs.mkdirSync(dir);
                callback(dir);
            } catch(e) {
                callback(dir);
            }
        }else{
            callback(dir);
        }
    }else{
        callback(dir);
    }
}

/**
 * Process string pad to left
 *
 * @param  {[type]} string [description]
 * @param  {[type]} pad    [description]
 * @param  {[type]} length [description]
 * @return {[type]}        [description]
 */
function str_pad_left(string, pad, length) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
}

/**
 * Process sring pad to right
 *
 * @param  {[type]} string [description]
 * @param  {[type]} pad    [description]
 * @param  {[type]} length [description]
 * @return {[type]}        [description]
 */
function str_pad_right(string,pad,length) {
    return (string + new Array(length + 1).join(pad)).slice(0,length);
}

/**
 * generate a random string
 *
 * @return {[type]} [description]
 */
exports.randomString = function(length) {
    length = (length) ? parseInt(length) : 6;
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

exports.lg = function(input, color) {
    var cldf = '[0m';
    var colo = (color) ? '['+parseInt(color).toString()+'m' : '[31m';
    var time = moment(new Date()).format("ddd YYYY-MM-DD HH:mm:ss");
    if (indexOf('$c', input)) {
        input.toString().replace(/$c/g, colo);
    }
    if (indexOf('$d', input)) {
        input.toString().replace(/$d/g, cldf);
    }
    var log = "[31m"+time+ ' ~ [32mNami : [0m'+input;
    console.log(log);
}

/**
 * Print data by console.log
 *
 * @param  {[type]} title  [description]
 * @param  {[type]} param  [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
var log = function(title, param, objs){
    var time = moment(new Date()).format("ddd YYYY-MM-DD HH:mm:ss");
    var line = "*";
    var slin = "~";
    var xlin = "-";
    var zlin = ".";
    if(objs){
        line = (objs[0]) ? objs[0] : line;
        slin = (objs[1]) ? objs[1] : slin;
        xlin = (objs[2]) ? objs[2] : xlin;
        zlin = (objs[3]) ? objs[3] : zlin;
    }
    for(var i=0; i<7; i++){
        line+=line;
        slin+=slin;
        xlin+=xlin;
        zlin+=zlin;
    }
    var j = 0;
    console.log("\n");
    console.log(line);
    console.log("[" + time + "] ~ MAIN ~ "+title);
    console.log(slin);
    var i = 0;
    if(typeof param === "object" && !Array.isArray(param) && param !== null){
        var l = Object.keys(param).length;
        if(l > 0){
            i++;
            for(var pam in param) {
                if (param.hasOwnProperty(pam)) {
                    var par = param[pam];
                    console.log("["+pam+"] := " + par + ";");
                }
            }
        }
    }else{
        console.log(param);
    }
    console.log(line);
    console.log("\n");
}

/**
 * Print data by console.log
 *
 * @param  {[type]} title  [description]
 * @param  {[type]} param  [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
exports.pr = function(title, param, objs) {
    var time = moment(new Date()).format("ddd YYYY-MM-DD HH:mm:ss");
    var line = "*";
    var slin = "=";
    var xlin = "-";
    var zlin = ".";
    if(objs){
        line = (objs[0]) ? objs[0] : line;
        slin = (objs[1]) ? objs[1] : slin;
        xlin = (objs[2]) ? objs[2] : xlin;
        zlin = (objs[3]) ? objs[3] : zlin;
    }
    for(var i=0; i<7; i++){
        line+=line;
        slin+=slin;
        xlin+=xlin;
        zlin+=zlin;
    }
    var j = 0;
    console.log("\n\n");
    console.log(line);
    console.log("[" + time + "] ~ MAIN ~ ");
    console.log(title);
    console.log(slin);
    var i = 0;
    if(typeof param === "object" && !Array.isArray(param) && param !== null){
        var l = Object.keys(param).length;
        if(l > 0){
            i++;
            for(var pam in param) {
                if (param.hasOwnProperty(pam)) {
                    var par = param[pam];
                    console.log("[PARAM] : " + pam);
                    console.log("[VALUE] : ",par);
                    if(i < l){
                        console.log(xlin);
                    }
                }
            }
        }
    }else{
        console.log(param);
    }
    console.log(line);
    console.log("\n\n");
}

function prsx(title, param, objs){
    var time = moment(new Date()).format("ddd YYYY-MM-DD HH:mm:ss");
    var line = "*";
    var slin = "=";
    var xlin = "-";
    var zlin = ".";
    if(objs){
        line = (objs[0]) ? objs[0] : line;
        slin = (objs[1]) ? objs[1] : slin;
        xlin = (objs[2]) ? objs[2] : xlin;
        zlin = (objs[3]) ? objs[3] : zlin;
    }
    for(var i=0; i<7; i++){
        line+=line;
        slin+=slin;
        xlin+=xlin;
        zlin+=zlin;
    }
    var j = 0;
    console.log("\n\n");
    console.log(line);
    console.log("[" + time + "] ~ MAIN ~ ");
    console.log(title);
    console.log(slin);
    var i = 0;
    if(typeof param === "object" && !Array.isArray(param) && param !== null){
        var l = Object.keys(param).length;
        if(l > 0){
            i++;
            for(var pam in param) {
                if (param.hasOwnProperty(pam)) {
                    var par = param[pam];
                    console.log("[PARAM] : " + pam);
                    console.log("[VALUE] : ",par);
                    if(i < l){
                        console.log(xlin);
                    }
                }
            }
        }
    }else{
        console.log(param);
    }
    console.log(line);
    console.log("\n\n");
}

/**
 * Print data by console.log
 *
 * @param  {[type]} title  [description]
 * @param  {[type]} param  [description]
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
exports._ = function(title, desc, param, short){
    var time = moment(new Date()).format("ddd YYYY-MM-DD HH:mm:ss");
    var line = "=";
    var slin = "~";
    var xlin = "-";
    var zlin = ".";
    if(!desc){
        var desc = "";
    }
    for(var i=0; i<7; i++){
        line+=line;
        slin+=slin;
        xlin+=xlin;
        zlin+=zlin;
    }
    var j = 0;
    console.log("\n");
    console.log(line);
    console.log("[" + time + "] ~ MAIN ~ (" + title + ")");
    if(desc){
        console.log(slin);
        console.log(desc);
    }
    console.log(xlin);
    var i = 0;
    if(typeof param === "object" && !Array.isArray(param) && param !== null){
        var l = Object.keys(param).length;
        var out = "";
        if(l > 0){
            i++;
            if(short){
                for(var pam in param) {
                    if (param.hasOwnProperty(pam)) {
                        var par = param[pam];
                        var com = "";
                        if(i < l){
                            com = "; "
                        }
                        if(typeof par === "object" || Array.isArray(par) && par !== null ){
                            out += "["+pam+"] = " + JSON.stringify(par) + com;
                        }else{
                            out += "["+pam+"] = " + par + com;
                        }
                    }
                }
            }else{
                for(var pam in param) {
                    if (param.hasOwnProperty(pam)) {
                        var par = param[pam];
                        var com = "";
                        if(i < l){
                            com = "; "
                        }
                        if(typeof par === "object" || Array.isArray(par) && par !== null ){
                            console.log("["+pam+"] = ",par);
                        }else{
                            console.log("["+pam+"] = " + par + com);
                        }
                    }
                }
            }
        }
    }else{
        console.log(param);
    }
    console.log(line);
    console.log("\n");
}

/**
 * Sprintf to print content
 *
 * @param  {[type]} args [description]
 * @return {[type]}      [description]
 */
exports.sprintf = function (args){
    if(args){
        string = args[1],
            i = 2;
        return string.replace(/%((%)|s|d)/g, function (m) {
            var val = null;
            if (m[3]) {
                val = m[3];
            } else {
                val = args[i];
                switch (m) {
                    case '%d':
                        val = parseFloat(val);
                        if (isNaN(val)) {
                            val = 0;
                        }
                        break;
                }
                i++;
            }
            return val;
        });
    }
}

/**
 * Sprintf to print content
 *
 * @return {[type]} [description]
 */
exports.fs = function() {
    var args = arguments,
        string = args[0],
        i = 1;
    return string.replace(/%((%)|s|d)/g, function (m) {
        var val = null;
        if (m[2]) {
            val = m[2];
        } else {
            val = args[i];
            switch (m) {
                case '%d':
                    val = parseFloat(val);
                    if (isNaN(val)) {
                        val = 0;
                    }
                    break;
            }
            i++;
        }
        return val;
    });
}

/**
 * Return real object data
 *
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
exports.v = function(obj) {
    return (Array.isArray(obj) && obj.length) ? obj[0] : obj;
}

/**
 * Check variable is null
 *
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
exports.n = function(val) {
    return (val == null || val == "") ? true : false;
}

/**
 * Validation variable value
 *
 * @param  {[type]} obj [description]
 * @param  {[type]} key [description]
 * @param  {[type]} val [description]
 * @return {[type]}     [description]
 */
exports.vl = function(obj, key, val) {
    var result = null;
    if(obj && typeof obj === "object"){
        if(obj.hasOwnProperty(key)){
            result = obj[key];
        }else{
            result = val
        }
    }
    return result;
}

/**
 * Sort an object array by value of key
 *
 * @param  {[type]} array [description]
 * @param  {[type]} key   [description]
 * @return {[type]}       [description]
 */
exports.sortByKey = function (array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

/**
 * Filter to get the item in both of 2 arrays
 *
 * @param  {[type]} oldList [description]
 * @param  {[type]} newList [description]
 * @return {[type]}         [description]
 */
exports.filtArray = function (oldList, newList) {
    if(oldList, newList){
        return newList.filter(function(el){
            return oldList.indexOf(el) < 0;
        });
    }
}

/**
 * Validate parameters is null or not
 *
 * @param  {[type]} params  [description]
 * @param  {[type]} objects [description]
 * @return {[type]}         [description]
 */
exports.validate = function (params, objects) {
    var result = {passed: true, reason: ""};
    if (params && typeof params === "object") {
        if (objects) {
            for (var i=0; i < objects.length; i++) {
                var key = objects[i];
                if (params.hasOwnProperty(key)) {
                    if (params[key] == null || params[key] == "") {
                        result.passed = false;
                        result.reason = key;
                        break;
                    }
                } else {
                    result.passed = false;
                    result.reason = key;
                    break;
                }
            }
        } else {
            result.passed = true;
            result.reason = "No condition parameter to compare";
        }
    } else {
        result.passed = false;
        result.reason = "Object '"+JSON.stringify(params)+"' is not object type";
    }
    return result;
}

/**
 * Let the element of object
 *
 * @param  {[type]} params  [description]
 * @param  {[type]} key     [description]
 * @param  {[type]} default [description]
 * @return {[type]}         [description]
 */
exports.let = function (params, key, def) {
    if (params && typeof params === "object") {
        if (params.hasOwnProperty(key)) {
            return params[key];
        } else {
            return def;
        }
    } else {
        return def;
    }
}

/**
 * Sort object by property values
 *
 * @param  {[type]} obj   [description]
 * @param  {[type]} order [description]
 * @return {[type]}       [description]
 */
exports.oSort = function (obj, order) {
    order = (order) ? order : 1;
    if (obj) {
        var res = {};
        var objs = Object.keys(obj).sort(function(a,b){return obj[a]-obj[b]});
        if (order) {
            return objs;
        } else {
            for (var i=0; i < objs.length; i++) {
                res[objs[i]] = obj[objs[i]];
            }
            return res;
        }
    }else{
        return obj;
    }
}

/**
 * Escape string to catch off injection
 *
 * @param str
 * @returns {*}
 */
exports.escape = function(str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\" + char;
        }
    });
}