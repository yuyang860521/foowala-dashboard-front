/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 统一消息发送
 */

// error code 编号机制
// 100+ 接收到请求，等待下一个请求
// 200+ 处理成功，有返回
// 300+ 重定向
// 400+ 请求错误
// 401  登陆超时
// 403  请求被拒绝
// 404  找不到
// 500  服务器出错
// 505  操作失败

'use strict';

var messageModel = function() {
  return {
    data     : [],
    status   : 0,
    errorcode: 0,
    count    : 0,
    msg      : '错误操作！',
    success  : (msg, data) => {
      console.log(m.getErrMsg("SUCCESS"));
      this.status    = 1;
      this.errorcode = 200;
      this.msg       = msg;
      if (data) {
        this.count     = data.length ? data.length : 0;
      }else{
        this.count     = 0;
      }
      this.data      = data;
      return this;
    },
    unsuccess: (msg, code, errData) => {
      this.status    = 0;
      if(errData) console.dir(errData);
      if(code) this.errorcode = code;
      else this.errorcode = 500;
      this.msg       = msg;
      return this;
    },
    unsuccess2: (sign) => {
      return m.getErrMsg(sign)
    }
  };
};

var m = (function() {
    let conf = {
        msg: {
            MSG_SUCCESS: {
                status: 1,
                code: 0,
                errormsg: '操作成功'
            },
            MSG_ERROR: {
                status: 0,
                code: -1,
                errmsg: '操作失败'
            },
            MSG_100001: {
                status: 0,
                code: 100001,
                errmsg: '该用户名已存在'
            },
            MSG_100002: {
                status: 0,
                code: 100002,
                errmsg: '用户名只可以修改一次'
            },
            MSG_100003: {
                status: 0,
                code: 100003,
                errmsg: '初始密码输入错误'
            },
            MSG_ERROR: {
                status: 0,
                code: -1,
                errmsg: '操作失败'
            }
        }
    }

    return {
        getErrMsg: function(sign) {
            return conf['msg']['MSG_'+sign] ? conf['msg']['MSG_'+sign] : null
        }
    }
})()

module.exports = messageModel;
