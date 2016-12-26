/*
 * Author: Magic·Zhang <Magic@foowala.com>
 * Module description: get token
 */

const message = require('../helpers/message'),
    fs = require('fs'),
    path = require('path'),
    config = require('../../config/config');

const getToken = (req, reply) => {
    const msg = new message();
    fs.readFile(path.join(config.root,'access_token.txt'), 'utf8', (err, data) => {
        if (err) console.log(err);
        reply(msg.success('get token success', data));
    });
}

module.exports = [{
    method: 'GET',
    path: '/accesstoken',
    config: {
        handler: getToken,
        description: '<p>得到access_token</p>',
    }
}];
