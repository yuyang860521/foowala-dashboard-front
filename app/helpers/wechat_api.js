/*
 * Author: Magic·Zhang <Magic@foowala.com>
 * Module description: custome api of wechat
 */

const request_https = require('request');
const _token = require('./token');
const config = require('../../config/config');
const custom_url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=';

const wechat = {
  sendMessage:(data)=>{
    return new Promise((resolve, reject)=>{
      _token.getToken(config.qr.token)
          .then(accesstoken => {
              const token = JSON.parse(accesstoken).data,
                     url = custom_url + token;
              var options = {
                  headers: {"Connection": "close"},
                  url: url,
                  method: 'POST',
                  json:true,
                  body: data
              };
              request_https.post(options, (err, httpResponse, body) => {
                  resolve(body);
              })
          })
          .catch((err) => {
              if (err) {
                  console.error(err);
                  reject('send message fail');
              }
          })
    })
  }
}

module.exports = exports = wechat;
