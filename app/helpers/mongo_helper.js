/*
 * Author: Magic <magic@foowala.com>
 * Module description: mongo func helper
 */
'use strict';

var mongo_funcs = function (mongo_name) {

    this.findOne =  (data) => {
        return new Promise((resolve, reject) => {
            mongo_name.findOne(data, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })
        })
    };

    this.findAll =  (data) => {
        return new Promise((resolve, reject) => {
            mongo_name.find(data, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })
        })
    };

    this.save = (data) => {
        return new Promise((resolve, reject) => {
            const mongo_doc = new mongo_name(data);
            mongo_doc.save((err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })
        })
    };

    this.insertBack = (data) => {
        return new Promise((resolve, reject) => {
            this.findOne(data)
                .then(result => {
                    if (result) {
                        return resolve(result)
                    }else{
                        return this.save(data)
                    }
                })
                .then(doc => {
                    resolve(doc)
                })
                .catch(err => {
                    console.log(err)
                    return reject(err);
                })
        })
    },

    this.insertBackCommon = (data, callback) => {
        this.findOne(data)
            .then(result => {
                if (result) {
                    callback(null, result);
                } else {
                    callback(null, data);
                }
            })
            .then(doc => {
                callback(null, doc);
            })
            .catch(err => {
                console.log(err)
                callback(err);
            })
    },

    this.insert = (data) => {
        return new Promise((resolve, reject) => {
            this.findOne(data)
                .then(result => {
                    if (result) {
                        return reject("already has this doc")
                    }else{
                        return this.save(data)
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
    },

    this.insertFree = (key, data) => {
        return new Promise((resolve, reject) => {
            this.findOne(key)
                .then(result => {
                    if (result) {
                        return reject('already has this func')
                    }else{
                        return this.save(data)
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
    },

    this.update = (key, data) => {
        return new Promise((resolve, reject) => {
            mongo_name.update(key, data, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })
        })
    };

    this.findLastest = (data) => {
        return new Promise((resolve, reject) => {
            const query = mongo_name.find(data);
            query.sort({CreateTime:-1})
                 .limit(1);
            query.exec((err, docs) => {
                if (err) {return reject(err)}
                return resolve(docs[0]);
            })
        })
    }
}

module.exports = exports = mongo_funcs;
