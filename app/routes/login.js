/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 登陆 / 登出
 */

'use strict';

const message = require('../helpers/message'),
      _work  = require('../services/work.service'),
      _staff = require('../services/staff.service');

let uuid = 1;     // 验证身份递增数

const login = (req, reply) => {
  var staff = null,
      msg = new message();
  if (req.auth.isAuthenticated) {
    return reply(msg.success('你已登录！'));
  }

  staff = {
    store_id  : req.payload.store_id,
    job_number: req.payload.job_number,
    password  : req.payload.password
  };

  _staff.login(staff, (bo, staff) => {
    if(bo) {
      // console.log(staff);
      // 验证工作信息
      _work.intoWork(staff._id, (bo, status) => {
        if(bo) {
          // const sid = String(++uuid);
          // req.server.app.cache.set(sid, { account: staff }, 0, err => {

          //     if (err) return reply(err);

          //     req.cookieAuth.set({ sid: sid });
              // console.log(req.auth)
              if(status) reply(msg.success(['登陆成功！', '开始进入工作状态！'], null));
              else return reply(msg.success(['登陆成功！', '你还在工作状态中！'], null));
          // });
        }
        else {
          // req.yar.set('login_user', null);
          req.cookieAuth.clear();
          reply(msg.unsuccess(['登陆失败！', '工作状态初始化失败！'], null));
        }
      });
    }
    else reply(msg.unsuccess(['登陆失败！', '工号或密码错误！'], null));
  });
},

logout = (req, reply) => {
  var msg = new message();
  if (!req.auth || !req.auth.isAuthenticated) return reply(msg.success('未找到你的登陆状态！'));
  var login_user = req.auth.credentials;
  // 结束工作状态
  _work.quitWork(login_user.staff_id, (bo, work) => {
    if (bo) {
      reply(msg.success('loginout success', work));
    }else{
      reply(msg.success('loginout fail', null));
    }
  });
};

module.exports = [{
    method: ['GET', 'POST'],
    path  : '/login',
    config: {
        handler: login,
        plugins: { 'hapi-auth-cookie': { redirectTo: false } } ,
        description: '<p>员工/管理员登陆</p>'
      }
    }, {
    method: 'POST',
    path  : '/logout',
    config: {
        handler: logout,
        description: '<p>员工/管理员登出</p>'
      }
    }];
