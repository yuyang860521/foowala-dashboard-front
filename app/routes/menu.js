/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 菜单
 */
'use strict';

const message = require('../helpers/message'),
      _menu = require('../services/menu.service');

const getMenu = (req, reply) => {
  const credentials = req.auth.credentials,
      store_id = credentials.store_id,
      menu_id = req.params._id;
  _menu.getMenuById(menu_id, menu => {
    reply(menu);
  });
},

getMenuAll = (req, reply) => {
  const credentials = req.auth.credentials,
        store_id = credentials.store_id,
        msg = new message();
  _menu.getMenuByStoreNotDel(store_id, menus => {
    menus.sort((a, b) => {
      return b.menu.CreateTime - a.menu.CreateTime; 
    })
    reply(msg.success('get menu success', menus));
  });
},

getMenuDef = (req, reply) => {
  const credentials = req.auth.credentials,
        store_id = credentials.store_id;
  _menu.getMenuForDef(store_id, menus => {
    reply(menus);
  });
},

getMenuList = (req, reply) => {
  const credentials = req.auth.credentials,
        store_id = credentials.store_id,
      msg = new message();
  _menu.getMenuByStoreList(store_id, menu => {
    reply(msg.success('获取成功！', menu));
  });
},

insertMenu = (req, reply) => {
  var payload = JSON.parse(req.payload);
  const credentials = req.auth.credentials,
        store_id = credentials.store_id;
  var data = {
    store_id: store_id,
    name    : payload.name,
    order   : payload.order,
    printer_num: payload.printer_num ? payload.printer_num : 1
  },
  msg = new message();
  _menu.insert(data, (bo, menu) => {
    if(bo) reply(msg.success('新增菜单成功！', menu));
    else reply(msg.unsuccess('新增菜单失败！', null));
  });
},
deleteMenu = (req, reply) => {
  const _id = req.params._id,
        msg = new message();
  _menu.delete(_id, bo => {
    if(bo) reply(msg.success('删除菜单成功！', null));
    else reply(msg.unsuccess('删除菜单失败！', null));
  });
},

updateMenu = (req, reply) => {
  const credentials = req.auth.credentials,
        store_id = credentials.store_id,
        payload =  JSON.parse(req.payload),
        menu_id = payload.menu_id,
        msg = new message();
  let data = payload;
  delete data.menu_id;
  _menu.update(store_id, menu_id, data, (bo, menu) => {
    if(bo){
      _menu.getMenuByStoreList(store_id, menus => {
        reply(msg.success('修改菜单成功！', menus));
      });
    }
    else reply(msg.unsuccess('修改菜单失败！', null));
  });
},

updateMenuLable = (req, reply) => {
  const credentials = req.auth.credentials,
        store_id = credentials.store_id,
      payload = JSON.parse(req.payload),
      msg = new message();
  _menu.updateMenuLable(payload)
  .then(bo => {
    reply(msg.success('修改菜单备注成功！', bo));
  });
};

module.exports = [{
    method: 'get',
    path  : '/menu',
    config: {
        handler    : getMenuAll,
        description: '<p>获取all菜单！</p>'
      },
    },{
    method: 'get',
    path  : '/menu/{_id}',
    config: {
        handler    : getMenu,
        description: '<p>通过id获取菜单！</p>',
        validate: {
            query: {
                store_id: '583a5a9756dae8ef825dedab',
            }
        },
      },
    },{
    method: 'get',
    path  : '/menu/def',
    config: {
        handler    : getMenuDef,
        description: '<p>获取默认菜单！</p>',
        validate: {
            query: {
                store_id: '5762405281786a675b0fbc90',
            }
        },
      },
    },{
    method: 'get',
    path  : '/menu/list',
    config: {
        handler    : getMenuList,
        description: '<p>获取菜单！</p>',
        validate: {
            query: {
                store_id: '5762405281786a675b0fbc90',
            }
        },
      },
    },{
    method: 'delete',
    path  : '/menu/{_id}',
    config: {
        handler    : deleteMenu,
        description: '<p>删除菜单</p>',
      }
    },{
    method: 'post',
    path  : '/menu',
    config: {
        handler    : insertMenu,
        description: '<p>新增菜单</p>',
      }
    },{
    method: 'put',
    path  : '/menu',
    config: {
        handler    : updateMenu,
        description: '<p>修改菜单</p>'
      }
    },{
    method: 'put',
    path  : '/menu/label',
    config: {
        handler    : updateMenuLable,
        description: '<p>修改菜单备注</p>'
      }
    },{
    method: 'get',
    path  : '/insertmenu',
    config: {
        handler: (req, reply) => {
            reply('<!DOCTYPE html><html><head><meta charset="utf-8"><title>新增菜单</title></head><body><form class="" action="http://localhost:9023/menu" method="post"><label>name:</label><input type="text" name="name" value=""><br><label>order:</label><input type="text" name="order" value=""><br><button type="submit" name="button">提交</button></form></body></html>')
        },
        description: '<p>新增菜单</p>'
      }
    }];
