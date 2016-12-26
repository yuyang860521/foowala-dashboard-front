/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 商品 / 菜
 */

'use strict';

const message   = require('../helpers/message'),
      _product  = require('../services/product.service');

var getProduct = (req, reply) => {
  var _id = req.params.id;
  _product.getProductById(_id, product => {
    reply(product);
  });
},
getProductMenu = (req, reply) => {

    const menu_id = req.params.menu_id;

    _product.getProductByMenu(menu_id, products => {
        reply(products);
    });
},
insertProduct = (req, reply) => {
  var payload = JSON.parse(req.payload);
  var data = {
    name      : payload.name,
    menu_id   : payload.menu_id,
    price     : payload.price,
    unit      : payload.unit,
  },
  msg = new message();

  _product.insert(data, (bo, product) => {
    if(bo) reply(msg.success('添加成功！', product));
    else reply(msg.unsuccess('添加失败！', null));
  });

},
updateProduct = (req, reply) => {
  var payload = JSON.parse(req.payload);
  var _id = payload._id,
  data = {
    name      : payload.name,
    price     : payload.price,
    unit      : payload.unit
  },
  msg = new message();

  _product.update(_id, data, bo => {
    if(bo) reply(msg.success('修改成功！', null));
    else reply(msg.unsuccess('修改失败！', null));
  });
},
deleteProduct = (req, reply) => {
  var _id = req.params._id,
      msg = new message();

  _product.delete(_id, bo => {
    if(bo) reply(msg.success('删除成功！', null));
    else reply(msg.unsuccess('删除失败！', null));
  });
};


module.exports = [{
    method: 'get',
    path  : '/product/{id}',
    config: {
        handler    : getProduct,
        description: '<p>获取商品详情</p>'
      }
    },{
    method: 'get',
    path  : '/product/menu/{menu_id}',
    config: {
        handler    : getProductMenu,
        description: '<p>通过菜单获取商品</p>',
        validate: {
            query: {
                menu_id: '',
            }
        },
      }
    },{
    method: 'post',
    path  : '/product',
    config: {
        handler    : insertProduct,
        description: '<p>新增商品</p>',
        validate: {
            query: {
                name: '商品名: string',
                menu_id: '菜单id: ObjectId',
                price: '商品价格: Number',
                unit: '份数: String',
                lab: '备注: [String]',
                img_url: '图片url: String',
                order: '价格: Number',
            }
        },
      }
    },{
    method: 'put',
    path  : '/product',
    config: {
        handler    : updateProduct,
        description: '<p>修改商品信息</p>',
        validate: {
            query: {
                id:'商品id',
                name: '商品名',
                menu_id: '菜单id',
                price: '商品价格',
                order: '价格',
            }
        },
      }
    },{
    method: 'delete',
    path  : '/product/{_id}',
    config: {
        handler    : deleteProduct,
        description: '<p>删除商品信息</p>',
        validate: {
            query: {
                store_id: '5762405281786a675b0fbc90',
                product: '',
            }
        },
      }
    },];
