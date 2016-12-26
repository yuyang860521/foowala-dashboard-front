/*
 * Author: Magic·Zhang <magic@foowala.com>
 * Module description: 日结 route
 */
'use strict';

const message = require('../helpers/message'),
    async = require('async'),
    ObjectId = require('objectid'),
    _order = require('../services/order.service'),
    _work = require('../services/work.service'),
    _time = require('../helpers/time_help'),
    _report = require('../services/report.service');

const getDayReportPreview = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    _report.getReportLatest({store_id})
           .then(result => {
                const report_id = result._id,
                      open_time = result.open_time;
                return _report.getDayReportPreview(report_id, store_id, staff_id, open_time);
           })
            .then(results => {
                reply(msg.success('获取日结预览信息成功', results));
            })
            .catch(err => {
                console.error(err);
                reply(msg.unsuccess('获取日结预览信息失败', null));
            })
};
/**
 * [预览保存&&反结方法]
 * @param  {[type]} req   [description]
 * @param  {[type]} reply [description]
 * @return {[type]}       [description]
 */
const saveDayReportPreview = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        report_id = req.params.report_id,
        msg = new message();
    _report.getReportById(store_id, report_id)
        .then(result => {
            const open_time = result.open_time;
            return _report.saveDayReportPreview(report_id, store_id, staff_id, open_time)
        })
        .then(results => {
            reply(msg.success('保存日结预览信息成功', results));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('保存日结预览信息失败', null));
        })
}

const getDayReportListInMonth = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    _report.getDayReportListInMonth(store_id, staff_id)
        .then(result => {
            reply(msg.success("get list success", result));
        })
        .catch(err => {
            console.log(err);
            reply(msg.unsuccess("get list fail", null));
        })
}

const getDayReportDefault = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    const timedetail = _time.getTimeDetail();
    const format_time = {};
    format_time.year = timedetail.year;
    format_time.month = timedetail.month;
    _report.getDayReportListByMonth(format_time, store_id)
        .then(result => {
            reply(msg.success("get list success", result));
        })
        .catch(err => {
            console.log(err);
            reply(msg.unsuccess("get list fail", null));
        })
}

const getDayReportListByMonth = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    const format_time = {};
    format_time.year = Number(req.query.year);
    format_time.month = Number(req.query.month);
    _report.getDayReportListByMonth(format_time, store_id)
        .then(result => {
            reply(msg.success("get report by month success", result));
        })
        .catch(err => {
            console.log(err);
            reply(msg.unsuccess("get report by month fail", null));
        })
}

const getDayReportCheck = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    const report_id = req.params.report_id,
          status = Number(req.query.status);
    if (status === 1) {
        _report.getReportByIdDonePreview(store_id, report_id)
            .then(result => {
                reply(msg.success("get report success", result));
            })
            .catch(err => {
                console.log(err);
                reply(msg.unsuccess("get report fail", null));
            })
    } else if (status === 0) {
        _report.getReportById(store_id, report_id)
            .then(result => {
                const report_id = result._id,
                    open_time = result.open_time;
                return _report.getDayReportPreview(report_id, store_id, staff_id, open_time);
            })
            .then(results => {
                reply(msg.success('获取日结预览信息成功', results));
            })
            .catch(err => {
                console.error(err);
                reply(msg.unsuccess('获取日结预览信息失败', null));
            })
    } else {
        reply(msg.unsuccess('you need send a status query', null));
    }
}

const getDayReportLatest = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        store_id = credentials.store_id,
        msg = new message();
    _report.getReportLatest({store_id})
           .then(result => {
               reply(msg.success("get reports latest", result));
           })
           .catch(err => {
               console.log(err);
               reply(msg.unsuccess("get report latest fail", null));
           })
}

module.exports = [{
    method: 'get',
    path: '/report/day/preview',
    config: {
        handler: getDayReportPreview,
        description: '<p>门店本日--日结预览</p>'
    }
}, {
    method: 'POST',
    path: '/report/day/{report_id}',
    config: {
        handler: saveDayReportPreview,
        description: '<p>门店日结预览后保存</p>'
    }
}, {
    method: 'get',
    path: '/report/day/check/{report_id}',
    config: {
        handler: getDayReportCheck,
        description: '<p>门店日结根据report_id查看</p>'
    }
}, {
    method: 'get',
    path: '/report/day/list/month',
    config: {
        handler: getDayReportListInMonth,
        description: '<p>门店日结列表月份</p>'
    }
}, {
    method: 'get',
    path: '/report/day/general/month',
    config: {
        handler: getDayReportListByMonth,
        description: '<p>通过月份获取门店日结概要</p>'
    }
}, {
    method: 'get',
    path: '/report/day/list/default',
    config: {
        handler: getDayReportDefault,
        description: '<p>门店日结默认概要--本月</p>'
    }
}, {
    method: 'get',
    path: '/report/day/lastest',
    config: {
        handler: getDayReportLatest,
        description: '<p>最新--门店日结</p>'
    }
}];
