/**
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 连接 mongodb
 */

'use strict';

var db,
  mongoose    = require('mongoose'),
  config      = require('../../config/config'),
  mongodb_cfg = config.mongo,
    setting     = {
        host     : '54.223.41.81',
        port     : 22,
        dstPort  : 27017,
        username : 'kain',
        localHost: '127.0.0.1',
        password : 'kainfoowala1234'
    },
    connectError = (err) => {
        throw new Error('unable to connect to database at ' + mongodb_cfg.db);
    },
    connectOpen = (err, database) => {
        console.log('Connected to mongo server.');
        if(err) console.error('ERROR: Unable to connect to MongoDB on startup at: ' + new Date());
        else db = database;
    };

mongoose.Promise = require('bluebird');
mongoose.connect(mongodb_cfg.db, connectOpen);

module.exports = db;
