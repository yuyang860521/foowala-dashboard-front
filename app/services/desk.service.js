/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: 桌号
 */

var async = require('async'),
    mongoose = require('mongoose'),
    objectId = require('objectid'),
    desk_mongo = mongoose.model('desk'),
    order_mongo = mongoose.model('order');

var exports = {

    insert(number, store_id, floor, callback) {
        desk_mongo.count({ store_id: store_id, floor: floor }, (err, count) => {
            for (let i = 0; i < number; i++) {
                const model = new desk_mongo({
                    number: count + i + 1,
                    store_id: objectId(store_id),
                    floor: floor
                });
                model.save(err => {
                    if (err) {
                        console.error('ERROR: 新增桌号失败');
                        console.dir(data);
                    }
                });
            }
            if (callback) callback(true);
        })
    },

    update(number, store_id, floor, callback) {
        this.delete(store_id);
        for (let i = 0; i < number; i++) {
            const model = new desk_mongo({
                number: i + 1,
                store_id: objectId(store_id),
                floor: floor
            });
            model.save((err) => {
                if (err) {
                    console.error('ERROR: 新增桌号失败');
                    console.dir(data);
                }
            });
        }
        if (callback) callback(true);
    },

    updateStatus(data, callback) {
        desk_mongo.findOne({ _id: data._id, store_id: data.store_id }, (err, desk) => {
            if (desk) {
                if (data.status || data.status === 0) {
                    desk.status = Number(data.status);
                    desk.save(err => {
                        if (err) callback(false, null);
                        else callback(true, desk);
                    });
                } else {
                    callback(false, null)
                }
            } else {
                callback(false, null);
            }
        });
    },

    updateStatusAndCheck(data, callback) {
        desk_mongo.findOne({ _id: data._id, store_id: data.store_id }, (err, desk) => {
            if (err) {
                return callback(false, null)
            }
            if (desk && desk.status === 1 || desk.status === 2) {
                desk.status = Number(data.status);
                desk.save(err => {
                    if (err) {
                        callback(false, null);
                    } else {
                        callback(true, desk);
                    }
                });
            } else if (desk && desk.status === 3) {
                order_mongo.find({ desk_id: { $in: [data._id] }, status: { $nin: [2, 3] } })
                    .then(orders => {
                        if (orders && orders.length === 1) {
                            if (orders[0].status === 0) {
                                desk.status = 1;
                            } else {
                                desk.status = 2;
                            }
                            desk.save(err => {
                                if (err) {
                                    console.log(err)
                                    callback(false, null);
                                } else callback(true, desk);
                            });
                        } else if (orders && orders.length > 1) {
                            callback(true, desk);
                        } else {
                            desk.status = 0;
                            desk.save(err => {
                                if (err) callback(false, null);
                                else callback(true, desk);
                            });
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        callback(false, null);
                    })
            } else if (desk && desk.status === 4) {
                callback(true, desk);
            } else {
                callback(false, null)
            }
        });
    },

    updateStatusCombineAndDivide(data) {
        return new Promise((resolve, reject) => {
            desk_mongo.findOne({ _id: data._id, store_id: data.store_id })
                .then(desk => {
                    const status = desk.status;
                    if (status === 0 || status === 1 || status === 2 || status === 4) {
                        desk.status = Number(data.status);
                        desk.save((err, desk) => {
                            if (err) {
                                return reject("change desk status fail");
                            } else {
                                return resolve(desk);
                            }
                        });
                    } else if (status === 3) {
                        order_mongo.find({ desk_id: { $in: [data._id] }, status: { $nin: [2, 3] } })
                            .then(orders => {
                                if (orders && orders.length === 1 && orders[0].status === 0) {
                                    desk.status = 1;
                                } else if (orders && orders.length === 1 && orders[0].status === 1) {
                                    desk.status = 2;
                                } else if (orders && orders.length > 1) {
                                    desk.status = 3;
                                } else {
                                    desk.status = 0;
                                }
                                desk.save((err, desk) => {
                                    if (err) {
                                        return reject(err);
                                    } else {
                                        return resolve(desk);
                                    }
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                reject(err)
                            })
                    } else {
                        return reject("no this status")
                    }
                })
                .catch(err => {
                    return reject("no such desk!")
                })
        })
    },

    updateDesksStatus(data) {
        return new Promise((resolve, reject) => {
            desk_mongo.update({ _id: { $in: data._id }, store_id: data.store_id }, { status: data.status }, { multi: true })
                .then(row => {
                    return resolve(row);
                })
                .catch(err => {
                    return reject("no such desk!")
                })
        })
    },

    checkDesk(_id) {
        return order_mongo.findOne({ desk_id: { $in: [_id] } });
    },

    cancelDesk(store_id, ids, callback) {
        desk_mongo.findOne({ store_id, _id: { $in: ids } }, (err, desk) => {
            if (desk && desk.status !== 3 || desk.status !== 4) {
                desk.status = 0;
                desk.save(err => {
                    if (err) callback(false, null);
                    else callback(true, desk);
                });
            } else if (desk && desk.status === 3) {
                order_mongo.find({ desk_id: { $in: [ids] }, status: { $nin: [2, 3] } })
                    .exec()
                    .then(orders => {
                        if (orders && orders.length === 1) {
                            desk.status = 2;
                            desk.save(err => {
                                if (err) callback(false, null);
                                else callback(true, desk);
                            });
                        } else if (orders && orders.length > 1) {
                            callback(true, desk);
                        } else {
                            desk.status = 0;
                            desk.save(err => {
                                if (err) callback(false, null);
                                else callback(true, desk);
                            });
                        }
                    })
            } else if (callback) callback(false, null);
        });
    },

    cancelDeskPromise(store_id, ids) {
        return desk_mongo.findOne({ store_id, _id: { $in: ids } })
            .exec()
            .then(desk => {
                const status = desk.status;
                if (desk && status !== 3) {
                    desk.status = 0;
                    desk.save((err, dk) => {
                        if (err) {
                            return Promise.reject(err)
                        }
                        return dk;
                    });
                } else if (desk || status === 3 || status === 4) {
                    return desk;
                } else {
                    return Promise.reject("no such desk!")
                }
            })
    },

    delete(store_id, callback) {
        desk_mongo.find({ store_id: store_id }, (err, desks) => {
            for (let desk of desks) {
                desk.remove((err) => {
                    if (err) console.log('ERROR: 移除桌号失败！');
                });
            }
        });
        if (callback) callback(true);
    },

    getDeskAll(callback) {
        desk_mongo.find({}).exec((err, desk) => {
            callback(desk);
        }).sort({ number: 1 });
    },

    getDeskById(id, callback) {
        desk_mongo.findById(id, desk => {
            callback(desk);
        });
    },

    getDeskByStore(store_id) {
        return new Promise((resolve, reject) => {
            desk_mongo.aggregate([{
                $match: { store_id: objectId(store_id) }
            }, {
                $group: {
                    _id: { floor: "$floor" },
                    floor: { $first: "$floor" },
                    desk: { $push: { _id: "$_id", number: "$number", status: "$status", floor: "$floor" } }
                }
            }, {
                $sort: {
                    floor: 1,
                    desk: 1
                }
            }, {
                $project: {
                    _id: 0,
                    floor: 1,
                    desk: 1
                }
            }], (err, docs) => {
                if (docs) {
                    resolve(docs)
                } else {
                    reject('get docs fail')
                }
            });
        })
    },
    getDeskByFloor(store_id, floor) {
        return new Promise((resolve, reject) => {
            desk_mongo.find({ store_id: store_id, floor: floor }, (err, desks) => {
                resolve(desks);
            }).sort({ number: 1 });
        })
    },

    deleteDesk(_id) {
        return new Promise((resolve, reject) => {
            desk_mongo.find({ _id: _id }).remove(err => {
                if (err) {
                    reject(err)
                }
                resolve(true)
            })
        });
    },
    deleteDeskByFloor(floor) {
        return new Promise((resolve, reject) => {
            desk_mongo.find({ floor: floor })
                .remove(err => {
                    resolve(true)
                })
        });
    }
};

module.exports = exports;
