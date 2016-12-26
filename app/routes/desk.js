/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: desk
 */

'use strict';

const message = require('../helpers/message'),
      async   = require('async'),
      _desk   = require('../services/desk.service'),
      _       = require('lodash'),
      _order  = require('../services/order.service');

const getDesk = (req, reply) => {
  const msg = new message(),
        credentials = req.auth.credentials,
        store_id = credentials.store_id;
  _desk.getDeskByStore(store_id)
       .then(result => {
         async.each(result, (rs, cb) => {
            async.each(rs.desk, (desk, callback)=>{
              if (desk.status === 3) {
                _order.countByDesk(desk._id)
                    .then(count => {
                      desk.order_count = count.length;
                      callback();
                    })
                    .catch(err => {
                      console.log(err)
                      callback();
                    })
              }else{
                callback();
              }
            }, err=>{
               rs.desk.sort((a, b) => a.number - b.number);
              cb()
            })
         }, err => {
          reply(msg.success('get desks success', result));
         })
       })
       .catch(err => {
         console.error(err)
         reply(msg.success('get desks fail'));
       })
},
insertDesk = (req, reply) => {
  var msg      = new message(),
      number   = req.payload.number,
      floor    = req.payload.floor,
      size     = req.payload.size ? req.payload.size : 4,
      credentials = req.auth.credentials,
      store_id = credentials.store_id;
  _desk.insert(number, store_id, floor, bo => {
    if(bo) return reply(msg.success('创建桌号成功！'));
    return reply(msg.unsuccess('创建桌号失败！'));
  });
},
/**
 * 此方法默认为开桌
 */
updateStatus = (req, reply) => {
  var msg = new message();
  var payload = req.payload;
  const credentials = req.auth.credentials;
  let data = {
    status: 1,  // 开桌状态
    _id: payload._id, //desk id
    people_number: Number(payload.number),
    store_id: credentials.store_id,
    open_id: credentials.open_id
  };
  _desk.updateStatus(data, (bo, desk) => {
    if(bo) {
      data.desk_number = desk.number;
      _order.insertOrder(data.store_id, data, (bool, order) => {
        if (bool) {
          reply(msg.success('open desk success'));
        }else{
          if (order) {
            reply(msg.unsuccess('此桌子已开'));
          }else{
            data.status = 0;
            _desk.updateStatus(data, (bo, desk)=>{
              reply(msg.unsuccess('开桌失败'));
            })
          }
        }
      })
    }else {
      reply(msg.unsuccess('get desk fail', 505))
    };
  })
},

cancelDesk = (req, reply) => {
  const desk_id = req.payload.desk_id,
        credentials = req.auth.credentials,
      store_id = credentials.store_id,
      msg = new message();
  _desk.cancelDesk(store_id, desk_id, (bo, desk) => {
    if(bo) {
      console.log('开始撤销订单,桌号',desk.number,'门店：', desk.store_id);
      _order.cancelOrder(store_id, desk_id, (bo, order) => {
        return reply(msg.success('桌号取消成功！', order));
      });
    } else {
      return reply(msg.unsuccess('桌号取消失败！'));
    }
  });
},

deleteDesk = (req, reply) => {
  const credentials = req.auth.credentials,
        store_id = credentials.store_id,
        _id = req.payload._id,
        msg = new message();
  _desk.deleteDesk(_id)
      .then(result =>{
        reply(msg.success('删除桌号成功！'));
      })
      .catch(err =>{
        reply(msg.unsuccess('删除桌号失败！'));
      })
},

updateDesk = (req, reply) => {
  var msg      = new message(),
      number   = req.payload.number,
      credentials = req.auth.credentials,
      store_id = credentials.store_id;
  _desk.update(number, store_id, bo => {
    if(bo) return reply(msg.success('修改桌号成功！'));
    return reply(msg.unsuccess('修改桌号失败！'));
  })
},
getDeskByFloor = (req, reply) => {
  const msg = new message(),
        credentials = req.auth.credentials,
        store_id = credentials.store_id,
        floor = req.query.num;
  _desk.getDeskByFloor(store_id, floor)
       .then(result => {
         reply(msg.success('get desks success', result));
       })
       .catch(err => {
         reply(msg.success('get desks fail'));
       })
};

/**
 * [divide the desk]
 * @param  {[type]} req   [description]
 * @param  {[type]} reply [description]
 * @return {[type]}       [description]
 */
const divideDesk = (req, reply) => {
  const msg = new message();
  const payload = req.payload;
  const credentials = req.auth.credentials;
  let data = {
    status: 3,  // 开桌状态
    _id: payload._id, //desk id
    people_number: Number(payload.number),
    store_id: credentials.store_id,
    open_id: credentials.open_id
  };
  _desk.updateStatus(data, (bo, desk) => {
    if(bo) {
      data.desk_number = desk.number;
      _order.insertOrderAgain(data.store_id, data, (bool, order) => {
        if (bool) {
          reply(msg.success('open desk success', order));
        }else{
          reply(msg.unsuccess('分桌失败'));
        }
      })
    }else {
      reply(msg.unsuccess('get desk fail', 505))
    };
  })
};

module.exports = [{
    method: 'get',
    path  : '/desk',
    config: {
        handler   : getDesk,
        description: '<p>得到门店中的所有桌号！</p>'
      },
    },{
    method: 'get',
    path  : '/desk/floor',
    config: {
        handler    : getDeskByFloor,
        description: '<p>得到门店中的所有桌号 by floor！</p>',
      }
    },{
    method: 'put',
    path  : '/desk/order/cancel',
    config: {
        handler    : cancelDesk,
        description: '<p>取消开桌状态,取消订单</p>'
      }
    },{
    method: 'delete',
    path  : '/desk/{desk_id}',
    config: {
        handler    : deleteDesk,
        description: '<p>删除桌子</p>'
      }
    },{
    method: 'post',
    path  : '/desk',
    config: {
        handler    : insertDesk,
        description: '<p>新增桌号</p>',
      }
    },{
    method: 'put',
    path  : '/desk/{_id}',
    config: {
        handler    : updateDesk,
        description: '<p>修改桌号</p>'
      }
    },{
      method: 'put',
      path: '/desk/status',
      config: {
        handler : updateStatus,
        description: '<p>开桌子</p>'
      }
    },{
      method: 'put',
      path: '/desk/divide',
      config: {
        handler : divideDesk,
        description: '<p>分桌</p>'
      }
    }];
