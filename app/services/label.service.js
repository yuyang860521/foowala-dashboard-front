/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: 备注
 */

const async = require('async'),
    mongoose = require('mongoose'),
    objectid = require('objectid'),
    label_mongo = mongoose.model('label'),
    menu_mongo = mongoose.model('menu');

const label = {
    getlabelbyStore(store_id) {
        return new Promise((resolve, reject) => {
            label_mongo.find({ 'store_id': store_id }, (err, label) => {
                resolve(label)
            });
        });
    },
    getStaffById(id, callback) {
        label_mongo.findById(id, (staff) => {
            callback(staff);
        });
    },
    getLabelByMenu(store_id, menu_id) {
        var arr = [];
        return new Promise((resolve, reject) => {
            this.getlabelbyStore(store_id)
                .then(data => {
                    menu_mongo.findOne({ _id: menu_id }, (err, doc) => {
                        if (doc) {
                            async.each(data, (item, cb) => {
                                async.each(doc.labels, (label, cb1) => {
                                    if (item._id.toString() === label.toString()) {
                                        item.isChecked = true;
                                        cb1();
                                    } else cb1();
                                }, err => {
                                    arr.push(item);
                                    cb();
                                });
                            }, err => {
                                resolve(arr);
                            });
                        } else{
                            resolve(arr)
                        }
                    });
                })
                .catch(err => {
                    reject(err);
                })
        });
    },

    getLabelByMenuChecked (store_id, menu_id) {
        return new Promise((resolve, reject) => {
            menu_mongo.findOne({ _id: menu_id, store_id:store_id }, (err, doc) => {
                const label_ids = doc.labels;
                label_mongo.aggregate([{
                    $match:{_id:{$in:label_ids}}
                },{
                    $group:{
                        _id:{_id:"_id"},
                        labels:{$push:{_id:"$_id", store_id:"$store_id", label:"$label"}}
                    }
                },{
                    $project:{
                        _id:0,
                        labels:1
                    }
                }], (err, docs)=>{
                    if (err) {reject(err)}
                    if (docs[0]) {
                      let labels = docs[0].labels;
                      async.each(labels, (label, callback) => {
                          label.isChecked = false;
                          callback()
                      }, err => {
                          resolve(labels)
                      })
                    } else {
                        resolve([])
                    }
                })
            });
        });
    },

    update(store_id, label) {
        return new Promise((resolve, reject) => {
            label_mongo.update({ store_id: store_id }, { label: label }, (err, label) => {

            })
        });
    },

    insert(label, store_id) {
        const model = new label_mongo({
            store_id: store_id,
            label: label
        });
        return new Promise((resolve, reject) => {
            model.save((err, data) => {
                if (err) reject('ERROR: insert new data fail')
                resolve(data);
            });
        })
    },
    delete(_id) {
        return new Promise((resolve, reject) => {
            label_mongo.where({ _id })
                .findOneAndRemove(err => {
                    resolve("delete success")
                })
        })
    },

    insertArr(labels, store_id) {
        return new Promise((resolve, reject) => {
            async.each(labels, (lab) => {
                label_mongo.findOne({ label: lab }, (err, data) => {
                    if (data) {
                        console.log('this data is already in');
                    } else {
                        const model = new label_mongo({
                            store_id: objectid(store_id),
                            label: lab
                        });
                        model.save();
                    }
                }, (err) => {
                    if (err) {
                        reject('save label err');
                    }
                    resolve();
                });
            })
        })
    }
};

module.exports = exports = label;
