/*
 * Author: Magic <magic@foowala.com>
 * Module description: 用户信息路由
 */

'use strict';

const message = require('../helpers/message'),
    _staff = require('../services/staff.service'),
    _store = require('../services/store.service'),
    _work = require('../services/work.service'),
    _uid = require('../services/uid.service'),
    mongoose = require('mongoose'),
    report_mongo = mongoose.model('report'),
    mongo_helper = require('../helpers/mongo_helper'),
    _report = new mongo_helper(report_mongo),
    _time = require('../helpers/time_help'),
    EventProxy = require('eventproxy');

const JWT = require('jsonwebtoken'); // used to sign our content
const secret = 'foowalapos';

const getStaffOpenid = (req, reply) => {
    var msg = new message();
    _staff.getStaffsOpenid()
        .then(openids => {
            // console.log(openids);
            reply(msg.success("get openids success", openids));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess("get openids unsuccess"));
        })
};

const getStaffByOpenid = (req, reply) => {
    const msg = new message(),
        open_id = req.params.open_id;
    _staff.getStaffByOpenid(open_id)
        .then(result => {
            const store_id = result.store_id,
                nickname = result.nickname,
                staff_id = result._id,
                isAdmin = result.isAdmin,
                jwt_token = {
                    store_id: store_id,
                    staff_id: staff_id,
                    open_id: open_id
                },
                token = JWT.sign(jwt_token, secret); // synchronous
            return reply(msg.success("get openids success", { store_id, staff_id, isAdmin, token, nickname }));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess("get openids unsuccess", null));
        })
}

const getStaffByOpenidLogin = (req, reply) => {
    const msg = new message(),
        open_id = req.query.open_id;
    let store_id, staff_id, nickname, job_number;
    const format_time = _time.getTimeDetail();
    let backData = {};
    _staff.getStaffByOpenid(open_id)
        .then(result => {
            backData.staff = result;
            store_id = result.store_id;
            staff_id = result._id;
            job_number = result.job_number;
            const jwt_token = {
                    store_id: store_id,
                    staff_id: staff_id,
                    open_id: open_id
                },
                token = JWT.sign(jwt_token, secret, {
                    expiresIn: '720h'
                }); // synchronous
            backData.isAdmin = result.isAdmin;
            backData.token = token;
            backData.nickname = result.nickname;
            backData.name = result.name;
            return _store.getStoreByIdPromise(store_id);
        })
        .then(result => {
            backData.store = result;
            reply(msg.success("get openids success", backData));
            const status = 0;
            return _report.insertBack({ store_id, status, format_time })
        })
        .then(report => {
            const report_id = report._id;
            return _work.intoWork({ staff_id, nickname, job_number, store_id, report_id })
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess("get openid fail"));
        })
}

const getStaffAndQr = (req, reply) => {
    const credentials = req.auth.credentials,
        store_id = credentials.store_id,
        msg = new message();
    let result = {},
        qr;
    _store.getStaffQr(store_id)
        .then(result => {
            qr = result;
            return _staff.getStaffInfo(store_id)
        })
        .then(staffs => {
            result.staff_qr = qr;
            result.store_id = store_id;
            result.staff_count = staffs.length;
            result.staff_info = staffs;
            reply(msg.success('get staff info success', result));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('get staff info fail'));
        })
}

const getStaffRgister = (req, reply) => {
    const credentials = req.auth.credentials,
        store_id = credentials.store_id,
        count = req.query.count,
        msg = new message();
    let result = {},
        qr;
    _staff.getStaffRgister(store_id, count)
        .then(results => {
            let data = {};
            data = result.data;
            // data.isRegister;
            reply(msg.success('get staffs when register success', results))
        })
        .catch(err => {
            console.log(err);
            reply(msg.unsuccess('get staffs when register fail', null))
        })
}

const initWork = (req, reply) => {
    const credentials = req.auth.credentials,
        staff_id = credentials.staff_id,
        msg = new message();
    _work.initWork(staff_id)
        .then((bo, res) => {
            reply(msg.success('success'))
        })
        .catch(err => {
            console.log(err);
        })
};

const deleteStaffById = (req, reply) => {
    const credentials = req.auth.credentials,
        msg = new message(),
        store_id = credentials.store_id,
        staff_id = req.payload.staff_id;
    _staff.delete(staff_id, (bo) => {
        if (bo) {
            reply(msg.success('delete staff success'))
        } else {
            reply(msg.unsuccess('delete staff fail'))
        }
    })
};


const getStaffsWorking = (req, reply) => {
    const credentials = req.auth.credentials,
        msg = new message(),
        store_id = credentials.store_id,
        staff_id = req.payload.staff_id;
    _work.getStaffsWorking(store_id, staff_id)
        .then(staffs => {
            const count = staffs.length;
            // reply()
        })
        .catch(err => {

        })
}

/* 
    用户登录-》账号密码方式 POST
    url: /staff/accountlogin
    params:
        username 用户名
        password 密码

    return JSON
*/
const getStaffByIdLogin = (req, reply) => {
    const msg = new message(),
        username = req.payload.username,
        password = req.payload.password;

    let ep = new EventProxy()
    _staff.getStaffByAccount(username, password, ep.doneLater("staffinfo"));

    ep.once("staffinfo", function(staffinfo) {
        if(staffinfo) {
            let staff_id = staffinfo._id,
                store_id = staffinfo.store_id,
                name = staffinfo.name,
                nickname = staffinfo.nickname,
                job_number = staffinfo.job_number,
                open_id = staffinfo.open_id,
                is_admin = staffinfo.is_admin,
                backData = {};
            const format_time = _time.getTimeDetail(),
                    jwt_token = { store_id: store_id, staff_id: staff_id, open_id: open_id },
                    status = 0;

            backData.isAdmin = is_admin;
            backData.token = JWT.sign(jwt_token, secret, {expiresIn: '720h'});
            backData.nickname = nickname;
            backData.name = name;

            _store.getStoreByIdCommon(store_id, ep.done("storeinfo"));//获取门店信息
            _report.insertBackCommon({ store_id, status, format_time }, ep.done("reportinfo"));//查询report信息

            ep.all("storeinfo", "reportinfo", function(storeinfo, reportinfo) {
                backData.store = storeinfo;
                let report_id = reportinfo._id;
                _work.intoWork({ staff_id, nickname, job_number, store_id, report_id }, ep.done("workinfo"));//新增员工日结账
            
                reply(msg.success("get userinfo success", backData));
            });
        } else {
            reply(msg.unsuccess2("100003"));
        }
    })

    ep.fail(function (err) {
        reply(msg.unsuccess("get userinfo fail"));
    });
}

/* 
    设置用户名，密码 PUT
    url: /staff/setnamepassword
    params:
        username 用户名
        password 密码

    return JSON
*/
const setNamePassword = (req, reply) => {
    let credentials = req.auth.credentials,
        msg = new message(),
        staff_id = credentials.staff_id,
        username = req.payload.username,
        password = req.payload.password;
    _staff.setNamePassword(staff_id, username, password)
        .then(results => {
            if (results.msg == 'exists') {
                reply(msg.unsuccess2('100001'));
            } else {
                reply(msg.success('success'));
            }
        })
        .catch(err => {
            console.log(err);
            reply(msg.unsuccess(err.message, null));
        })
}

/* 
    修改密码 PUT
    url: /staff/modifypwd
    params:
        password 用户现密码
        newpassword 用户新密码

    return JSON
*/
const editorPassword = (req, reply) => {
    const credentials = req.auth.credentials,
        msg = new message(),
        staff_id = credentials.staff_id,
        password = req.payload.password,
        newpassword = req.payload.newpassword;
    _staff.editorPassword(staff_id, password, newpassword)
        .then(results => {
            if(results.msg == 'uncorrect') {
                reply(msg.unsuccess2('100002'));
            } else {
                reply(msg.success('success'));
            }
        })
        .catch(err => {
            console.log(err);
            reply(msg.unsuccess(err.message, null));
        })
}



module.exports = [{
    method: 'GET',
    path: '/staffsopenid',
    config: {
        handler: getStaffOpenid,
        description: '<p>获取所有已注册用户的openid</p>'
    }
}, {
    method: 'GET',
    path: '/staff/{open_id}',
    config: {
        handler: getStaffByOpenid,
        description: '<p>通过openid获取员工</p>'
    }
}, {
    method: 'GET',
    path: '/staffInfo',
    config: {
        handler: getStaffAndQr,
        description: '<p>通过store_id获取员工信息和tikect</p>'
    }
}, {
    method: 'GET',
    path: '/staff/register',
    config: {
        handler: getStaffRgister,
        description: '<p>通过store_id获取员工注册信息</p>'
    }
}, {
    method: 'GET',
    path: '/staff/login',
    config: {
        auth: false,
        handler: getStaffByOpenidLogin,
        description: '<p>通过openid获取员工并初始work信息</p>'
    }
}, {
    method: 'POST',
    path: '/staff/work',
    config: {
        handler: initWork,
        description: '<p>通过store_id获取员工注册信息</p>'
    }
}, {
    method: "GET",
    path: "/staff/logincheck",
    config: {
        auth: false,
        handler: function(request, reply) {
            var connection = global.connection;
            connection.send(JSON.stringify({ isRegister: 0 }));
        }
    }
}, {
    method: 'delete',
    path: '/staff',
    config: {
        handler: deleteStaffById,
        description: '<p>通过id delete员工</p>'
    }
}, {
    method: 'GET',
    path: '/staffs/working',
    config: {
        handler: getStaffsWorking,
        description: '<p>获取所有还在上班的员工 除去正在查询的人</p>'
    }
}, {
    method: 'PUT',
    path: '/staff/setnamepassword',
    config: {
        handler: setNamePassword,
        description: '<p>设置用户名，密码</p>'
    }
}, {
    method: 'PUT',
    path: '/staff/modifypwd',
    config: {
        handler: editorPassword,
        description: '<p>修改密码</p>'
    }
}, {
    method: 'POST',
    path: '/staff/accountlogin',
    config: {
        auth: false,
        handler: getStaffByIdLogin,
        description: '<p>用户登录-》账号密码方式</p>'
    }
}];