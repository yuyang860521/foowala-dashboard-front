/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 首页
 */

'use strict';

const handling_get    = (request, reply) => {
        reply({movies: [{
        	msg: 'fuck u react'
        }, {
        	msg: 'fuck u react1'
        }, {
        	msg: 'fuck u react2'
        }, {
        	msg: 'fuck u react3'
        }, {
        	msg: 'fuck u react4'
        }]
    });
};


module.exports = [{
    method: 'get',
    path  : '/',
    config: {
        auth:false,
        handler    : handling_get,
        description: '<p>Foowala<br /><h3>Restful API</h3></p>'
      }
    }];
