/*
 * Author: Magic·Zhang <Magic@foowala.com>
 * Module description: 根据门店获取二维码路由
 */
const message = require('../helpers/message'),
    _register_info = require('../services/register_info.service'),
    _store = require('../services/store.service'),
    _qr     = require('../helpers/qr_make'),
    config = require('../../config/config'),
    _wechat     = require('../helpers/wechat_api'),
    moment = require('moment'),
    localTime = require('moment-timezone');
const getRegisterInfo = (req, reply) => {
    const msg = new message(),
          query = req.query;
    _register_info.getRegister_info(query)
        .then(result => {
            reply(msg.success('get register info success', result))
        })
        .catch(err => {
            console.log(err)
            reply(msg.unsuccess('get register info fail', null))
        })
}

const saveRegisterInfo = (req, reply) => {
    const msg = new message(),
        payload = req.payload;
    const time = new Date().now,
        formate_time = localTime.tz(moment(time), "Asia/Shanghai").format('YYYY-MM-DD hh:mm:ss');
    payload.formate_time = formate_time;
    _register_info.saveRegister_info(payload)
        .then(result => {
            reply(msg.success('save register info success', result));
            let messageJson = {
                "touser": config.open_id.kf, 
                "msgtype": "text", 
                "text": {
                    "content": "商家"+ result.name +",电话号码为"+result.phone+"刚刚注册了pos系统，请到dashboard上查看。"
                }
            };
            return _wechat.sendMessage(messageJson)
        })
        .catch(err => {
            console.error(err);
            return reply(msg.unsuccess('save register info fail', null))
        })
}

const putRegisterInfo = (req, reply) => {
    const msg = new message(),
        payload = req.payload;
        _id = payload._id;
    const status = payload.status;
    let store_id;
    if (Number(status) === 2) {
        _register_info.getRegisterinfoById({_id})
              .then(result => {
                let data = {};
                data.principal = result.name;
                data.principal_phone = Number(result.phone);
                data.principal_email = result.email;
                data.name = result.store_name;
                data.type = result.store_type;
                data.register_info_id = _id;
                data.address = {};
                data.address.address = result.store_address;
                return _store.createByRegister(data);
              })
              .then(store => {
                store_id = store._id;
                const adminid = 'store_id=' + store_id + '?admin';
                return _qr.createQrstr(adminid);
              })
              .then(ticket => {
                let update_store = {};
                update_store.admin_qr = ticket;
                return _store.updatePromise(store_id, update_store)
              })
              .then(row => {
                return _register_info.putRgister_info({_id}, payload)
              })
              .then(result => {
                return reply(msg.success('创建门店成功', result));
              })
              .catch(err => {
                console.error(err);
                return reply(msg.unsuccess('失败', null))
               })
    }else if(Number(status) === 4){
        _register_info.delete({_id}, payload)
            .then(result => {
                return reply(msg.success('成功', result));
            })
            .catch(err => {
                console.error(err);
                return reply(msg.unsuccess('失败', null))
            })
    }else{
        _register_info.putRgister_info({_id}, payload)
            .then(result => {
                return reply(msg.success('成功', result));
            })
            .catch(err => {
                console.error(err);
                return reply(msg.unsuccess('失败', null))
            })
    }
}

module.exports = [{
    method: 'GET',
    path: '/register/info',
    config: {
        auth: false,
        handler: getRegisterInfo,
        description: '<p>获取所有注册人信息</p>'
    }
}, {
    method: 'POST',
    path: '/register/info',
    config: {
        auth: false,
        handler: saveRegisterInfo,
        description: '<p>创建注册人信息</p>'
    }
},{
    method: 'PUT',
    path: '/register/info',
    config: {
        auth: false,
        handler: putRegisterInfo,
        description: '<p修改注册人信息</p>'
    }
}];
