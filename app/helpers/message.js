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
    }
  };
};

module.exports = messageModel;
