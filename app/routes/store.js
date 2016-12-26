/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 商店
 */

'use strict';

var message = require('../helpers/message'),
    _store  = require('../services/store.service'),
    _qr     = require('../helpers/qr_make');

var getStore = (req, reply) => {
  var staff = req.auth.credentials;
  _store.getStoreById(staff.store_id, store => {
    reply(store);
  })
},

insertStore = (req, reply) => {
  var msg = new message(),
      data = {
        name   : req.query.name,
    		type   : req.query.type,
    		address: {
    			  province: req.query.province,
    	     	city    : req.query.city,
    	     	district: req.query.district,
    	     	address : req.query.address
    		}
      };
  _store.selectStoreForName(data.name, bo => {
    if(bo){
      _store.insert(data, bo => {
        if(bo) return reply(msg.success('新增门店成功！'));
        return reply(msg.unsuccess('新增门店失败！'));
      })
    } else return reply(msg.unsuccess('该门店已经被申请！'));
  })
},

createStore = (req, reply) => {
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
            console.log(adminid);
            return _qr.createQrstr(adminid);
        })
        .then(ticket => {
            console.log(ticket);
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
},

updateStore = (req, reply) => {
  var id = req.query.id,
      msg = new message(),
      data = {
        name   : req.query.name,
    		type   : req.query.type,
    		address: {
    			  province: req.query.province,
    	     	city    : req.query.city,
    	     	district: req.query.district,
    	     	address : req.query.address
    		}
      }
  _store.update(data, bo => {
    if(bo) return reply(msg.success('修改门店信息成功！'));
    return reply(msg.unsuccess('修改门店信息失败！'));
  })
},
deleteStore = (req, reply) => {
  var msg = new message(),
      id  = req.params.id;

  _store.delete(id, bo => {
    if(bo) return reply(msg.success('删除门店信息成功！'));
    return reply(msg.unsuccess('删除门店信息失败！'));
  })
},

findStoreByName = (req, reply) =>{
  var msg = new message(),
      staff = req.query.store_name;
  // console.log(staff);
  _store.getStoreByName(staff, store => {
    if(store) {
      return reply(store);
    }else{
      return reply(msg.unsuccess('获取门店信息失败！'));
    }
  })
};

const getStoreInfo = (req, reply) => {
  var msg = new message(),
      credentials = req.auth.credentials,
      staff_id = credentials.staff_id,
      store_id = credentials.store_id;
  _store.getStoreByIdPromise(store_id)
        .then(store => {
           return reply(msg.success('获取门店信息成功！', store));
        })
        .catch(err => {
           return reply(msg.unsuccess('获取门店信息失败！'));
        })
}

const putStoreInfo = (req, reply) => {
  var msg = new message(),
      credentials = req.auth.credentials,
      staff_id = credentials.staff_id,
      store_id = credentials.store_id;
  /**
   * [payload description]
   * @type {name,principal,principal_phone}
   */
  var payload = req.payload;
  _store.updatePromise(store_id, payload)
        .then(store => {
           return reply(msg.success('修改门店信息成功！', store));
        })
        .catch(err => {
           return reply(msg.unsuccess('修改门店信息失败！'));
        })
}

const getStoreByRgisterId = (req, reply)=>{
  const query = req.params;
  const msg = new message();
  _store.getStoreByQuery(query)
        .then(store => {
          return reply(msg.success('获取门店信息成功!', store));
        })
        .catch(err => {
          console.error(err);
          return reply(msg.unsuccess('获取门店信息失败!'));
        })
}

module.exports = [{
    method: 'get',
    path  : '/store',
    config: {
        handler    : getStore,
        description: '<p>获取门店信息！</p>'
      }
    },{
    method: 'post',
    path  : '/store',
    config: {
        handler    : createStore,
        auth: false,
        description: '<p>注册门店信息！</p>'
      }
    },{
    method: 'put',
    path  : '/store',
    config: {
        handler    : updateStore,
        description: '<p>修改门店信息！</p>'
      }
    },{
      method: 'get',
      path: '/storename',
      config: {
        handler: findStoreByName,
        description: '<p>通过名字获取门店信息！</p>'
      }
    },{
      method: 'get',
      path: '/store/info',
      config: {
        handler: getStoreInfo,
        description: '<p>通过store_id获取门店信息</p>'
      }
    },{
      method: 'put',
      path: '/store/info',
      config: {
        handler: putStoreInfo,
        description: '<p>通过store_id修改门店信息</p>'
      }
    },{
      method: 'GET',
      path: '/store/register/{register_info_id}',
      config: {
        handler: getStoreByRgisterId,
        auth:false,
        description: '<p>通过RgisterId获取门店信息</p>'
      }
    }];
