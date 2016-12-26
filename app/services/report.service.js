/*
 * Author: Magic·Zhang <magic@foowala.com>
 * Module description: 日结 结班service
 */

var async = require('async'),
    mongoose = require('mongoose'),
    mongo_helper = require('../helpers/mongo_helper'),
    _order = require('./order.service'),
    _store = require('./store.service'),
    order_mongo = mongoose.model('order'),
    report_mongo = mongoose.model('report'),
    work_mongo = mongoose.model('work'),
    moment = require('moment'),
    objectId = require('objectid'),
    _staff = require('./staff.service'),
    _total = require('../helpers/total_money'),
    localTime = require('moment-timezone');

const report_helper = new mongo_helper(report_mongo);

var exports = {
    /**
     *pay:0 cash, 1 card,2 alipay, 3 wxpay
     */
    getReportNotDone(store_id) {
        return new Promise((resolve, reject) => {
            const status = 0;
            report_helper.findOne({ store_id, status })
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    console.error(err)
                    reject("get report fail")
                })
        })
    },

    getReportById(store_id, report_id) {
        return new Promise((resolve, reject) => {
            report_helper.findOne({ store_id: store_id, _id: report_id })
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    console.error(err)
                    reject("get report by id fail")
                })
        })
    },

    getReportByIdDonePreview(store_id, report_id) {
        return new Promise((resolve, reject) => {
            report_helper.findOne({ store_id: store_id, _id: report_id })
                .then(result => {
                    let report = {};
                    report.report_id = result._id;
                    report.clearing = JSON.parse(result.clearing);
                    report.payment = JSON.parse(result.payment);
                    report.title = JSON.parse(result.title);
                    report.cancel_order = JSON.parse(result.cancel_order);
                    report.open_account = JSON.parse(result.open_account);
                    resolve(report);
                })
                .catch(err => {
                    console.error(err)
                    reject("get report by id fail")
                })
        })
    },
    /**
     * [getDayReportListInMonth 获取门店所有日结列表， 通过月份区分]
     * @param  {[type]} store_id [description]
     * @param  {[type]} staff_id [description]
     * @return {[type]}          [description]
     */
    getDayReportListInMonth(store_id, staff_id) {
        return new Promise((resolve, reject) => {
            report_mongo.aggregate([{
                $match: { "store_id": objectId(store_id) }
            }, {
                $group: {
                    _id: { "year": "$format_time.year", "month": "$format_time.month" },
                    year: { $first: "$format_time.year" },
                    month: { $first: "$format_time.month" },
                    report_id: { $push: "$_id" }
                }
            }, {
                $sort: {
                    year: 1,
                    month: 1
                }
            }, {
                $project: {
                    _id: 0,
                    year: 1,
                    month: 1,
                    report_id: 1
                }
            }], (err, docs) => {
                if (err) {
                    return reject(err)
                }
                return resolve(docs)
            });
        })
    },
    /**
     * [getDayReportListByMonth 通过月份获取门店日结列表]
     * @param  {[type]} store_id [description]
     * @param  {[type]} staff_id [description]
     * @return {[type]}          [description]
     */
    getDayReportListByMonth(month, store_id) {
        return new Promise((resolve, reject) => {
            report_mongo.aggregate([{
                $match: { "format_time.year": month.year, "format_time.month": month.month, "store_id": objectId(store_id) }
            }, {
                $group: {
                    _id: { "_id": "$_id" },
                    day: { $first: "$format_time.day" },
                    date: { $first: "$format_time.full" },
                    open_time: { $first: "$open_time" },
                    status: { $first: "$status" },
                    report_id: { $first: "$_id" },
                    total: { $first: "$total_money" }
                }
            }, {
                $sort: {
                    day: -1,
                    open_time:-1
                }
            }, {
                $project: {
                    _id: 0,
                    day: 1,
                    date: 1,
                    status: 1,
                    report_id: 1,
                    total: 1,
                    open_time:1
                }
            }], (err, docs) => {
                if (err) {
                    return reject(err)
                }
                return resolve(docs)
            });
        })
    },

    getReportByWorkId(work_id) {
        return new Promise((resolve, reject) => {
            work_mongo.findOne({ _id: objectId(work_id[0]) }, (err, work) => {
                const _id = work.report_id;
                report_helper.findOne({ _id })
                    .then(result => {
                        resolve(result);
                    })
                    .catch(err => {
                        console.error(err)
                        reject("get report fail")
                    })
            })
        })
    },

    getClassReport(store_id, staff_id, open_time) {
        return new Promise((resolve, reject) => {
            let order_ids = [],
                bill_ids = [];
            const query = work_mongo.find({ staff_id: staff_id });
            query.exec((err, works) => {
                if (err) { console.log(err) }
                const report_time = localTime.tz(moment(open_time), "Asia/Shanghai").format('YYYY-MM-DD');
                async.each(works, (work, callback) => {
                    order_ids = order_ids.concat(work.order_ids);
                    bill_ids = order_ids.concat(work.bill_ids);
                    return callback();
                }, (err) => {
                    let report = {};
                    this.getOrderByIdsLeftBottom(order_ids)
                        .then(results => {
                            report.left = results.left;
                            report.bottom = results.bottom;
                            return this.getOrderByIdsRight(order_ids, store_id, open_time)
                        })
                        .then(results => {
                            report.right = results;
                            resolve(report)
                        })
                        .catch(err => {
                            reject(err);
                        })
                })
            })
        })
    },

    getClassReportListByTime(store_id, staff_id) {
        return new Promise((resolve, reject) => {
            work_mongo.aggregate([{
                $match: { "store_id": objectId(store_id), "staff_id": objectId(staff_id) }
            }, {
                $group: {
                    _id: { "year": "$format_time.year", "month": "$format_time.month", "day": "$format_time.day" },
                    work_id: { $push: "$_id" },
                    date: { $first: "$format_time.full" },
                    startTime: { $first: "$startTime" }
                }
            }, {
                $sort: {
                    startTime: -1
                }
            }, {
                $project: {
                    _id: 0,
                    startTime: 1,
                    work_id: 1,
                    date: 1
                }
            }, {
                $limit: 31
            }], (err, docs) => {
                if (err) {
                    return reject(err)
                }
                return resolve(docs)
            });
        })
    },

    getClassReportOrderList(report_id, store_id, staff_id, open_time) {
        return new Promise((resolve, reject) => {
            let order_ids = [],
                bill_ids = [];
            const query = work_mongo.find({ endTime: { $in: [null] }, store_id: store_id, staff_id: staff_id });
            query.exec((err, works) => {
                if (err) { console.log(err) }
                const report_time = localTime.tz(moment(open_time), "Asia/Shanghai").format('YYYY-MM-DD');
                async.each(works, (work, callback) => {
                    order_ids = order_ids.concat(work.order_ids);
                    bill_ids = order_ids.concat(work.bill_ids);
                    return callback();
                }, (err) => {
                    let report = {};
                    this.getOrderByIdsLeftBottom(order_ids)
                        .then(results => {
                            report.order_list = results.left;
                            report.order_count = results.bottom.order_count;
                            report.people_number = results.bottom.people_number;
                            resolve(report)
                        })
                        .catch(err => {
                            reject(err);
                        })
                })
            })
        })
    },

    getClassReportOrderListByWorkId(report_id, store_id, staff_id, open_time, work_id) {
        return new Promise((resolve, reject) => {
            let order_ids = [],
                bill_ids = [];
            const query = work_mongo.find({ store_id: store_id, staff_id: staff_id, _id:{$in:work_id} });
            query.exec((err, works) => {
                if (err) { console.log(err) }
                const report_time = localTime.tz(moment(open_time), "Asia/Shanghai").format('YYYY-MM-DD');
                async.each(works, (work, callback) => {
                    order_ids = order_ids.concat(work.order_ids);
                    bill_ids = order_ids.concat(work.bill_ids);
                    return callback();
                }, (err) => {
                    let report = {};
                    this.getOrderByIdsLeftBottom(order_ids)
                        .then(results => {
                            report.order_list = results.left;
                            report.order_count = results.bottom.order_count;
                            report.people_number = results.bottom.people_number;
                            resolve(report)
                        })
                        .catch(err => {
                            reject(err);
                        })
                })
            })
        })
    },

    getClassReportClearing(report_id, store_id, staff_id, open_time, work_id) {
        return new Promise((resolve, reject) => {
            let order_ids = [],
                bill_ids = [];
            const query = work_mongo.find({ _id: { $in: work_id }, store_id: store_id, staff_id: staff_id });
            query.exec((err, works) => {
                if (err) { console.log(err) }
                const report_time = localTime.tz(moment(open_time), "Asia/Shanghai").format('YYYY-MM-DD');
                async.each(works, (work, callback) => {
                    order_ids = order_ids.concat(work.order_ids);
                    bill_ids = order_ids.concat(work.bill_ids);
                    return callback();
                }, (err) => {
                    this.getOrderByIdsRight(order_ids, store_id, open_time, staff_id)
                        .then(results => {
                            resolve(results)
                        })
                        .catch(err => {
                            reject(err);
                        })
                })
            })
        })
    },

    getDayReportPreview(report_id, store_id, staff_id, open_time) {
        return new Promise((resolve, reject) => {
            let order_ids = [],
                bill_ids = [];
            const query = work_mongo.find({ report_id: report_id, store_id: store_id });
            query.exec((err, works) => {
                if (err) { console.log(err) }
                async.each(works, (work, callback) => {
                    order_ids = order_ids.concat(work.order_ids);
                    bill_ids = order_ids.concat(work.bill_ids);
                    return callback();
                }, (err) => {
                    this.getOrderByIdsRight(order_ids, store_id, open_time, staff_id, report_id)
                        .then(results => {
                            resolve(results)
                        })
                        .catch(err => {
                            reject(err);
                        })
                })
            })
        })
    },

    saveDayReportPreview(report_id, store_id, staff_id, open_time) {
        return new Promise((resolve, reject) => {
            let order_ids = [],
                bill_ids = [];
            const query = work_mongo.find({ report_id: report_id, store_id: store_id });
            query.exec((err, works) => {
                if (err) { console.log(err) }
                async.each(works, (work, callback) => {
                    order_ids = order_ids.concat(work.order_ids);
                    bill_ids = order_ids.concat(work.bill_ids);
                    return callback();
                }, (err) => {
                    this.getOrderByIdsRight(order_ids, store_id, open_time, staff_id, report_id)
                        .then(results => {
                            let total_money = 0 ;
                            async.each(results.clearing, (cl, cb) =>{
                                if (cl.report_money) {
                                    total_money += Number(cl.report_money);
                                }
                                cb();
                            }, err => {
                                let clearing = JSON.stringify(results.clearing),
                                    payment = JSON.stringify(results.payment),
                                    open_account = JSON.stringify(results.open_account),
                                    title = JSON.stringify(results.title),
                                    cancel_order = JSON.stringify(results.cancel_order);
                                report_mongo.update({ "_id": objectId(report_id) }, {
                                    "clearing": clearing,
                                    "payment": payment,
                                    "total_money":total_money,
                                    "open_account": open_account,
                                    "cancel_order": cancel_order,
                                    "title": title,
                                    "status": 1
                                }, { upsert: true }, (err, raw) => {
                                    if (err) { console.error(err) };
                                    resolve(raw);
                                });
                            });
                        })
                        .catch(err => {
                            reject(err);
                        })
                })
            })
        })
    },

    getOrderByIdsLeftBottom(ids) {
        return new Promise((resolve, reject) => {
            const order_length = ids.length;
            order_mongo.aggregate([{
                $match: { _id: { $in: ids } }
            }, {
                $group: {
                    _id: "$staff_id",
                    left: { $push: { _id: "$_id", status: "$status", pay: "$pay", desk_number: "$desk_number", actual_payment: "$actual_payment", time: "$format_time" } },
                    people_number: { $sum: "$people_number" }
                }
            }], (err, docs) => {
                if (docs[0]) {
                    let doc = docs[0];
                    let left = doc.left;
                    async.each(left, (le, callback) => {
                        const pay = le.pay;
                        le.desk_number = le.desk_number[0];
                        switch (pay) {
                            case 0:
                                le.pay = "人民币"
                                break;
                            case 1:
                                le.pay = "刷卡"
                                break;
                            case 2:
                                le.pay = "支付宝"
                                break;
                            case 3:
                                le.pay = "微信"
                                break;
                            default:
                                le.pay = "人民币";
                                break;
                        }
                        callback()
                    }, err => {
                        let result = {};
                        const people_number = doc.people_number;
                        result.left = left;
                        result.bottom = {};
                        result.bottom.people_number = people_number;
                        result.bottom.order_count = order_length;
                        resolve(result)
                    })
                } else {
                    reject('get docs fail')
                }
            });
        })
    },

    getOrderByIdsRight(ids, store_id, open_time, staff_id, report_id) {
        return new Promise((resolve, reject) => {
            let right = {};
            this.getOrderByIdsClearing(ids)
                .then(results => {
                    right.clearing = results;
                    return this.getBillsByStaffIdsAndTime()
                })
                .then(bills => {
                    right.payment = bills;
                    return this.getOrderByIdsNotDone(ids)
                })
                .then(open_accounts => {
                    right.open_account = open_accounts;
                    return this.getReportTitle(store_id, open_time, staff_id, report_id);
                })
                .then(title => {
                    right.title = title;
                    return this.getOrderByIdsCancled(ids)
                })
                .then(result => {
                    right.cancel_order = result;
                    resolve(right)
                })
                .catch(err => {
                    console.error(err);
                    reject('get rights fail')
                })
        })
    },

    getReportTitle(store_id, open_time, staff_id, report_id) {
        return new Promise((resolve, reject) => {
            let title = {};
            _store.getStoreByIdPromise(store_id)
                .then(store => {
                    open_time = localTime.tz(moment(open_time), "Asia/Shanghai").format('YYYY-MM-DD');
                    const re_time = new Date();
                    const report_time_sec = localTime.tz(moment(re_time), "Asia/Shanghai").format('YYYY-MM-DD hh:mm:ss');
                    const str = "" + localTime.tz(moment(), "Asia/Shanghai").unix(),
                        pad = "000000000",
                        report_number = localTime.tz(moment(), "Asia/Shanghai").format("YYYY") + localTime.tz(moment(), "Asia/Shanghai").format("MM") + pad.substring(0, pad.length - str.length) + str;
                    title.open_date = open_time;
                    title.report_time = report_time_sec;
                    title.store_name = store.name;
                    title.report_number = report_number;
                    title.report_id = report_id;
                    return _staff.getStaffByIdPromise(objectId(staff_id));
                })
                .then(staff => {
                    title.staff_name = staff.nickname;
                    resolve(title);
                })
                .catch(err => {
                    reject(err)
                })
        })
    },

    getOrderByIdsClearing(ids) {
        return new Promise((resolve, reject) => {
            let clearing = {};
            this.getOrderByIdsDone(ids)
                .then(results => {
                    clearing = results;
                })
                .then(results => {
                    async.each(clearing, (doc, callback) => {
                        if (doc.type !== "合计" ) {
                            doc.report_money = Number(doc.clear_money).toFixed(2).toString();
                            doc.clear_money = Number(doc.clear_money).toFixed(2).toString();
                            doc.take_bill = "0.00";
                            doc.balance = "0.00";
                        }
                        callback()
                    }, err => {
                        resolve(clearing);
                    })
                })
                .catch(err => {
                    reject('get docs fail')
                })
        })
    },

    getBillsByStaffIdsAndTime(staff_id, time) {
        return new Promise((resolve, reject) => {
            let bills = [{
                "type": "人民币",
                "take_bill": "0",
                "time": "",
                "label": ""
            }];
            resolve(bills)
        })
    },

    getOrderByIdsDone(ids) {
        return new Promise((resolve, reject) => {
            order_mongo.aggregate([{
                $match: { _id: { $in: ids }, status: 3 }
            }, {
                $group: {
                    _id: { type: "$pay" },
                    type: { $first: "$pay" },
                    clear_money: { $sum: "$actual_payment" }
                }
            }], (err, docs) => {
                if (docs) {
                    let total_money = 0;
                    async.each(docs, (doc, callback) => {
                        const type = doc.type;
                        delete doc._id;
                        switch (type) {
                            case 0:
                                doc.type = "人民币"
                                break;
                            case 1:
                                doc.type = "刷卡"
                                break;
                            case 2:
                                doc.type = "支付宝"
                                break;
                            case 3:
                                doc.type = "微信"
                                break;
                            default:
                                doc.type = "人民币";
                                break;
                        }
                        total_money += doc.clear_money;
                        callback()
                    }, err => {
                        let total = {
                            type:"合计",
                            clear_money:total_money
                        }
                        docs.push(total)
                        resolve(docs)
                    })
                } else {
                    reject('get docs fail')
                }
            });
        })
    },

    getOrderByIdsNotDone(ids) {
        return new Promise((resolve, reject) => {
            order_mongo.aggregate([{
                $match: { _id: { $in: ids }, status: 0 }
            }, {
                $group: {
                    _id: { type: "$staff_id" },
                    desk_number: { $first: "$desk_number" },
                    open_time: { $first: "$format_time_sec" },
                    people_number: { $first: "$people_number" },
                    actual_payment: { $first: "$actual_payment" },
                }
            }], (err, docs) => {
                if (err) { reject(err) }
                if (docs) {
                    async.each(docs, (doc, callback) => {
                        delete doc._id;
                        doc.desk_number = doc.desk_number[0].toString();
                        doc.people_number = doc.people_number.toString();
                        doc.actual_payment = doc.actual_payment.toFixed(2).toString();
                        callback()
                    }, err => {
                        resolve(docs)
                    })
                } else {
                    resolve([])
                }
            });
        })
    },

    getOrderByIdsCancled(ids) {
        return new Promise((resolve, reject) => {
            order_mongo.aggregate([{
                $match: { _id: { $in: ids }, status: 2 }
            }, {
                $group: {
                    _id: { type: "$_id" },
                    order_id: { $first: "$_id" },
                    desk_number: { $first: "$desk_number" },
                    actual_payment: { $first: "$actual_payment" },
                }
            }, {
                $project: {
                    _id: 0,
                    order_id: 1,
                    desk_number: 1,
                    actual_payment: 1
                }
            }, {
                $sort: {
                    order_id: 1
                }
            }], (err, docs) => {
                if (err) { reject(err) }
                if (docs) {
                    async.each(docs, (doc, callback) => {
                        doc.desk_number = doc.desk_number[0].toString();
                        doc.actual_payment = doc.actual_payment.toFixed(2).toString();
                        callback()
                    }, err => {
                        resolve(docs)
                    })
                } else {
                    resolve([])
                }
            });
        })
    },
    /**
     * @param  {[type]}
     * @param  {Function}
     * @return {[type]}
     */
    getBillByWork(ids, callback) {
        return new Promise((resolve, reject) => {
            order_mongo.aggregate([{
                $match: { _id: { $in: ids } }
            }, {
                $group: {
                    _id: { staff_id: "$staff_id" },
                    bills: { $push: { type: "$type", money: "$money", time: "$formate_time", reason: "$label" } }
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
    /**
     * @param  {Array}
     * @param  {getOrderNotPay}
     * @return {Object}
     */
    getOrderNotPay(ids, callback) {
        return new Promise((resolve, reject) => {
            order_mongo.aggregate([{
                $match: { _id: { $in: ids }, status: 0 }
            }, {
                $group: {
                    _id: { staff_id: "$staff_id", status: 0 },
                    open_account: { $push: { desk_number: "$desk_number", open_time: "$format_time_sec", people_number: "$people_number", actual_payment: "$actual_payment" } }
                    // time: "localTime.tz(moment($CreateTime), "Asia/Shanghai").format('YYYY-MM-DD')",
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

    getReportLatest(options) {
        return new Promise((resolve, reject) => {
            report_helper.findLastest(options)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    console.error(err)
                    reject("get report fail")
                })
        })
    },

    getPrintReportDay(store_id, report_id) {
        return new Promise((resolve, reject) => {
            report_helper.findOne({ store_id: store_id, _id: report_id })
                .then(result => {
                    let report = {};
                    let clearing = JSON.parse(result.clearing);
                    let payment = JSON.parse(result.payment);
                    let cancel_order = JSON.parse(result.cancel_order);
                    let open_account = JSON.parse(result.open_account);
                    _total.total_money(clearing, payment, cancel_order, open_account, (results)=>{
                        report = results;
                        report.report_id = result._id;
                        report.title = JSON.parse(result.title);
                        resolve(report);
                    })
                })
                .catch(err => {
                    console.error(err);
                    reject("get report by id fail");
                })
        })
    },
};

module.exports = exports;
