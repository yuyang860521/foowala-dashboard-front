/*
 * Author: Magic <magic@foowala.com>
 * Module description: 用户信息路由
 */

'use strict';

const message = require('../helpers/message'),
    _uid = require('../services/uid.service'),
    _work = require('../services/work.service'),
    _staff = require('../services/staff.service');

const JWT = require('jsonwebtoken'); // used to sign our content
const secret = 'foowalapos';

const getUid = (req, reply) => {
    const msg = new message(),
        uid = req.params.uid;
    _uid.getUid(uid)
        .then(result => {
            if (result.isStaff) {
                _staff.getStaffByOpenid(result.open_id)
                .then(staff => {
                    const jwt_token = {
                        store_id: staff.store_id,
                        open_id: result.open_id
                    }
                    const token = JWT.sign(jwt_token, secret); // synchronous
                    let res = {};
                    res.uid = result.uid;
                    res._id = result._id;
                    res.open_id = result.open_id;
                    res.isLogin = result.isLogin;
                    res.token = token;
                    res.store_id = staff.store_id;
                    res.nickname = result.nickname;
                    reply(msg.success("get uid success", res));
                })
            }else{
                reply(msg.success("get uid success, uid not a staff", result));
            }
        })
        .catch(err => {
            reply(msg.success("get uid fail", { isLogin: 0 }));
        })
};

const saveUid = (req, reply) => {
    const msg = new message();
    let data = {};
    data.open_id = req.payload.open_id;
    data.staff_id = req.payload.staff_id;
    data.uid = req.payload.uid;
    data.isLogin = req.payload.isLogin;
    data.isStaff = req.payload.isStaff;
    data.nickname = req.payload.nickname;
    // console.log("data uid", data);
    _uid.saveUid(data)
        .then(result => {
            reply(msg.success('save uid success', result));
        })
        .catch(err => {
            reply(msg.unsuccess('save uid fail', err));
        })
}

module.exports = [{
    method: 'GET',
    path: '/uid/{uid}',
    config: {
        handler: getUid,
        auth: false,
        description: '<p>获取uid</p>'
    }
}, {
    method: 'POST',
    path: '/uid',
    config: {
        handler: saveUid,
        auth: false,
        description: '<p>add uid</p>'
    }
}, ];
