var env = require('./env.js');
var config = {
    env: env,
    db: {
        dialect:'postgres',
        port:5432,
        host:'localhost',
        user:'harion',
        pass:'paladin',
        name:'Nami'
    }
};
global.config = config;
