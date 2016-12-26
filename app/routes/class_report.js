/*
 * Author: Magic·Zhang <magic@foowala.com>
 * Module description: 结班 route
 */
'use strict';
const message = require('../helpers/message'),
    async = require('async'),
    ObjectId = require('objectid'),
    _order = require('../services/order.service'),
    _work = require('../services/work.service'),
    _report = require('../services/report.service');

const getClassReportListByTime = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    _report.getClassReportListByTime(store_id, staff_id)
        .then(result => {
            reply(msg.success('获取员工结班list by time success', result));
        })
        .catch(err => {
            console.error(err)
            reply(msg.unsuccess('获取员工结班list by time fail', null));
        })
}

const getClassReportOrderList = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
        _report.getReportLatest({store_id})
            .then(result => {
                const time = new Date();
                const open_time = result.open_time,
                    report_id = result._id;
                return _report.getClassReportOrderList(report_id, store_id, staff_id, open_time)
            })
            .then(results => {
                reply(msg.success('获取员工结班--订单列表信息成功', results));
            })
            .catch(err => {
                console.error(err);
                reply(msg.unsuccess('获取员工--订单列表信息失败', null));
            })
};

const getClassReportOrderListByWorkId = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    let work_id = req.params.work_id;
    work_id = JSON.parse(work_id);
    _report.getReportByWorkId(work_id)
        .then(result => {
            const time = new Date();
            const open_time = result.open_time ? result.open_time : time,
                  report_id = result._id;
            return _report.getClassReportOrderListByWorkId(report_id, store_id, staff_id, open_time, work_id)
        })
        .then(results => {
            reply(msg.success('通过work_id获取获取员工结班--订单列表信息成功', results));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('通过work_id获取获取员工--订单列表信息失败', null));
        })
}

const getClassReportClearing = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    let work_id;
    _work.getWorkByStaffPromise(staff_id)
        .then(work => {
            work_id = work._id;
            return _report.getReportLatest({store_id})
        })
        .then(result => {
            const report_id = result._id,
                  open_time = result.open_time;
            return _report.getClassReportClearing(report_id, store_id, staff_id, open_time, work_id);
        })
        .then(results => {
            reply(msg.success('获取结班清单成功', results));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('获取结班清单失败', null));
        })
}

const getClassReportClearingByWorkId = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    let work_id = req.params.work_id;
    work_id = JSON.parse(req.params.work_id);
    _report.getReportByWorkId(work_id)
        .then(result => {
            const report_id = result._id,
                open_time = result.open_time;
            return _report.getClassReportClearing(report_id, store_id, staff_id, open_time, work_id);
        })
        .then(results => {
            reply(msg.success('通过work_id获取获取结班清单成功', results));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('通过work_id获取获取结班清单失败', null));
        })
}

module.exports = [{
    method: 'get',
    path: '/report/class/list',
    config: {
        handler: getClassReportListByTime,
        description: '<p>员工结班列表--按时间分类</p>'
    }
}, {
    method: 'get',
    path: '/report/class/orderlist',
    config: {
        handler: getClassReportOrderList,
        description: '<p>员工结班--订单列表</p>'
    }
}, {
    method: 'get',
    path: '/report/class/orderlist/{work_id}',
    config: {
        handler: getClassReportOrderListByWorkId,
        description: '<p>通过work_id获取员工结班--订单列表</p>'
    }
}, {
    method: 'get',
    path: '/report/class/clearing',
    config: {
        handler: getClassReportClearing,
        description: '<p>员工结班--清单</p>'
    }
}, {
    method: 'get',
    path: '/report/class/clearing/{work_id}',
    config: {
        handler: getClassReportClearingByWorkId,
        description: '<p>通过work_id获取员工结班--清单</p>'
    }
}];
