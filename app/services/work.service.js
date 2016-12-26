/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: 工作
 */

var async = require('async'),
    mongoose = require('mongoose'),
    objectId = require('objectid'),
    _order = require('./order.service'),
    order_mongo = mongoose.model('order'),
    work_mongo = mongoose.model('work'),
    moment = require('moment'),
    localTime = require('moment-timezone'),
    _time = require('../helpers/time_help');

var exports = {
    insert(data, callback) {
        data.format_time = _time.getTimeDetail();
        var model = new work_mongo(data);
        return new Promise((resolve, reject) => {
            model.save((err, work) => {
                if (err) {
                    console.error('ERROR: 新增员工日结账单失败');
                    reject(err)
                }
                resolve(work)
            })
        })
    },

    update(staff, order_id, callback) {
        const staff_id = staff._id,
            staff_nickname = staff.nickname,
            staff_number = staff.job_number;
        this.getWorkByStaff(staff_id, work => {
            if (work) {
                work.order_ids.push(order_id);
                work.save(err => {
                    if (err) {
                        console.error('ERROR: 修改员工日结账单操作记录失败，账单号：', work._id);
                        console.dir(work);
                        if (callback) callback(false);
                    } else if (callback) callback(true);
                });
            } else if (callback) callback(false);
        });
    },
    /**
     *pay:0 cash, 1 card,2 alipay, 3 wxpay
     */
    updateOrderTotal(staff_id, data) {
        this.getWorkByStaff(staff_id, work => {
            const pay = data.pay;
            let order_total_pay;
            if (work) {
                switch (pay) {
                    case 0:
                        work.order_total_rmb += order_total_pay;
                        break;
                    case 1:
                        work.order_total_card += order_total_pay;
                        break;
                    case 2:
                        work.order_total_alipay += order_total_pay;
                        break;
                    case 3:
                        work.order_total_wxpay += order_total_pay;
                        break;
                    default:
                        break;
                }
                // work.order_ids.push(order_id);
                work.save(err => {
                    if (err) {
                        console.error('ERROR: 修改员工日结账单操作记录失败，账单号：', work._id);
                        console.dir(work);
                        if (callback) callback(false);
                    } else if (callback) callback(true);
                });
            } else if (callback) callback(false);
        });
    },

    delete(id, callback) {
        this.getMenuById(id, work => {
            if (work) return callback(true);
            work.remove(err => {
                if (err) {
                    console.error('ERROR: 删除员工日结账单失败，_id:', id);
                    console.dir(data);
                    callback(false);
                } else {
                    console.log('SUCCESS: 删除员工日结账单成功');
                    callback(true);
                }
            })
        })
    },

    intoWork(staff) {
        return new Promise((resolve, reject) => {
            // 检查工作状态
            const staff_id = staff.staff_id;
            this.getWorkByStaff(staff_id, work => {
                if (!work) {
                    this.insert(staff)
                        .then(work => {
                            resolve(work)
                        })
                        .catch(err => {
                            console.error(err)
                            reject(err);
                        })
                } else {
                    resolve(work)
                }
            })
        })
    },

    quitWork(staff_id, callback) {
        // 检查工作状态
        this.getWorkByStaff(staff_id, work => {
            if (work) {
                work.endTime = Date.now();
                work.save((err, work) => {
                    if (err) {
                        console.error('ERROR: 结束工作状态失败，员工号：', staff_id);
                        if (callback) callback(false);
                    } else if (callback) callback(true, work);
                })
            } else {
                console.error('ERROR: 没有工作状态，结束工作失败！员工号：', staff_id);
                if (callback) callback(false);
            }
        })
    },

    // 查询工作状况
    queryWork(id, callback) {
        this.getWorkById(id, (work) => {
            if (work) {
                var model = {
                    work: work
                }
                _order.getOrderByIds(work.order_ids, (orders) => {
                    model.orders = orders;
                    callback(model);
                })

            } else callback(null);
        })
    },

    getWorkAll(callback) {
        work_mongo.find({}).exec((err, works) => {
            callback(works);
        })
    },

    getWorkById(id, callback) {
        work_mongo.findById(id, (work) => {
            callback(work);
        });
    },

    getWorkByStaffALL(staff_id, callback) {
        work_mongo.find({ staff_id: staff_id }, (err, works) => {
            callback(works);
        });
    },

    getWorkByStaff(staff_id, callback) {
        work_mongo.findOne({ staff_id: staff_id, endTime:{$in: [null]}}, (err, work) => {
            callback(work);
        });
    },

    getWorkByStaffPromise(staff_id) {
        return new Promise ((resolve, reject) => {
            work_mongo.findOne({ staff_id: staff_id, endTime: { $in: [null] } }, (err, work) => {
                resolve(work);
            });
        })
    },


    getWorkRecent(staff_id, callback) {
        const query = work_mongo.find({ staff_id: staff_id }).sort({ startTime: -1 });
        query.limit(2)
            .exec((err, works) => {
                let arr = [];
                if (err) { console.log(err) };
                async.each(works, (work, callback) => {
                    arr.push(work.order_ids);
                    return callback()
                }, (err) => {
                    if (err) { console.log(err) };
                    callback(arr);
                })
            })
    },


    getWorkByStore(store_id) {
        return new Promise((resolve, reject) => {
            work_mongo.aggregate([{
                $match: { _id: { $in: ids }, status: 0 }
            }, {
                $group: {
                    _id: { staff_id: "$staff_id", status: 0 },
                    open_account: { $push: { desk_number: "$desk_number", open_time: "$format_time_sec", people_number: "$people_number", actual_payment: "$actual_payment" } }
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

    getStaffsWorking (store_id, staff_id) {
        return new Promise((resolve, reject) => {
            work_mongo.find({ store_id: store_id, endTime: { $in: [null] } }, (err, works) => {
                if (err) {reject(err)}
                async.each(works, (work, callback) => {
                    if (work.staff_id === objectId(staff_id)) {
                        delete work.staff_id;
                    }
                }, err => {
                    resolve(works)
                })
            });
        })
    }
};

module.exports = exports;
