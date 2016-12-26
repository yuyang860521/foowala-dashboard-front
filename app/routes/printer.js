/*
 * Author: Magic·Zhang <magic@foowala.com>
 * Module description: printer route
 */

'use strict';

const message = require('../helpers/message'),
      _printer = require('../services/printer.service'),
      _report = require('../services/report.service'),
      async = require('async');

const getPreprintOrder = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    let result= {};
    let options = req.params;
    _printer.getPreprintOrder(options)
            .then(data => {
                reply(msg.success('get reprinter success', data));
            })
            .catch(err => {
                reply(msg.unsuccess('get reprinter fail', null));
            })
};

const getPrintClear = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        option = req.params,
        msg = new message();
    _printer.getPrintClear(option)
            .then(data => {
                reply(msg.success('get clear printer success', data));
            })
            .catch(err => {
                reply(msg.unsuccess('get clear printer fail', null));
            })
};

const getPrintOrderisAdd = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        option = req.params,
        msg = new message();
    _printer.getPrintOrderisAdd(option)
            .then(data => {
                reply(msg.success('get printer order is add success', data));
            })
            .catch(err => {
                reply(msg.unsuccess('get printer fail', null));
            })
}

const getPrintClassReport = (req, reply) => {
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
            return _report.getClassReportClearing(report_id, store_id, staff_id, open_time);
        })
        .then(results => {
            reply(msg.success('通过work_id获取获取结班清单成功', results));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('通过work_id获取获取结班清单失败', null));
        })
}

const getPrintReportDay = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        report_id = req.params.report_id,
        msg = new message();
    _report.getPrintReportDay(store_id, report_id)
            .then(data => {
                reply(msg.success('get printer day report success', data));
            })
            .catch(err => {
                reply(msg.unsuccess('get printer day report fail', null));
            })
}


module.exports = [{
    method: 'get',
    path: '/printer/preprint/{order_id}',
    config: {
        handler: getPreprintOrder,
        description: '<p>预打印</p>'
    }
},{
    method: 'get',
    path: '/printer/clear/{order_id}',
    config: {
        handler: getPrintClear,
        description: '<p>结账打印</p>'
    }
},{
    method: 'get',
    path: '/printer/products/add/{order_id}',
    config: {
        handler: getPrintOrderisAdd,
        description:'<p>打印追加菜品</p>'
    }
},{
    method: 'GET',
    path: '/printer/report/class/{date}',
    config: {
        handler: getPrintClassReport,
        description:'<p>打印员工结班</p>'
    }
},{
    method: 'GET',
    path: '/printer/report/day/{report_id}',
    config: {
        handler: getPrintReportDay,
        description: '<p>printer report day</p>'
    }
}];
