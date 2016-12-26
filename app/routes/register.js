/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 注册 / 修改密码
 */

'use strict';

const message = require('../helpers/message'),
      _staff  = require('../services/staff.service');

const register = (req, reply) => {
  var staff = {
    open_id   : req.payload.open_id,
    store_id  : req.payload.store_id,
    job_number: req.payload.job_number,
    is_admin  : req.payload.is_admin,
    password  : req.payload.password
  },
  msg = new message();
  _staff.register(staff, (bo, result) => {
    if(bo) {
      reply(msg.success('注册成功！', result))
    }else {
      reply(msg.unsuccess('注册失败！', null));
    }
  });
},
editorPassword = (req, reply) => {
  var model = {
        store_id    : req.query.store_id,
        job_number  : req.query.job_number,
        password    : req.query.password,
        new_password: req.query.new_password
      },
      msg = new message();
  _staff.editorPassword(model, (bo, staff) => {
    if(bo) reply(msg.success('密码修改成功！', null));
    else reply(msg.unsuccess('密码修改失败！', null));
  });
};

module.exports = [{
    method: 'post',
    path  : '/register',
    config: {
        auth:false,
        handler    : register,
        description: '<p>注册员工/管理员</p>',
        validate:{
          query: {
            store_id  : '门店ID',
            job_number: '员工工号',
            is_admin  : '是否为管理员，boolean',
            password  : '密码'
          }
        }
      }
    }, {
    method: 'put',
    path  : '/editorPassword',
    config: {
        handler    : editorPassword,
        plugins    : { 'hapi-auth-cookie': { redirectTo: false } },
        description: '<p>员工/管理员密码修改</p>'
      }
    }];
