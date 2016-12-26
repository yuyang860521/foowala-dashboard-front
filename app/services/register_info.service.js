/*
 * Author: Magic <magic@foowala.com>
 * Module description: uid
 */

var async = require('async'),
    mongoose = require('mongoose'),
    register_info_mongo = mongoose.model('register_info');

var exports = {
    saveRegister_info(register_info) {
        return new Promise((resolve, reject) => {
            const register = new register_info_mongo(register_info);
            register.save((err, result)=>{
                if (err) {
                    console.log(err);
                    return reject('save register_info err')
                 }
                return resolve(result)
            })
        })
    },

    getRegister_info(query) {
        return new Promise((resolve, reject) => {
            register_info_mongo.find(query, (err, register_info) => {
                if (register_info) {
                    resolve(register_info)
                } else {
                    reject('no register_info')
                }
            });
        });
    },

    getRegisterinfoById(query) {
        return new Promise((resolve, reject) => {
            register_info_mongo.findOne(query, (err, register_info) => {
                if (register_info) {
                    resolve(register_info)
                } else {
                    reject('no register_info')
                }
            });
        });
    },

    putRgister_info(_id, data) {
        return new Promise((resolve, reject) => {
            register_info_mongo.update(_id, data, (err, result)=>{
                if (err) {
                    console.log(err);
                    return reject('save register_info err')
                }
                return resolve(result)
            })
        })
    },

    delete(_id, data) {
        return new Promise((resolve, reject) => {
            register_info_mongo.remove(_id, (err, result)=>{
                if (err) {
                    console.log(err);
                    return reject('save register_info err')
                }
                return resolve(result)
            })
        })
    }
};

module.exports = exports;
