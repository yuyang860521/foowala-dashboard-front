/*
 * Author: kain·shi <kain@foowala.com>
 * Module description: 商店
 */

var async = require('async'),
    mongoose = require('mongoose'),
    moment = require('moment'),
    localTime = require('moment-timezone'),
    _product = require('./product.service'),
    _desk = require('./desk.service'),
    _work = require('./work.service'),
    order_mongo = mongoose.model('order'),
    order_item_mongo = mongoose.model('order_item'),
    message = require('../helpers/message'),
    menu_mongo = mongoose.model('menu'),
    work_mongo = mongoose.model('work'),
    staff_mongo = mongoose.model('staff'),
    label_mongo = mongoose.model('label');

const order = {
    getOrderById(_id, callback) {
        order_mongo.findById(_id, order => {
            callback(order);
        });
    },

    getOrderByIdPromise(option) {
        return new Promise((resolve, reject) => {
            order_mongo.findOne(option, (err, order) => {
                if (err) {
                    console.log(err);
                }
                resolve(order);
            });
        })
    },
    /**
     * 开桌初始化订单
     * @param  {[objectid]}   store_id 门店 ID
     * @param  {[number]}   desk     桌号
     */
    insertOrder(store_id, desk, callback) {
        staff_mongo.findOne({ open_id: desk.open_id }, (err, staff) => {
            order_mongo.findOne({
                store_id: store_id,
                desk_id: { $in: [desk._id] },
                status: { $nin: [2, 3] }
            }, (err, order) => {
                if (order) {
                    callback(false, order);
                } else {
                    var str = "" + localTime.tz(moment(), "Asia/Shanghai").unix(),
                        pad = "000000000",
                        _id = localTime.tz(moment(), "Asia/Shanghai").format("YYYY") + localTime.tz(moment(), "Asia/Shanghai").format("MM") + pad.substring(0, pad.length - str.length) + str;
                    const now = new Date().now,
                        format_time = localTime.tz(moment(now), "Asia/Shanghai").format("YYYY-MM-DD"),
                        format_time_sec = localTime.tz(moment(now), "Asia/Shanghai").format("YYYY-MM-DD hh:mm:ss");
                    var model = new order_mongo({
                        _id: _id,
                        store_id: desk.store_id,
                        desk_id: desk._id,
                        desk_number: desk.desk_number,
                        people_number: desk.people_number,
                        staff_id: staff._id,
                        staff_nickname: staff.nickname,
                        format_time: format_time,
                        format_time_sec: format_time_sec,
                        job_number: staff.job_number
                    });
                    model.save(err => {
                        if (err) { console.log(err) }
                        if (err) return callback(false, null);
                        _work.update(staff, model._id, err => {
                            if (err) console.log(err);
                        });
                        return callback(true, model);
                    });
                }
            })
        })
    },

    insertOrderAgain(store_id, desk, callback) {
        staff_mongo.findOne({ open_id: desk.open_id }, (err, staff) => {
            this.getOrderByDesk(store_id, desk._id, order => {
                if (err) {
                    callback(false);
                } else {
                    var str = "" + localTime.tz(moment(), "Asia/Shanghai").unix(),
                        pad = "000000000",
                        _id = localTime.tz(moment(), "Asia/Shanghai").format("YYYY") + localTime.tz(moment(), "Asia/Shanghai").format("MM") + pad.substring(0, pad.length - str.length) + str;
                    const now = new Date().now,
                        format_time = localTime.tz(moment(now), "Asia/Shanghai").format("YYYY-MM-DD"),
                        format_time_sec = localTime.tz(moment(now), "Asia/Shanghai").format("YYYY-MM-DD hh:mm:ss");
                    var model = new order_mongo({
                        _id: _id,
                        store_id: desk.store_id,
                        desk_id: desk._id,
                        desk_number: desk.desk_number,
                        people_number: desk.people_number,
                        staff_id: staff._id,
                        staff_nickname: staff.nickname,
                        format_time: format_time,
                        format_time_sec: format_time_sec,
                        job_number: staff.job_number
                    });
                    model.save(err => {
                        if (err) { console.log(err) }
                        if (err) return callback(false, null);
                        _work.update(staff, model._id, err => {
                            if (err) console.log(err);
                        });
                        return callback(true, model);
                    });
                }
            });
        })
    },
    /**
     * [通过门店桌号获取正在进行的订单]
     * @param  {[type]}   store_id    [门店 Id]
     * @param  {[type]}   desk_number [门店桌号]
     */
    getOrderByDesk(store_id, desk_id, callback) {
        let desk_ids=[];
        if (Array.isArray(desk_id)) {
            desk_ids = desk_id;
        }else {
            let rs = /\,/g;
            desk_ids = desk_id.split(rs);
        }
        order_mongo.findOne({ store_id: store_id, desk_id: {$in:desk_ids}, status: { $in: [0,1] } })
            .sort({ CreateTime: -1 })
            .limit(1)
            .exec()
            .then(order => {
                if (order) {
                    callback(true, order);
                } else {
                    callback(false, null)
                }
            })
    },
    /**
     * [根据桌号获取正在进行的订单订单]
     * @param  {[type]}   store_id [description]
     * @param  {[type]}   desk_id  [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    getOrdersByDesk(store_id, desk_id, sort) {
        return order_mongo.find({
                store_id: store_id,
                desk_id: {$in:[desk_id]},
                status: { $nin: [2, 3] }
            })
            .sort({ CreateTime: sort })
            .exec()
            .then(orders => {
                if (orders) {
                    return orders;
                }
                return Promise.reject('no such orders!');
            })
    },

    /**
     * [修改订单的信息]
     * @param  {[type]}   id       [订单 Id]
     * @param  {[type]}   data     [修改的信息]
     */
    updateOrder(id, data, callback) {
        this.getOrderById(id, order => {
            if (order) {
                if (data.desk) order.desk_number = data.desk;
                if (data.people_number) order.people_number = data.people_number;

                order.save(err => {
                    if (err) {
                        console.error('ERROR: 订单修改失败，订单号', id);
                        if (callback) callback(false);
                    } else callback(true);
                });
            } else if (callback) callback(false);
        });
    },
    /**
     * [提交订单，打印小票，更改所有菜的状态]
     * @param  {[type]}   order_id [description]
     */
    placeOrder(order_id, callback) {
        this.getOrderById(order_id, order => {
            if (!order) return callback(false, null);
            // 查找所有的菜
            if (order.status === 1) {
                order_item_mongo.update({ order_id: order._id }, { is_add: false }, { multi: true }, (err, row) => {
                    if (err) return callback(false);
                    row.desk_id = order.desk_id[0];
                    row.desk_number = order.desk_number[0];
                    return callback(order, row);
                });
            } else {
                order.status = 1;
                order.save(err => {
                    if (err) { callback(false, null) }
                    order_item_mongo.update({ order_id: order._id }, { is_add: false }, { multi: true }, (err, row) => {
                        if (err) return callback(false);
                        row.desk_id = order.desk_id[0];
                        row.desk_number = order.desk_number[0];
                        return callback(order, row);
                    });
                })
            }
        });
    },
    /**
     * [收银并且完成订单]
     * @param  {[type]}   data     [数据]
     */
    completeOrder(data, callback) {
        this.getOrderById(data.order_id, order => {
            if (order) {
                // 修改订单信息
                const time = new Date(),
                    format_time = localTime.tz(moment(time), "Asia/Shanghai").format('YYYY-MM-DD hh:mm:ss');
                order.clear_time = {
                    time: time,
                    format_time: format_time
                };
                order.status = 3;
                order.discount = data.discount;
                order.pay = data.pay;
                order.actual_payment = data.actual_payment; // 实际收银
                order.real_payment = data.real_payment; // 实际收银
                // 保存提交订单信息
                order.save((err, order) => {
                    if (err) {
                        console.error('ERROR: 订单修改失败，订单号', data._id);
                        if (callback) return callback(false, null);
                    } else return callback(true, order);
                });

            } else if (callback) return callback(false, null);

        })
    },
    /**
     * [订单新增菜]
     * @param  {[type]}   order_id   [订单 id]
     * @param  {[type]}   product_id [商品 id]
     */
    insertOrderItem(order_id, product_id, is_add, callback) {
        // 查询小票中是否含有商品，如果有则增加数量
        // order_item_mongo.findOne({ order_id, product_id, is_add: true, status: false },
        //  (err, orderitem) => {
        //     if (orderitem) {
        //         orderitem.number += 1;
        //         orderitem.total += orderitem.price;
        //         orderitem.actual_payment += orderitem.price;
        //         orderitem.save(err => {
        //             if (err) return callback(false, null);
        //             this.updateOrderTotal(order_id, (bo, total) => {
        //                 if (bo) {
        //                     let account = {}
        //                     account.actual_payment = Number(total.actual_payment).toFixed(2);
        //                     account.discount = (total.total - total.actual_payment).toFixed(2);
        //                     return callback(true, { account, orderitem });
        //                 } else {
        //                     return callback(true, { total: 0, orderitem: orderitem });
        //                 }
        //             });
        //         });
        //     } else {
        //         _product.getProductById(product_id, product => {
        //             if (product) {
        //                 menu_mongo.findOne(product.menu_id, (err, menu) => {
        //                     var orderitem = new order_item_mongo({
        //                         is_add: true,
        //                         order_id: order_id,
        //                         menu_id: product.menu_id, //menu id
        //                         menu_name: menu.name,
        //                         product_id: product._id, // 绑定商品
        //                         product_name: product.name, // 绑定商品
        //                         price: product.price, // 单价
        //                         img: product.img_url, // 商品图片
        //                         spec: product.unit, // 规格
        //                         total: product.price,
        //                         actual_payment: product.price,
        //                         printer_num: menu.printer_num
        //                     });
        //                     orderitem.save(err => {
        //                         if (err) return callback(false, null);
        //                         this.updateOrderTotal(order_id, (bo, total) => {
        //                             if (bo) {
        //                                 let account = {};
        //                                 account.actual_payment = Number(total.actual_payment).toFixed(2);
        //                                 account.discount = (total.total - total.actual_payment).toFixed(2);
        //                                 return callback(true, { account, orderitem });
        //                             } else {
        //                                 return callback(true, { total: 0, orderitem: orderitem });
        //                             }
        //                         });
        //                     });
        //                 })
        //             } else callback(false, null);
        //         });
        //     }
        // });
        _product.getProductById(product_id, product => {
            if (product) {
                menu_mongo.findOne(product.menu_id, (err, menu) => {
                    var orderitem = new order_item_mongo({
                        is_add: true,
                        order_id: order_id,
                        menu_id: product.menu_id, //menu id
                        menu_name: menu.name,
                        product_id: product._id, // 绑定商品
                        product_name: product.name, // 绑定商品
                        price: product.price, // 单价
                        img: product.img_url, // 商品图片
                        spec: product.unit, // 规格
                        total: product.price,
                        actual_payment: product.price,
                        printer_num: menu.printer_num
                    });
                    orderitem.save(err => {
                        if (err) return callback(false, null);
                        this.updateOrderTotal(order_id, (bo, total) => {
                            if (bo) {
                                let account = {};
                                account.actual_payment = Number(total.actual_payment).toFixed(2);
                                account.discount = (total.total - total.actual_payment).toFixed(2);
                                return callback(true, { account, orderitem });
                            } else {
                                return callback(true, { total: 0, orderitem: orderitem });
                            }
                        });
                    });
                })
            } else callback(false, null);
        });
    },
    /**
     * [修改订单总价，通过订单中的菜]
     * @param  {[type]}   order_id       [订单 id]
     */
    updateOrderTotal(order_id, callback) {
        this.getOrderById(order_id, order => {
            if (order) {
                this.getOrderItemByOrderTotal(order_id, (result) => {
                    if (result) {
                        order.actual_payment = Number(result.actual_payment).toFixed(2);
                        order.total = Number(result.total).toFixed(2);
                    } else {
                        order.actual_payment = 0;
                        order.total = 0;
                    }
                    order.save(err => {
                        if (err) {
                            console.log(err);
                            console.error('ERROR：修改订单总价失败，订单号：', order_id);
                            if (callback) callback(false);
                        } else if (callback) callback(true, result);
                    });

                });
            } else if (callback) callback(false);
        });
    },

    updateOrderItem(item_id, data, callback) {
        this.getOrderItemById(item_id, order_item => {
            if (order_item) {
                if (data.discount) {
                    order_item.discount = Number(data.discount); // 记录折扣
                    let actual_payment = Math.round((order_item.price * order_item.number) * (Number(data.discount) / 100)).toFixed(2);
                    order_item.actual_payment = actual_payment;
                }
                if (data.number) {
                    order_item.number = data.number;
                    order_item.total = (order_item.price * data.number).toFixed(2);
                }
                order_item.save(err => {
                    if (err) {
                        console.error('ERROR：修改订单项失败，订单项编号：', order_item._id);
                        if (callback) callback(false);
                    } else {
                        this.updateOrderTotal(order_item.order_id);
                        callback(true);
                    }
                });
            } else if (callback) callback(false);
        });
    },

    updateOrderItemById(_id, data, callback) {
        this.getOrderItemById(_id, order_item => {
            if (order_item) {
                if (data.number && data.discount) {
                    order_item.discount = Number(data.discount); // 记录折扣
                    order_item.number = data.number;
                    order_item.total = order_item.price * data.number;
                    order_item.actual_payment = Math.round((order_item.price * order_item.number) * (Number(data.discount) / 100)).toFixed(2);
                }
                if (data.labels) {
                    order_item.labels = data.labels;
                }
                order_item.save(err => {
                    if (err) {
                        console.error('ERROR：修改订单项失败，订单项编号：', order_item._id);
                        if (callback) callback(false);
                    } else {
                        this.updateOrderTotal(order_item.order_id);
                        callback(true);
                    }
                });
            } else if (callback) callback(false);
        });
    },

    cancelOrder(store_id, order_id, callback) {
        order_mongo.update({ store_id, _id: order_id }, { status: 2 }, { upsert: true }, (err, row) => {
            if (err) return callback(false);
            return callback(true);
        });
    },

    cancelOrderPromise(store_id, order_id) {
        return order_mongo.update({ store_id, _id: order_id }, { status: 2 }, { upsert: true })
            .exec()
            .then((err, row) => {
                if (err) {
                    return Promise.reject(err)
                }
                return row;
            })
    },

    deleteOrder(store_id, order_id) {
        return new Promise((resolve, reject) => {
            order_mongo.findOne({ store_id: store_id, _id: order_id, status: { $in: [0] } }, (err, order) => {
                if (order) {
                    order.remove(err => {
                        if (err) { reject(err) }
                        return resolve(order)
                    });
                } else {
                    return reject("no this order!")
                }
            });
        })
    },

    deleteOrderPromise(store_id, order_id) {
        return order_mongo.findOne({ store_id: store_id, _id: order_id, status: { $in: [0] } })
            .remove()
            .exec();
    },

    deleteOrderItem(item_id, callback) {
        this.getOrderItemById(item_id, order_item => {
            if (order_item) {
                order_item.remove(err => {
                    if (err) {
                        console.error('ERROR：删除订单项失败，订单项编号：', order_item._id);
                        if (callback) callback(false);
                    } else {
                        this.updateOrderTotal(order_item.order_id);
                        callback(true);
                    }
                });
            } else callback(true);
        });
    },

    cancelOrderItem(_id) {
        return new Promise((resolve, reject) => {
            order_item_mongo.findOne(_id, (err, order_item) => {
                if (err) { reject(err) }
                order_item.is_cancled = true;
                order_item.save(err => {
                    this.updateOrderTotal(order_item.order_id);
                    resolve(order_item)
                })
            })
        })
    },

    getOrderAll(callback) {
        order_mongo.find({}).exec((err, order) => {
            callback(order);
        })
    },

    getOrder(store_id, _id, callback) {
        order_mongo.findOne({ store_id, _id }, order => {
            callback(order);
        });
    },

    getOrderByIds(ids, callback) {
        order_mongo.find({ _id: { $in: ids } }, (err, orders) => {
            callback(orders);
        }).sort({ startTime: 1 });
    },

    getOrderItemById(_id, callback) {
        order_item_mongo.findById(_id, order_item => {
            callback(order_item);
        });
    },

    getOrderItemByOrder(order_id, callback) {
        order_item_mongo.find({ order_id }, (err, order_items) => {
            if (err) { console.log(err) }
            this.getOrderItemByOrderTotal(order_id, result => {
                callback({ order_items, result });
            });
        });
    },

    getOrderItemByOrderPromise(option) {
        return new Promise((resolve, reject) => {
            const _id = option.order_id;
            option.is_cancled = false;
            order_mongo.findOne({ _id }, {
                'people_number': 1,
                'format_time_sec': 1,
                'staff_nickname': 1,
                'desk_number': 1
            }, (err, order) => {
                order_item_mongo.find(option, {
                    'spec': 1,
                    'actual_payment': 1,
                    'total': 1,
                    'discount': 1,
                    'price': 1,
                    'number': 1,
                    'product_name': 1,
                    'labels': 1
                }, (err, order_items) => {
                    let result = {};
                    let info = {};
                    if (err) {
                        return reject(err)
                    }
                    this.getOrderItemByOrderTotalPromise(option)
                        .then(data => {
                            info.point_time = order.format_time_sec;
                            info.desk_number = order.desk_number[0];
                            info.staff_name = order.staff_nickname;
                            info.people_number = order.people_number;
                            info.order_id = order._id;
                            result.info = info;
                            result.orderitems = order_items;
                            result.result = data;
                            resolve(result);
                        })
                        .catch(err => {
                            console.log(err);
                            reject(err)
                        })
                });
            })
        })
    },

    getOrderItemByOrderTotal(id, callback) {
        order_item_mongo.aggregate([{
            $match: { order_id: id, is_cancled: { $nin: [true] } }
        }, {
            $group: {
                _id: "$order_id",
                total: { $sum: '$total' },
                actual_payment: { $sum: '$actual_payment' }
            }
        }], (err, docs) => {
            if (docs && docs.length > 0) {
                let money = {};
                money.total = Math.round(Number(docs[0].total)).toFixed(2);
                money.actual_payment = Math.round(Number(docs[0].actual_payment)).toFixed(2);
                return callback(money);
            } else {
                return callback(false);
            }
        });
    },

    getOrderItemByOrderTotalPromise(option) {
        return new Promise((resolve, reject) => {
            const order_id = option.order_id;
            order_item_mongo.aggregate([{
                $match: { order_id: order_id, is_cancled: { $nin: [true] } }
            }, {
                $group: {
                    _id: "$order_id",
                    total: { $sum: '$total' },
                    actual_payment: { $sum: '$actual_payment' }
                }
            }], (err, docs) => {
                if (err) {
                    return reject(err);
                }
                if (docs && docs.length > 0) {
                    let money = {};
                    money.total = docs[0].total;
                    money.actual_payment = docs[0].actual_payment;
                    money.discount_money = docs[0].total - docs[0].actual_payment;
                    return resolve(money)
                } else if (docs.length === 0) {
                    let money = {};
                    money.total = 0;
                    money.actual_payment = 0;
                    money.discount_money = 0;
                    return resolve(money)
                } else {
                    return reject("no such order_item")
                }
            });
        })
    },

    getOrderItemByMenuId(_id) {
        return new Promise((resolve, reject) => {
            order_item_mongo.aggregate([{
                $match: { order_id: _id, is_cancled: { $nin: [true] } }
            }, {
                $group: {
                    _id: { is_add: "$is_add", menu_id: "$menu_id", menu_name: "$menu_name" },
                    products: {
                        $push: {
                            _id: "$_id",
                            product_name: "$product_name",
                            product_id: "$product_id",
                            price: "$price",
                            number: "$number",
                            total: "$total",
                            actual_payment: "$actual_payment",
                            discount: "$discount"
                        }
                    }
                }
            }], (err, docs) => {
                if (docs) {
                    resolve(docs)
                } else {
                    reject('get group orderitem fail')
                }
            });
        })
    },

    getOrderItemByOrderidWhichisAdd(option) {
        return new Promise((resolve, reject) => {
            const order_id = option.order_id;
            order_item_mongo.aggregate([{
                $match: { order_id: order_id, is_add: true }
            }, {
                $group: {
                    _id: { printer_num: "$printer_num" },
                    printer_num:{$first:"$printer_num" },
                    products: { $push: { _id: "$_id", is_add: "$is_add", product_name: "$product_name", product_id: "$product_id", price: "$price", number: "$number", total: "$total", actual_payment: "$actual_payment", labels: "$labels" } }
                }
            }, {
                $project: {
                    _id: 0,
                    printer_num:1,
                    products: 1
                }
            }], (err, docs) => {
                if (docs) {
                    resolve(docs)
                } else {
                    reject('get group orderitem fail')
                }
            });
        })
    },

    countByDesk(desk_id) {
        return order_mongo.find({ desk_id: { $in: [desk_id] }, status: { $nin: [2, 3] } })
               .exec()
    },
    /**
     * [分桌]
     * @param  {[type]} req   [description]
     * @param  {[type]} reply [description]
     * @return {[type]}       [description]
     */
    orderDeskChange(req, reply) {
        const desk_ids = [req.payload.desk_id],
            desk_nums = [req.payload.desk_num],
            old_desk_id = req.payload.old_desk_id,
            credentials = req.auth.credentials,
            store_id = credentials.store_id,
            msg = new message();
        order_mongo.findOne({desk_id: {$in:[old_desk_id]}, status: { $in: [0, 1] }})
            .then(order => {
                order.desk_id = desk_ids;
                order.desk_number = desk_nums;
                return order.save();
            })
            .then(order => {
                let status = 2 ;
                if (order.status === 0) {
                    status = 1;
                }else {
                    status = 2;
                }
                let data = {
                    _id: req.payload.desk_id,
                    store_id: store_id,
                    status: status
                };
                return _desk.updateStatusCombineAndDivide(data);

            })
            .then(desk => {
                let old_desk_data = {
                    _id: req.payload.old_desk_id,
                    store_id: store_id,
                    status: 0
                };
                return _desk.updateStatusCombineAndDivide(old_desk_data);
            })
            .then(desk => {
                reply(msg.success("update order desk success", desk))
            })
            .catch(err => {
                console.log(err);
                reply(msg.unsuccess("update order desk fail"))
            })
    },
    /**
     * [合桌子]
     * @param  {[type]} req   [description]
     * @param  {[type]} reply [description]
     * @return {[type]}       [description]
     */
    orderDeskcombine(req, reply) {
        const desk_id = req.payload.desk_id,
            desk_num = req.payload.desk_num,
            old_desk_id = req.payload.old_desk_id,
            credentials = req.auth.credentials,
            store_id = credentials.store_id,
            msg = new message();
        order_mongo.update({desk_id:{$in:[old_desk_id]}, status: { $in: [0, 1] }}, {$addToSet:{desk_id:desk_id, desk_number:desk_num}}, {multi:true})
            .then(row => {
                let data = {
                    _id: req.payload.desk_id,
                    store_id: store_id,
                    status: 4
                };
                return _desk.updateStatusCombineAndDivide(data);
            })
            .then(desk => {
                let old_desk_data = {
                    _id: req.payload.old_desk_id,
                    store_id: store_id,
                    status: 4
                };
                return _desk.updateStatusCombineAndDivide(old_desk_data);
            })
            .then(desk => {
                reply(msg.success("update order desk success", desk))
            })
            .catch(err => {
                console.log(err);
                reply(msg.unsuccess("update order desk fail"))
            })
    }
   
};

module.exports = exports = order;
