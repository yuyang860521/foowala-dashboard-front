/*
 * Author:  Magic<magic@foowala.com>
 * Module description: func route
 */
'use strict';

const message = require('../helpers/message'),
      mongoose = require('mongoose'),
      objectId = require('objectid'),
      async   = require('async'),
      func_mongo = mongoose.model('func'),
      mongo_helper = require('../helpers/mongo_helper');

const _func = new mongo_helper(func_mongo);

const getFunc = (req, reply) => {
  const msg = new message(),
        query = req.query;
  _func.findOne(query)
       .then(data => {
          reply(msg.success('get func success', data))
       })
       .catch(err => {
          console.log(err);
          reply(msg.unsuccess('get func fail', null))
       })
}

const insertFunc = (req, reply) => {
    const msg = new message(),
          payload = req.payload;
    _func.insert(payload)
         .then(data => {
            reply(msg.success('insert func success', data))
         })
         .catch(err => {
            console.log(err);
            reply(msg.unsuccess('insert func fail', null))
         })
}

module.exports = [{
    method: 'get',
    path: '/func',
    config: {
        auth:false,
        handler: getFunc,
        description: '<p>get func</p>',
    }
}, {
    method: 'post',
    path: '/func',
    config: {
        auth:false,
        handler: insertFunc,
        description: '<p>insert func</p>'
    }
}];
