/*
 * Author: Magic <magic@foowala.com>
 * Module description: func service
 */

const async = require('async'),
    objectId = require('objectid'),
    mongoose = require('mongoose'),
    func_mongo = mongoose.model('func'),
    mongo_helper = require('../helpers/mongo_helper');
const mongo_funcs = new mongo_helper(func_mongo);

var exports = {
    insert (data) {
        return new Promise((resolve, reject) => {
            mongo_funcs.findOne(data)
                .then(result => {
                    if (result) {
                        return reject('already has this func')
                    }else{
                        return mongo_funcs.save(data)
                    }
                })
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    console.log(err)
                    return reject(err);
                })
        })
    }
};

module.exports = exports;
