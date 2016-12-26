/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 订单路由
 */

'use strict';

const message = require('../helpers/message'),
    async = require('async'),
    _order = require('../services/order.service'),
    _printer = require('../services/printer.service'),
    _desk = require('../services/desk.service'),
    _work = require('../services/work.service'),
    _label = require('../services/label.service'),
    _menu = require('../services/menu.service');

/**
 * [获取正在进行的订单]
 */
const getOrderInProcessing = (req, reply) => {
        let desk_id = req.params.desk_id,
            credentials = req.auth.credentials,
            store_id = credentials.store_id,
            msg = new message();
        const order_num = req.query.order_num;
        if (order_num) {
            _order.getOrdersByDesk(store_id, desk_id, 1)
                .then(result => {
                    const order = result[Number(order_num - 1)];
                    _order.getOrderItemByMenuId(order._id)
                        .then(docs => {
                            let orders = {},
                                menu_is_add = [],
                                menu_not_add = [],
                                is_add = [],
                                not_add = [];
                            for (let i = 0, len = docs.length; i < len; i++) {
                                if (docs[i]._id.is_add) {
                                    is_add.push(docs[i])
                                } else {
                                    not_add.push(docs[i])
                                }
                            }
                            order.discount = (order.total - order.actual_payment).toFixed(2);
                            orders.order_info = order;
                            orders.is_add = is_add;
                            orders.not_add = not_add;
                            reply(msg.success('请求成功!', orders));
                        })
                        .catch(err => {
                            console.log(err)
                            reply(msg.unsuccess('get order in processing fail'));
                        })
                })
                .catch(err => {
                    reply(msg.unsuccess('get order in processing fail'))
                })
        } else {
            _order.getOrderByDesk(store_id, desk_id, (bo, order) => {
                if (bo && order) {
                    _order.getOrderItemByMenuId(order._id)
                        .then(docs => {
                            let orders = {},
                                menu_is_add = [],
                                menu_not_add = [],
                                is_add = [],
                                not_add = [];
                            for (let i = 0, len = docs.length; i < len; i++) {
                                if (docs[i]._id.is_add) {
                                    is_add.push(docs[i])
                                } else {
                                    not_add.push(docs[i])
                                }
                            }
                            order.discount = (order.total - order.actual_payment).toFixed(2);
                            orders.order_info = order;
                            orders.is_add = is_add;
                            orders.not_add = not_add;
                            reply(msg.success('请求成功!', orders));
                        })
                        .catch(err => {
                            console.log(err)
                            reply(msg.unsuccess('get order in processing fail'))
                        })
                } else {
                    const data = {
                        _id: desk_id,
                        store_id: store_id,
                        status: 0
                    }
                    _desk.updateStatus(data, (bo, desk) => {
                        reply(msg.unsuccess('get order fail'))
                    })
                }
            });
        }
    },

    getOrdersProcessing = (req, reply) => {
        let desk_id = req.params.desk_id,
            credentials = req.auth.credentials,
            store_id = credentials.store_id,
            msg = new message();
        _order.getOrdersByDesk(store_id, desk_id, -1)
            .then(result => {
                let results = [];
                async.each(result, (order, callback) => {
                    _order.getOrderItemByMenuId(order._id)
                        .then(docs => {
                            let orders = {},
                                menu_is_add = [],
                                menu_not_add = [],
                                is_add = [],
                                not_add = [];
                            for (let i = 0, len = docs.length; i < len; i++) {
                                if (docs[i]._id.is_add) {
                                    is_add.push(docs[i])
                                } else {
                                    not_add.push(docs[i])
                                }
                            }
                            order.discount = (order.total - order.actual_payment).toFixed(2);
                            orders.order_info = order;
                            orders.is_add = is_add;
                            orders.not_add = not_add;
                            results.push(orders);
                            callback();
                        })
                        .catch(err => {
                            console.log(err)
                            reply(msg.unsuccess('get order in processing fail'));
                            callback();
                        })
                }, err => {
                    reply(msg.success('请求成功!', results));
                })
            })
            .catch(err => {
                reply(msg.unsuccess('get order in processing fail'))
            })
    },
    /**
     * [修改订单信息]
     */
    updateOrder = (req, reply) => {
        var data = {
                desk_number: req.payload.desk_number,
                people_number: req.payload.people_number
            },
            id = req.payload._id;
        msg = new message();

        _order.updateOrder(id, data, bo => {
            if (bo) reply(msg.success('订单信息修改成功！'));
            else reply(msg.unsuccess('订单信息修改失败！'));
        });
    },
    /**
     *get order item detail by _id
     */
    getOrderItemById = (req, reply) => {
        const _id = req.params.order_item_id,
            credentials = req.auth.credentials,
            store_id = credentials.store_id,
            msg = new message();
        _order.getOrderItemById(_id, order_item => {
            let result = {};
            const labels = order_item.labels ? order_item.labels : [];
            _label.getLabelByMenuChecked(store_id, order_item.menu_id)
                .then(arr => {
                    async.each(arr, (arr_lab, callback) => {
                        let arr_id = arr_lab._id;
                        async.each(labels, (lab, cb) => {
                            let lab_id = lab._id;
                            if (arr_id.toString() === lab_id.toString()) {
                                arr_lab.isChecked = true;
                                cb();
                            } else {
                                cb();
                            }
                        }, err => {
                            callback()
                        })
                    }, err => {
                        result._id = order_item._id;
                        result.discount = order_item.discount;
                        result.number = order_item.number;
                        result.labels = arr;
                        reply(msg.success('get order item success', result))
                    })
                })
                .catch(err => {
                    reply(msg.unsuccess('get order item fail', null))
                })
        })
    },
 
    /**
     * 点击下单后的操作
     */
    placeOrder = (req, reply) => {
        let order_id = req.payload.order_id,
            credentials = req.auth.credentials,
            store_id = credentials.store_id,
            msg = new message();
        const option = { order_id: order_id };
        _order.getOrderItemByOrderidWhichisAdd(option)
            .then(results => {
                async.each(results, (result, cbr) => {
                    let products = result.products,
                        rs = [];
                    async.each(products, (pro, cb) => {
                        let item = {};
                        let labels_pre = [];
                        item.product_name = pro.product_name;
                        item.price = Number(pro.price).toFixed(2).toString();
                        item.number = pro.number.toString();
                        item.discount_money = Number(pro.total - pro.actual_payment).toFixed(2).toString();
                        const labels = pro.labels;
                        async.each(labels, (lab, callback) => {
                            labels_pre.push(lab.label);
                            callback();
                        }, err => {
                            item.labels = labels_pre;
                        })
                        rs.push(item);
                        cb();
                    }, err => {
                        result.products = rs;
                    })
                    cbr();
                }, err=> {
                    _order.placeOrder(order_id, (order, row) => {
                        if (row) {
                            let data = {
                                _id: row.desk_id, 
                                status: 2,
                                store_id: store_id
                            };
                            _desk.updateStatusAndCheck(data, (bo, desk) => {
                                if (bo && desk) {
                                    let printerDate = {};
                                    printerDate.results = results;
                                    printerDate.info = {};
                                    printerDate.info.desk_number = order.desk_number[0].toString();
                                    printerDate.info.people_number = order.people_number.toString();
                                    return reply(msg.success('下单成功！', printerDate));
                                } else {
                                    return reply(msg.unsuccess('下单失败！', 504, data));
                                }
                            });
                        } else {
                            return reply(msg.unsuccess('下单失败！', 504, row))
                        };
                    });
                })
            })
            .catch(err => {
                console.log(err);
                return reply(msg.unsuccess('下单失败！', 500));
            })
    },

    /**
     * [完成订单]
     */
    completeOrder = (req, reply) => {
        let data = {
                order_id: req.payload.order_id,
                pay: req.payload.pay,
                real_payment: req.payload.real_payment,
                actual_payment: req.payload.actual_payment,
                discount: req.payload.discount ? Number(req.payload.discount) : 100,
                store_id: req.auth.credentials.store_id
            },
            msg = new message();
        _order.placeOrder(data.order_id, result => {
            if (result) {
                _order.completeOrder(data, (bo, order) => {
                    if (bo && order && order.desk_id.length === 1) {
                        const desk_id = order.desk_id,
                            desk_number = order.desk_number;
                        const desk_data = {
                            _id: result.desk_id,
                            store_id: data.store_id,
                            status: 0
                        }
                        _desk.updateStatusAndCheck(desk_data, (bo, rs) => {
                            if (bo && rs) {
                                const option = { order_id: data.order_id };
                                _printer.getPrintClear(option)
                                    .then(result => {
                                        return reply(msg.success('订单已完成！', result));
                                    })
                                    .catch(err => {
                                        console.log(err);
                                        return reply(msg.unsuccess('操作失败！', 500));
                                    })
                            } else return reply(msg.unsuccess('操作失败！', 504, rs));
                        });
                    } else if (bo && order && order.desk_id.length > 1) {
                        const desk_data = {
                            _id: order.desk_id,
                            store_id: data.store_id,
                            status: 0
                        }
                        _desk.updateDesksStatus(desk_data)
                             .then(row=>{
                                const option = { order_id: data.order_id };
                                return _printer.getPrintClear(option)                                  
                             })
                             .then(result => {
                                 return reply(msg.success('订单已完成！', result));
                             })
                             .catch(err => {
                                return reply(msg.unsuccess('操作失败！'));
                             })
                    } else {
                        return reply(msg.unsuccess('操作失败！', 504));
                    }
                });
            } else {
                reply(msg.unsuccess('操作失败！', 504));
            }
        })
    },
    /**
     * [向订单新增商品]
     */
    insertOrderItem = (req, reply) => {
        let data = {
                order_id: req.payload.order_id,
                product_id: req.payload.product_id,
                is_add: true
            },
            msg = new message();
        _order.insertOrderItem(data.order_id, data.product_id, data.is_add, (bo, item) => {
            if (bo) return reply(msg.success('新增菜品成功！', item));
            else return reply(msg.unsuccess('添加菜品失败！', 504));
        });
    },

    /**
     * [修改订单商品，折扣/数量]
     */
    updateOrderItem = (req, reply) => {
        var data = {
                discount: req.payload.discount,
                number: req.payload.number,
            },
            id = req.payload._id,
            msg = new message();

        if (data.number && data.number <= 0) {
            _order.deleteOrderItem(id, bo => {
                if (bo) return reply(msg.success('订单菜修改为0，删除菜！'));
                else return reply(msg.unsuccess('删除失败！', 504, id));
            });
        } else {
            _order.updateOrderItem(id, data, bo => {
                if (bo) reply(msg.success('修改成功！'));
                else reply(msg.unsuccess('修改失败！', 504, id));
            });
        }
    },
    /**
     * [修改订单商品，折扣/数量/labels]
     */
    updateOrderItemById = (req, reply) => {
        const payload = JSON.parse(req.payload);
        var data = {
                discount: payload.discount,
                number: payload.number,
                labels: payload.labels
            },
            _id = payload._id,
            msg = new message();
        _order.updateOrderItemById(_id, data, bo => {
            if (bo) reply(msg.success('修改成功！'));
            else reply(msg.unsuccess('修改失败！', 504, id));
        });
    },

    deleteOrderItem = (req, reply) => {
        var _id = req.payload._id,
            msg = new message();
        _order.deleteOrderItem(_id, bo => {
            if (bo) reply(msg.success('删除成功！'));
            else reply(msg.unsuccess('删除失败！', 504, _id));
        });
    },

    cancelOrderItem = (req, reply) => {
        var _id = req.payload._id,
            msg = new message();
        _order.cancelOrderItem({ _id })
            .then(result => {
                reply(msg.unsuccess('撤销商品成功！'));
            })
            .catch(err => {
                reply(msg.unsuccess('撤销商品失败！', 504, _id));
            })
    },

    getOrderItem = (req, reply) => {
        var order_id = req.params.order_id,
            credentials = req.auth.credentials,
            store_id = credentials.store_id,
            msg = new message();
        _order.getOrderById(order_id, order => {
            _order.getOrderItemByOrder(order_id, items => {
                items.desk_number = order.desk_number[0];
                items.people_number = order.people_number;
                reply(msg.success('请求成功！', items));
            });
        })
    },

    getOrderByTime = (req, reply) => {
        const credentials = req.auth.credentials,
            store_id = credentials.store_id,
            staff_id = credentials.staff_id,
            time = req.query.time,
            msg = new message();
        _work.getWorkByTime(staff_id, time, (works) => {
            reply(msg.success('根据时间获取订单成功！', works));
        })
    },

    getOrderRencent = (req, reply) => {
        const credentials = req.auth.credentials,
            store_id = credentials.store_id,
            num = req.payload.num ? req.payload.num : 0,
            msg = new message();
        _work.getWorkRecent(staff_id, (works) => {
            reply(msg.success('获取最近的works！', works[num]));
        })
    },

    getOrderBytoday = (req, reply) => {
        const credentials = req.auth.credentials,
            staff_id = credentials.staff_id,
            time = new Date(),
            msg = new message();
        _work.getWorkByTime(staff_id, time, (works) => {
            reply(msg.success('根据时间获取订单成功！', works));
        })
    },

    getOrderBytodayStaff = (req, reply) => {
        const credentials = req.auth.credentials,
            staff_id = credentials.staff_id,
            store_id = credentials.store_id,
            msg = new message();
        _work.getWorkByStaff(staff_id, work => {
            const time = work.startTime;
            _work.getWorkByTimeTest(staff_id, time)
                .then(results => {
                    reply(msg.success('根据时间获取订单成功！', results));
                })
                .catch(err => {
                    console.error(err);
                    reply(msg.unsuccess('根据时间获取订单 fail', null));
                })
        })
    },

    getOrderById = (req, reply) => {
        const order_id = req.params.order_id,
            msg = new message();
        _order.getOrderById(order_id, order => {
            if (order) {
                reply(msg.success('get order success', order))
            } else {
                reply(msg.unsuccess('get order fail', null))
            }
        })
    },

    cancelOrder = (req, reply) => {
        const desk_ids = req.payload.desk_id,
            order_id = req.payload.order_id,
            credentials = req.auth.credentials,
            store_id = credentials.store_id,
            msg = new message();
        let arr = [];
        if (Array.isArray(desk_ids)) {
            arr = desk_ids;
        } else {
            arr.push(desk_ids);
        }
        _order.cancelOrder(store_id, order_id, (bo) => {
            if (bo) {
                const data = {
                    _id: arr,
                    store_id: store_id,
                    status: 0
                }
                if (arr.length === 1) {
                    _desk.updateStatusAndCheck(data, (bo, desk) => {
                        console.log("bo", bo);
                        console.log("desk", desk);
                        if (bo && desk) {
                            console.log('开始撤销订单,桌号', desk.number, '门店：', desk.store_id);
                            return reply(msg.success('订单取消成功！'));
                        } else {
                            reply(msg.unsuccess('桌号取消失败！'));
                        }
                    });
                }else {
                    _desk.updateDesksStatus(data)
                         .then(row => {
                            console.log("row", row);
                            return reply(msg.success('订单取消成功！'));
                         })
                         .catch(err => {
                            reply(msg.unsuccess('桌号取消失败！'));
                         })
                }
            } else {
                return reply(msg.unsuccess('订单取消失败！'));
            }
        });
    };

const deleteOrder = (req, reply) => {
    const desk_ids = req.payload.desk_id,
        order_id = req.payload.order_id,
        credentials = req.auth.credentials,
        store_id = credentials.store_id,
        msg = new message();
    let arr = [];
    if (Array.isArray(desk_ids)) {
        arr = desk_ids;
    } else {
        arr.push(desk_ids);
    }
    const data = {
        _id: arr,
        store_id: store_id,
        status: 0
    }
    _order.deleteOrder(store_id, order_id)
        .then(order => {
            _desk.updateStatusAndCheck(data, (bo, desk) => {
                if (bo) {
                    return reply(msg.success('桌号删除成功！'))
                } else {
                    return reply(msg.unsuccess('桌号取消失败！'));
                }
            });
        })
        .catch(err => {
            return reply(msg.unsuccess('桌号删除fail！'))
        })
}

module.exports = [{
    method: 'get',
    path: '/order/{order_id}',
    config: {
        handler: getOrderById,
        description: '<p>get order by id</p>',
    }
}, {
    method: 'get',
    path: '/order/processing/{desk_id}',
    config: {
        handler: getOrderInProcessing,
        description: '<p>根据桌子_id获取正在进行的订单信息, 分桌情况等都是这一接口</p>'
    }
}, {
    method: 'get',
    path: '/orders/processing/{desk_id}',
    config: {
        handler: getOrdersProcessing,
        description: '<p>根据桌子_id获取正在进行的订单信息[多个]</p>'
    }
}, {
    method: 'put',
    path: '/order',
    config: {
        handler: updateOrder,
        description: '<p>修改订单信息</p>'
    }
}, {
    method: 'put',
    path: '/order/place',
    config: {
        handler: placeOrder,
        description: '<p>下单</p>'
    }
}, {
    method: 'put',
    path: '/order/complete',
    config: {
        handler: completeOrder,
        description: '<p>完成订单, 结账</p>'
    }
}, {
    method: 'get',
    path: '/order/item/{order_id}',
    config: {
        handler: getOrderItem,
        description: '<p>获取订单详细商品</p>'
    }
}, {
    method: 'post',
    path: '/order/item',
    config: {
        handler: insertOrderItem,
        description: '<p>新增订单商品</p>'
    }
}, {
    method: 'put',
    path: '/order/item',
    config: {
        handler: updateOrderItem,
        description: '<p>修改订单商品信息</p>'
    }
}, {
    method: 'delete',
    path: '/order/item',
    config: {
        handler: deleteOrderItem,
        description: '<p>删除订单商品信息--下单前</p>'
    }
}, {
    method: 'put',
    path: '/order/item/cancel',
    config: {
        handler: cancelOrderItem,
        description: '<p>删除订单商品信息--下单后,有记录</p>'
    }
}, {
    method: 'GET',
    path: '/order/time',
    config: {
        handler: getOrderByTime,
        description: '<p>通过时间得到员工订单</p>',
    }
}, {
    method: 'post',
    path: '/order/recent',
    config: {
        handler: getOrderRencent,
        description: '<p>获取近期订单</p>'
    }
}, {
    method: 'GET',
    path: '/order/today',
    config: {
        handler: getOrderBytodayStaff,
        description: '<p>员工查看个人日结 === 结班</p>',
    }
}, {
    method: 'GET',
    path: '/order/today/test',
    config: {
        handler: getOrderBytodayStaff,
        description: '<p>日结</p>',
    }
}, {
    method: 'put',
    path: '/order/cancel',
    config: {
        handler: cancelOrder,
        description: '<p>cancel order by id--下单后删除订单, 需要进行记录</p>',
    }
}, {
    method: 'delete',
    path: '/order/delete',
    config: {
        handler: deleteOrder,
        description: '<p>cancel order by id--下单前删除,直接删除订单</p>',
    }
}, {
    method: 'put',
    path: '/order/desk',
    config: {
        handler: _order.orderDeskChange,
        description: '<p>change order desk by desk_id</p>',
    }
}, {
    method: 'put',
    path: '/order/desks',
    config: {
        handler: _order.orderDeskcombine,
        description: '<p>combine desks to one order</p>'
    }
}, {
    method: 'GET',
    path: '/orderitem/{order_item_id}',
    config: {
        handler: getOrderItemById,
        description: '<p>get order_item by _id</p>',
    }
}, {
    method: 'put',
    path: '/orderitem',
    config: {
        handler: updateOrderItemById,
        description: '<p>update order_item by _id</p>',
    }
}];
