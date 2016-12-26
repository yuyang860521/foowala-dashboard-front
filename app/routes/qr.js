/*
 * Author: Magic·Zhang <Magic@foowala.com>
 * Module description: 根据门店获取二维码路由
 */
const _qr = require('../helpers/qr_make'),
    message = require('../helpers/message'),
    _store = require('../services/store.service'),
    _staff = require('../services/staff.service');

const getStaffqr = (req, reply) => {
    const credentials = req.auth.credentials,
        store_id = credentials.store_id,
        msg = new message();
    const staff_str = 'store_id=' + store_id + '?register';
    _qr.createQrstr(staff_str)
        .then(ticket => {
            reply(msg.success('get ticket success', ticket));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('get ticket fail', err));
        })
}

const createStore = (req, reply) => {
    const msg = new message();
    let data = {
        name: req.payload.name,
        type: req.payload.type,
        address: {
            province: req.payload.province,
            city: req.payload.city,
            district: req.payload.district,
            address: req.payload.address
        }
    };
    let store_id;
    _store.create(data)
        .then(store => {
            store_id = store._id;
            const adminid = 'store_id=' + store_id + '?admin';
            return _qr.createQrstr(adminid);
        })
        .then(ticket => {
            reply(msg.success('get ticket success', ticket));
            let data = {};
            data.admin_qr = ticket;
            return _store.updatePromise(store_id, data)
        })
        .then(row => {
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('get ticket fail', err));
        })
}

const getAdminqr = (req, reply) => {
    const msg = new message(),
          _id = req.params.store_id;
    _store.getStoreByOrderIdPromise(_id)
          .then(result => {
            let admin_qr = result.admin_qr;
            if (admin_qr) {
                reply(msg.success("get store info success", admin_qr))
            }else{
                const adminid = 'store_id=' + _id + '?admin';
                _qr.createQrstr(adminid)
                   .then(ticket => {
                        reply(msg.success("get store info success", ticket))
                        let data = {};
                        data.admin_qr = ticket;
                        return _store.updatePromise(_id, data)
                   })
                   .then(row =>{})
                   .catch(err => {
                     reply(msg.unsuccess("get store info fail"))
                   })
            }
          })
          .catch(err => {
            reply(msg.unsuccess("get store info fail"))
          })
}

const getLoginqr = (req, reply) => {
    const uid = req.query.uid,
        msg = new message();
    _qr.createQRSCENE(uid)
        .then(ticket => {
            reply(msg.success('get ticket success', ticket));
        })
        .catch(err => {
            console.error(err);
            reply(msg.unsuccess('get ticket fail', err));
        })
}

module.exports = [{
    method: 'GET',
    path: '/staffqr',
    config: {
        handler: getStaffqr,
        description: '<p>得到门店的员工注册二维码</p>',
    }
}, {
    method: 'POST',
    path: '/adminqr',
    config: {
        handler: createStore,
        auth: false,
        description: '<p>创建门店并生成门店的管理员注册二维码</p>'
    }
},{
    method: 'GET',
    path: '/adminqr/{store_id}',
    config: {
        handler: getAdminqr,
        auth: false,
        description: '<p>得到门店的管理员注册二维码</p>'
    }
}, {
    method: 'GET',
    path: '/loginqr',
    config: {
        handler: getLoginqr,
        auth: false,
        description: '<p>得到门店的员工登录二维码</p>',
    }
}];
